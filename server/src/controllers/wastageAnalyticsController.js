
import mongoose from 'mongoose';
import Wastage from '../models/Wastage.js';

const PERIODS = {
  daily: { days: 7, unit: 'day' },
  weekly: { days: 56, unit: 'week' },
  monthly: { days: 365, unit: 'month' }
};

const round = value =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const getWastageAnalytics = async (req, res) => {
  try {
    const role = req.user.role;
    const period = req.query.period || 'daily';

    if (!PERIODS[period]) {
      return res.status(400).json({
        success: false,
        message: 'Period must be daily, weekly or monthly.'
      });
    }

    if (
      !['OWNER', 'BRANCH_MANAGER', 'FRANCHISE_MANAGER'].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view wastage analytics.'
      });
    }

    const match = {};

    if (role === 'OWNER') {
      if (req.query.branchId) {
        if (!mongoose.Types.ObjectId.isValid(req.query.branchId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid branch ID.'
          });
        }

        match.branchId = new mongoose.Types.ObjectId(req.query.branchId);
      }
    } else {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: 'No branch assigned to your account.'
        });
      }

      match.branchId = new mongoose.Types.ObjectId(
        req.user.branchId
      );
    }

    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setDate(
      currentStart.getDate() - PERIODS[period].days
    );

    const previousStart = new Date(currentStart);
    previousStart.setDate(
      previousStart.getDate() - PERIODS[period].days
    );

    const currentMatch = {
      ...match,
      wastageDate: { $gte: currentStart, $lte: now }
    };

    const previousMatch = {
      ...match,
      wastageDate: { $gte: previousStart, $lt: currentStart }
    };

    const [
      currentSummary,
      previousSummary,
      itemRanking,
      reasonBreakdown,
      trend,
      branchComparison
    ] = await Promise.all([

      Wastage.aggregate([
        { $match: currentMatch },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            totalLoss: { $sum: '$totalLoss' },
            totalItems: { $sum: { $size: '$items' } }
          }
        }
      ]),

      Wastage.aggregate([
        { $match: previousMatch },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            totalLoss: { $sum: '$totalLoss' }
          }
        }
      ]),

      Wastage.aggregate([
        { $match: currentMatch },
        { $unwind: '$items' },
        {
          $group: {
            _id: {
              itemType: '$items.itemType',
              itemId: {
                $cond: [
                  { $eq: ['$items.itemType', 'PRODUCT'] },
                  '$items.productId',
                  '$items.rawMaterialId'
                ]
              },
              name: '$items.productName',
              reason: '$items.reason',
              unitCost: '$items.unitCost'
            },
            totalQuantity: { $sum: '$items.quantity' },
            totalLoss: { $sum: '$items.totalLoss' },
            occurrences: { $sum: 1 }
          }
        },
        { $sort: { totalLoss: -1 } },
        { $limit: 10 }
      ]),

      Wastage.aggregate([
        { $match: currentMatch },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.reason',
            totalLoss: { $sum: '$items.totalLoss' },
            totalQuantity: { $sum: '$items.quantity' },
            occurrences: { $sum: 1 }
          }
        },
        { $sort: { totalLoss: -1 } }
      ]),

      Wastage.aggregate([
        { $match: currentMatch },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: '$wastageDate',
                unit: PERIODS[period].unit
              }
            },
            totalLoss: { $sum: '$totalLoss' },
            records: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      role === 'OWNER'
        ? Wastage.aggregate([
            {
              $match: {
                wastageDate: {
                  $gte: currentStart,
                  $lte: now
                }
              }
            },
            {
              $group: {
                _id: '$branchId',
                totalLoss: { $sum: '$totalLoss' },
                records: { $sum: 1 }
              }
            },
            {
              $lookup: {
                from: 'branches',
                localField: '_id',
                foreignField: '_id',
                as: 'branch'
              }
            },
            {
              $unwind: {
                path: '$branch',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 1,
                branchName: '$branch.name',
                city: '$branch.city',
                totalLoss: 1,
                records: 1
              }
            },
            { $sort: { totalLoss: -1 } }
          ])
        : Promise.resolve([])
    ]);

    const current = currentSummary[0] || {
      totalRecords: 0,
      totalLoss: 0,
      totalItems: 0
    };

    const previous = previousSummary[0] || {
      totalRecords: 0,
      totalLoss: 0
    };

    let reductionPercentage = null;

    if (previous.totalLoss > 0) {
      reductionPercentage = round(
        ((previous.totalLoss - current.totalLoss) /
          previous.totalLoss) * 100
      );
    }

    const result = {
      period,
      startDate: currentStart,
      endDate: now,

      summary: {
        totalRecords: current.totalRecords,
        totalItems: current.totalItems,
        totalLoss: round(current.totalLoss),
        previousPeriodLoss: round(previous.totalLoss),
        lossChange: round(
          current.totalLoss - previous.totalLoss
        ),
        reductionPercentage
      },

      mostWastedItems: itemRanking.map(item => ({
        itemType: item._id.itemType,
        itemId: item._id.itemId,
        name: item._id.name,
        reason: item._id.reason,
        quantity: round(item.totalQuantity),
        totalLoss: round(item.totalLoss),
        occurrences: item.occurrences
      })),

      reasonBreakdown: reasonBreakdown.map(item => ({
        reason: item._id,
        totalQuantity: round(item.totalQuantity),
        totalLoss: round(item.totalLoss),
        occurrences: item.occurrences
      })),

      trend: trend.map(item => ({
        date: item._id,
        totalLoss: round(item.totalLoss),
        records: item.records
      })),

      branchComparison: branchComparison.map(item => ({
        branchId: item._id,
        branchName: item.branchName || 'Unknown Branch',
        city: item.city || '',
        totalLoss: round(item.totalLoss),
        records: item.records
      }))
    };

    return res.status(200).json({
      success: true,
      message: 'Wastage analytics generated successfully.',
      analytics: result
    });

  } catch (error) {
    console.error('Wastage Analytics Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate wastage analytics.',
      error: error.message
    });
  }
};

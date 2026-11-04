
import mongoose from 'mongoose';

import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';
import Wastage from '../models/Wastage.js';
import Product from '../models/Product.js';
import Branch from '../models/Branch.js';
import StockTransfer from '../models/StockTransfer.js';

// Get date boundaries according to Indian Standard Time
const getDateRanges = () => {
  const now = new Date();

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);

  const dateParts = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  );

  const { year, month, day } = dateParts;

  const todayStart = new Date(
    `${year}-${month}-${day}T00:00:00+05:30`
  );

  const monthStart = new Date(
    `${year}-${month}-01T00:00:00+05:30`
  );

  const dateUTC = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day)
  ));

  const dayOfWeek = dateUTC.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;

  dateUTC.setUTCDate(
    dateUTC.getUTCDate() - daysSinceMonday
  );

  const weekDate = dateUTC.toISOString().slice(0, 10);

  const weekStart = new Date(
    `${weekDate}T00:00:00+05:30`
  );

  return {
    todayStart,
    weekStart,
    monthStart,
    now
  };
};


// GET DASHBOARD ANALYTICS
export const getDashboardAnalytics = async (req, res) => {
  try {
    const allowedRoles = [
      'OWNER',
      'BRANCH_MANAGER',
      'FRANCHISE_MANAGER'
    ];

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access dashboard analytics.'
      });
    }

    // Branch-level data isolation
    const branchQuery = {};
    let userBranchId = null;

    if (req.user.role !== 'OWNER') {
      if (
        !req.user.branchId ||
        !mongoose.Types.ObjectId.isValid(
          String(req.user.branchId)
        )
      ) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or missing branch assignment.'
        });
      }

      userBranchId = new mongoose.Types.ObjectId(
        String(req.user.branchId)
      );

      branchQuery.branchId = userBranchId;
    }

    const {
      todayStart,
      weekStart,
      monthStart,
      now
    } = getDateRanges();

    // Main dashboard queries
    const [
      todaySales,
      weeklySales,
      monthlySales,
      monthlyPurchases,
      monthlyWastage,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      inventorySummary,
      totalBranches
    ] = await Promise.all([

      // Today's sales
      Sale.aggregate([
        {
          $match: {
            ...branchQuery,
            saleDate: {
              $gte: todayStart,
              $lte: now
            }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ]),

      // Weekly sales
      Sale.aggregate([
        {
          $match: {
            ...branchQuery,
            saleDate: {
              $gte: weekStart,
              $lte: now
            }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ]),

      // Monthly sales
      Sale.aggregate([
        {
          $match: {
            ...branchQuery,
            saleDate: {
              $gte: monthStart,
              $lte: now
            }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ]),

      // Monthly purchases
      Purchase.aggregate([
        {
          $match: {
            ...branchQuery,
            purchaseDate: {
              $gte: monthStart,
              $lte: now
            }
          }
        },
        {
          $group: {
            _id: null,
            totalPurchases: { $sum: '$totalAmount' }
          }
        }
      ]),

      // Monthly wastage
      Wastage.aggregate([
        {
          $match: {
            ...branchQuery,
            wastageDate: {
              $gte: monthStart,
              $lte: now
            }
          }
        },
        {
          $group: {
            _id: null,
            totalLoss: { $sum: '$totalLoss' }
          }
        }
      ]),

      // Total products
      Product.countDocuments(branchQuery),

      // Low stock products
      Product.countDocuments({
        ...branchQuery,
        $expr: {
          $and: [
            { $gt: ['$stock', 0] },
            { $lte: ['$stock', '$minStock'] }
          ]
        }
      }),

      // Out of stock products
      Product.countDocuments({
        ...branchQuery,
        stock: 0
      }),

      // Inventory valuation
      Product.aggregate([
        {
          $match: branchQuery
        },
        {
          $group: {
            _id: null,
            totalUnits: { $sum: '$stock' },
            inventoryValue: {
              $sum: {
                $multiply: ['$stock', '$cost']
              }
            }
          }
        }
      ]),

      // Count accessible branches
      Branch.countDocuments(
        req.user.role === 'OWNER'
          ? {}
          : { _id: userBranchId }
      )
    ]);

    const today = todaySales[0] || {};
    const weekly = weeklySales[0] || {};
    const monthly = monthlySales[0] || {};
    const purchases = monthlyPurchases[0] || {};
    const wastage = monthlyWastage[0] || {};
    const inventory = inventorySummary[0] || {};

    // Branch-wise monthly performance.
    // Starting from Branch ensures branches with zero sales are included.
    const branchPerformance = await Branch.aggregate([
      {
        $match: req.user.role === 'OWNER'
          ? {}
          : { _id: userBranchId }
      },
      {
        $lookup: {
          from: 'sales',
          let: { currentBranchId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$branchId', '$$currentBranchId'] },
                    { $gte: ['$saleDate', monthStart] },
                    { $lte: ['$saleDate', now] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                totalSales: { $sum: '$totalAmount' },
                totalOrders: { $sum: 1 }
              }
            }
          ],
          as: 'salesData'
        }
      },
      {
        $project: {
          _id: 0,
          branchId: '$_id',
          branchName: '$name',
          city: '$city',
          totalSales: {
            $ifNull: [
              { $arrayElemAt: ['$salesData.totalSales', 0] },
              0
            ]
          },
          totalOrders: {
            $ifNull: [
              { $arrayElemAt: ['$salesData.totalOrders', 0] },
              0
            ]
          }
        }
      },
      {
        $sort: {
          totalSales: -1
        }
      }
    ]);

    // Recent activity branch filters
    const transferQuery = req.user.role === 'OWNER'
      ? {}
      : {
          $or: [
            { sourceBranchId: userBranchId },
            { destinationBranchId: userBranchId }
          ]
        };

    // Fetch recent activities
    const [
      recentSales,
      recentPurchases,
      recentWastages,
      recentTransfers
    ] = await Promise.all([

      Sale.find(branchQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('branchId', 'name')
        .lean(),

      Purchase.find(branchQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('branchId', 'name')
        .lean(),

      Wastage.find(branchQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('branchId', 'name')
        .lean(),

      StockTransfer.find(transferQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('sourceBranchId', 'name')
        .populate('destinationBranchId', 'name')
        .lean()
    ]);

    // Combine and sort all activities
    const recentActivities = [
      ...recentSales.map(item => ({
        type: 'SALE',
        title: `Sale ${item.invoiceNumber}`,
        amount: item.totalAmount,
        branch: item.branchId?.name || 'Unknown',
        date: item.createdAt
      })),

      ...recentPurchases.map(item => ({
        type: 'PURCHASE',
        title: `Purchase ${item.purchaseNumber}`,
        amount: item.totalAmount,
        branch: item.branchId?.name || 'Unknown',
        date: item.createdAt
      })),

      ...recentWastages.map(item => ({
        type: 'WASTAGE',
        title: `Wastage ${item.wastageNumber}`,
        amount: item.totalLoss,
        branch: item.branchId?.name || 'Unknown',
        date: item.createdAt
      })),

      ...recentTransfers.map(item => ({
        type: 'STOCK_TRANSFER',
        title: `Transfer ${item.transferNumber}`,
        source: item.sourceBranchId?.name || 'Unknown',
        destination: item.destinationBranchId?.name || 'Unknown',
        status: item.status,
        date: item.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Final dashboard response
    return res.status(200).json({
      success: true,

      dashboard: {
        overview: {
          todaySales: today.totalSales || 0,
          todayOrders: today.totalOrders || 0,

          weeklySales: weekly.totalSales || 0,
          weeklyOrders: weekly.totalOrders || 0,

          monthlySales: monthly.totalSales || 0,
          monthlyOrders: monthly.totalOrders || 0
        },

        inventory: {
          totalProducts,
          totalUnits: inventory.totalUnits || 0,
          inventoryValue: inventory.inventoryValue || 0,
          lowStockProducts,
          outOfStockProducts
        },

        operations: {
          monthlyPurchases: purchases.totalPurchases || 0,
          monthlyWastageLoss: wastage.totalLoss || 0
        },

        branches: {
          totalBranches,
          performance: branchPerformance
        },

        recentActivities,

        period: {
          timezone: 'Asia/Kolkata',
          today: todayStart,
          weekStart,
          monthStart
        }
      }
    });

  } catch (error) {
    console.error('Dashboard Analytics Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics.'
    });
  }
};

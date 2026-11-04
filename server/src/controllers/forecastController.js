
import mongoose from "mongoose";

import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Recipe from "../models/Recipe.js";
import Branch from "../models/Branch.js";

import { getWeatherForecast } from "../services/weatherService.js";

import {
  getUpcomingFestivals,
  getFestivalAdjustment,
} from "../services/festivalService.js";

import {
  notifyBranchUsersOnceDaily,
} from "../services/notificationService.js";

const DAYS_RECENT = 7;
const DAYS_PREVIOUS = 21;
const FORECAST_DAYS = 7;

const MAX_WEATHER_ADJUSTMENT = 0.10;
const MAX_FESTIVAL_ADJUSTMENT = 0.10;

const roundToTwo = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const normalizeText = (value) =>
  String(value || "").toLowerCase().trim();

const getWeatherAdjustment = (product, weather) => {
  const name = normalizeText(product.name);
  const category = normalizeText(product.category);
  const text = `${name} ${category}`;

  const days = weather?.forecast || [];

  if (days.length === 0) {
    return {
      multiplier: 1,
      adjustmentPercent: 0,
      reason: "Weather data unavailable",
    };
  }

  const averageTemperature =
    days.reduce(
      (total, day) =>
        total + (Number(day.temperatureMax) || 0),
      0
    ) / days.length;

  const totalRainfall = days.reduce(
    (total, day) => total + (Number(day.rainfall) || 0),
    0
  );

  const rainyDays = days.filter(
    (day) => (Number(day.rainfall) || 0) >= 2
  ).length;

  let adjustment = 0;
  const reasons = [];

  const coldDrinkSignals = [
    "beverage",
    "drink",
    "juice",
    "shake",
    "lassi",
    "cold coffee",
    "ice cream",
    "icecream",
  ];

  const hotFoodSignals = [
    "soup",
    "tea",
    "coffee",
    "chai",
  ];

  const containsSignal = (signals) =>
    signals.some((signal) => text.includes(signal));

  if (averageTemperature >= 32 && containsSignal(coldDrinkSignals)) {
    adjustment += 0.08;
    reasons.push("Warmer weather may support cold-product demand");
  }

  if (averageTemperature <= 18 && containsSignal(hotFoodSignals)) {
    adjustment += 0.05;
    reasons.push("Cooler weather may support hot-product demand");
  }

  if (
    rainyDays >= 2 &&
    containsSignal(["soup", "tea", "chai", "coffee", "snacks", "pakora"])
  ) {
    adjustment += 0.05;
    reasons.push("Rainy conditions may affect this product category");
  }

  adjustment = Math.max(
    -MAX_WEATHER_ADJUSTMENT,
    Math.min(MAX_WEATHER_ADJUSTMENT, adjustment)
  );

  return {
    multiplier: 1 + adjustment,
    adjustmentPercent: roundToTwo(adjustment * 100),
    averageTemperature: roundToTwo(averageTemperature),
    totalRainfall: roundToTwo(totalRainfall),
    rainyDays,
    reason: reasons.length
      ? reasons.join("; ")
      : "No matching product-specific weather rule",
  };
};

export const getDemandForecast = async (req, res) => {
  try {
    const allowedRoles = ["OWNER", "BRANCH_MANAGER"];

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access demand forecasting.",
      });
    }

    let branchId;

    if (req.user.role === "OWNER") {
      branchId = req.query.branchId;

      if (!branchId) {
        return res.status(400).json({
          success: false,
          message: "Please provide a branchId for forecasting.",
        });
      }
    } else {
      branchId = String(req.user.branchId || "");

      if (!branchId) {
        return res.status(403).json({
          success: false,
          message: "No branch is assigned to this user.",
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID.",
      });
    }

    const branchObjectId = new mongoose.Types.ObjectId(branchId);

    const branch = await Branch.findById(branchObjectId)
      .select("name city type");

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found.",
      });
    }

    const now = new Date();

    const recentStart = new Date(
      now.getTime() - DAYS_RECENT * 24 * 60 * 60 * 1000
    );

    const previousStart = new Date(
      now.getTime() -
        (DAYS_RECENT + DAYS_PREVIOUS) * 24 * 60 * 60 * 1000
    );

    let weather = null;
    let weatherWarning = null;

    try {
      weather = await getWeatherForecast(branch.city);
    } catch (error) {
      console.error("Branch Weather Fetch Failed:", error.message);

      weatherWarning = {
        message:
          "Weather data is unavailable. Historical sales forecasting is continuing without weather adjustments.",
      };
    }

    const salesHistory = await Sale.aggregate([
      {
        $match: {
          branchId: branchObjectId,
          saleDate: {
            $gte: previousStart,
            $lte: now,
          },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          recentQuantity: {
            $sum: {
              $cond: [
                { $gte: ["$saleDate", recentStart] },
                "$items.quantity",
                0,
              ],
            },
          },
          previousQuantity: {
            $sum: {
              $cond: [
                { $lt: ["$saleDate", recentStart] },
                "$items.quantity",
                0,
              ],
            },
          },
          totalQuantity: { $sum: "$items.quantity" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const historyMap = new Map(
      salesHistory.map((item) => [String(item._id), item])
    );

    const [products, recipes] = await Promise.all([
      Product.find({
        branchId: branchObjectId,
      }).select("name sku category stock minStock sellingPrice"),

      Recipe.find({
        branchId: branchObjectId,
        isActive: true,
      }).populate(
        "ingredients.rawMaterialId",
        "name sku unit currentStock minimumStock purchasePrice"
      ),
    ]);

    const recipeMap = new Map(
      recipes.map((recipe) => [String(recipe.productId), recipe])
    );

    const festivals = getUpcomingFestivals(now, FORECAST_DAYS);
    const festivalAdjustment = getFestivalAdjustment(festivals);

    const rawMaterialRequirements = new Map();

    const productForecasts = products.map((product) => {
      const history = historyMap.get(String(product._id));

      const recentQuantity = history?.recentQuantity || 0;
      const previousQuantity = history?.previousQuantity || 0;

      const recentDailyAverage = recentQuantity / DAYS_RECENT;
      const previousDailyAverage = previousQuantity / DAYS_PREVIOUS;

      const weightedDailyDemand =
        recentDailyAverage * 0.7 +
        previousDailyAverage * 0.3;

      const basePredictedDemand = Math.max(
        0,
        roundToTwo(weightedDailyDemand * FORECAST_DAYS)
      );

      const weatherAdjustment = getWeatherAdjustment(product, weather);

      const weatherAdjustedDemand =
        basePredictedDemand * weatherAdjustment.multiplier;

      const festivalAdjustedDemand =
        weatherAdjustedDemand * festivalAdjustment.multiplier;

      const predictedDemand = Math.max(
        0,
        roundToTwo(festivalAdjustedDemand)
      );

      const preparationQuantity = Math.ceil(predictedDemand);

      const recipe = recipeMap.get(String(product._id));
      const ingredients = [];

      if (recipe) {
        for (const ingredient of recipe.ingredients) {
          const material = ingredient.rawMaterialId;

          if (!material) continue;

          const requiredQuantity =
            preparationQuantity * ingredient.quantity;

          const materialId = String(material._id);
          const existing = rawMaterialRequirements.get(materialId);

          if (existing) {
            existing.requiredQuantity += requiredQuantity;
          } else {
            rawMaterialRequirements.set(materialId, {
              rawMaterialId: materialId,
              name: material.name,
              sku: material.sku,
              unit: material.unit,
              currentStock: material.currentStock,
              minimumStock: material.minimumStock,
              purchasePrice: material.purchasePrice,
              requiredQuantity,
            });
          }

          ingredients.push({
            rawMaterialId: materialId,
            name: material.name,
            unit: material.unit,
            quantityPerProduct: ingredient.quantity,
            requiredQuantity: roundToTwo(requiredQuantity),
          });
        }
      }

      const totalHistoricalSales = history?.totalQuantity || 0;

      let confidence = "Low";

      if (totalHistoricalSales >= 50) {
        confidence = "High";
      } else if (totalHistoricalSales >= 15) {
        confidence = "Medium";
      }

      return {
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        currentStock: product.stock,
        recentSales: roundToTwo(recentQuantity),
        previousSales: roundToTwo(previousQuantity),

        basePredictedDemand,
        weatherAdjustment,
        festivalAdjustment: {
          adjustmentPercent: festivalAdjustment.adjustmentPercent,
          festivals: festivalAdjustment.names,
          multiplier: festivalAdjustment.multiplier,
        },

        predictedDailyDemand: roundToTwo(
          predictedDemand / FORECAST_DAYS
        ),
        predictedDemand,
        preparationQuantity,
        historicalSales: totalHistoricalSales,
        confidence,
        hasRecipe: Boolean(recipe),
        ingredients,
      };
    });

    const rawMaterials = Array.from(
      rawMaterialRequirements.values()
    ).map((material) => {
      const requiredQuantity = roundToTwo(
        material.requiredQuantity
      );

      const shortage = Math.max(
        0,
        roundToTwo(requiredQuantity - material.currentStock)
      );

      return {
        rawMaterialId: material.rawMaterialId,
        name: material.name,
        sku: material.sku,
        unit: material.unit,
        currentStock: material.currentStock,
        minimumStock: material.minimumStock,
        requiredQuantity,
        shortage,
        purchaseRecommendation: shortage,
        estimatedPurchaseCost: roundToTwo(
          shortage * material.purchasePrice
        ),
        stockStatus:
          shortage > 0
            ? "SHORTAGE"
            : material.currentStock <= material.minimumStock
              ? "LOW_STOCK"
              : "SUFFICIENT",
      };
    });

    const productsWithoutRecipes = productForecasts.filter(
      (product) =>
        product.preparationQuantity > 0 && !product.hasRecipe
    );

    const warnings = productsWithoutRecipes.map((product) => ({
      productId: product.productId,
      productName: product.productName,
      message:
        "No active recipe found. Ingredient requirements cannot be calculated.",
    }));

    if (weatherWarning) {
      warnings.push(weatherWarning);
    }

    // Generate forecast notifications without failing the forecast response.
    try {
      const alertTasks = [];

      // Product demand is greater than available finished-product stock.
      const highDemandProducts = productForecasts.filter(
        (product) =>
          product.predictedDemand > 0 &&
          product.preparationQuantity > Number(product.currentStock || 0)
      );

      for (const product of highDemandProducts) {
        const shortage = roundToTwo(
          product.preparationQuantity - Number(product.currentStock || 0)
        );

        alertTasks.push(
          notifyBranchUsersOnceDaily({
            branchId: branchObjectId,
            type: "FORECAST",
            severity: Number(product.currentStock || 0) === 0
              ? "CRITICAL"
              : "WARNING",
            title: "High product demand predicted",
            message: `${product.productName}: forecast demand is ${product.preparationQuantity}, but available stock is ${product.currentStock}. Estimated shortage: ${shortage}.`,
            entityType: "Product",
            entityId: product.productId,
            metadata: {
              productName: product.productName,
              predictedDemand: product.predictedDemand,
              preparationQuantity: product.preparationQuantity,
              currentStock: product.currentStock,
              shortage,
              forecastDays: FORECAST_DAYS,
            },
          })
        );
      }

      // Raw-material requirement is greater than current raw-material stock.
      const shortageMaterials = rawMaterials.filter(
        (material) => material.stockStatus === "SHORTAGE"
      );

      for (const material of shortageMaterials) {
        alertTasks.push(
          notifyBranchUsersOnceDaily({
            branchId: branchObjectId,
            type: "FORECAST",
            severity: "CRITICAL",
            title: "Raw material shortage predicted",
            message: `${material.name}: forecast requirement is ${material.requiredQuantity} ${material.unit}, but current stock is ${material.currentStock} ${material.unit}. Additional quantity required: ${material.shortage} ${material.unit}.`,
            entityType: "RawMaterial",
            entityId: material.rawMaterialId,
            metadata: {
              materialName: material.name,
              requiredQuantity: material.requiredQuantity,
              currentStock: material.currentStock,
              shortage: material.shortage,
              unit: material.unit,
              estimatedPurchaseCost: material.estimatedPurchaseCost,
              forecastDays: FORECAST_DAYS,
            },
          })
        );
      }

      const results = await Promise.allSettled(alertTasks);

      const failedAlerts = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedAlerts.length > 0) {
        console.error(
          `${failedAlerts.length} forecast notification(s) could not be created.`
        );

        failedAlerts.forEach((result) => {
          console.error("Forecast notification error:", result.reason);
        });
      }
    } catch (notificationError) {
      console.error(
        "Forecast Notification Error:",
        notificationError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Demand forecast generated successfully.",

      forecast: {
        branch: {
          branchId: branch._id,
          branchName: branch.name,
          city: branch.city,
          type: branch.type,
        },

        branchId,
        generatedAt: now,
        periodDays: FORECAST_DAYS,
        historicalDays: DAYS_RECENT + DAYS_PREVIOUS,

        method:
          "Weighted historical sales + rule-based weather and festival adjustments",

        weights: {
          recentPeriod: "70%",
          previousPeriod: "30%",
        },

        adjustmentLimits: {
          weatherMaximum: `${MAX_WEATHER_ADJUSTMENT * 100}%`,
          festivalMaximum: `${MAX_FESTIVAL_ADJUSTMENT * 100}%`,
        },

        weather: {
          included: Boolean(weather),
          affectsDemandCalculation: Boolean(weather),
          data: weather,
          method:
            "Product name/category keyword rules using forecast temperature and rainfall. Maximum adjustment is 10%.",
        },

        festival: {
          included: festivals.length > 0,
          affectsDemandCalculation: festivals.length > 0,
          festivals,
          adjustmentPercent: festivalAdjustment.adjustmentPercent,
          message:
            festivals.length > 0
              ? `Upcoming festival(s): ${festivalAdjustment.names.join(", ")}. A capped rule-based adjustment has been applied.`
              : "No configured festival falls within the forecast period.",
        },

        products: productForecasts,
        rawMaterials,

        summary: {
          totalProducts: productForecasts.length,

          productsWithForecast: productForecasts.filter(
            (product) => product.predictedDemand > 0
          ).length,

          productsWithoutRecipes: productsWithoutRecipes.length,

          rawMaterialsWithShortage: rawMaterials.filter(
            (material) => material.stockStatus === "SHORTAGE"
          ).length,

          rawMaterialsWithLowStock: rawMaterials.filter(
            (material) => material.stockStatus === "LOW_STOCK"
          ).length,

          estimatedPurchaseCost: roundToTwo(
            rawMaterials.reduce(
              (total, material) =>
                total + material.estimatedPurchaseCost,
              0
            )
          ),
        },

        warnings,
      },
    });
  } catch (error) {
    console.error("Demand Forecast Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate demand forecast.",
    });
  }
};

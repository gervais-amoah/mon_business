// services/productPerformance.service.ts
import { ProductPerformance } from "@/types/performance";
import { DailyEntry, StockItem } from "../types";

interface PerformanceCalculatorProps {
  entries: DailyEntry[];
  stockItems: StockItem[];
  daysToAnalyze?: number; // Optional: limit to last X days
}

export const calculateProductPerformance = ({
  entries,
  stockItems,
  daysToAnalyze = 30,
}: {
  entries: DailyEntry[];
  stockItems: StockItem[];
  daysToAnalyze?: number;
}) => {
  // Group sales AND purchases by product
  const dataByProduct = new Map<
    string,
    { revenue: number; quantity: number; totalCost: number }
  >();

  entries.forEach((entry) => {
    if (entry.productId) {
      const current = dataByProduct.get(entry.productId) || {
        revenue: 0,
        quantity: 0,
        totalCost: 0,
      };

      if (entry.type === "SALE") {
        dataByProduct.set(entry.productId, {
          revenue: current.revenue + entry.amount,
          quantity: current.quantity + (entry.quantity || 0),
          totalCost: current.totalCost,
        });
      } else if (entry.type === "EXPENSE" || entry.type === "STOCK_IN") {
        dataByProduct.set(entry.productId, {
          revenue: current.revenue,
          quantity: current.quantity,
          totalCost: current.totalCost + entry.amount,
        });
      }
    }
  });

  // Calculate performance for each product
  const products: ProductPerformance[] = stockItems.map((item) => {
    const data = dataByProduct.get(item.id) || {
      revenue: 0,
      quantity: 0,
      totalCost: 0,
    };

    // Calculate initial stock (total ever in inventory)
    const initialStock = item.totalSold + item.quantity;

    // Use actual cost from purchases, not estimated
    const actualCost = data.totalCost;
    const actualProfit = data.revenue - actualCost;

    // Calculate average selling price
    const avgPrice = data.quantity > 0 ? data.revenue / data.quantity : 0;

    // Calculate stock turnover
    const avgStock = (initialStock + item.quantity) / 2;
    const stockTurnover = avgStock > 0 ? data.quantity / avgStock : 0;

    // Calculate days of stock left
    const dailySalesRate = data.quantity / daysToAnalyze;
    const daysOfStockLeft =
      dailySalesRate > 0 ? item.quantity / dailySalesRate : Infinity;

    // Stock efficiency
    const stockEfficiency =
      initialStock > 0 ? (data.quantity / initialStock) * 100 : 0;

    // Profit margin (percentage of revenue that is profit)
    const profitMargin =
      data.revenue > 0 ? (actualProfit / data.revenue) * 100 : 0;

    //  Projected Profit (if all stock sells at current price)
    const projectedRevenue = data.revenue + item.quantity * avgPrice;
    const projectedProfit = projectedRevenue - actualCost;

    //  Realization Rate (% of inventory sold)
    const realizationRate =
      initialStock > 0 ? (data.quantity / initialStock) * 100 : 0;

    //  Unrealized Value (potential locked in stock)
    const unrealizedValue = item.quantity * avgPrice;

    // Performance score: weighted combination
    const performanceScore = calculateScore({
      revenue: data.revenue,
      profit: actualProfit,
      efficiency: stockEfficiency,
      turnover: stockTurnover,
      margin: profitMargin,
      realizationRate,
    });

    // Inside the map function, after calculating all metrics:

    const projectedMargin =
      projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0;

    const performanceCategory = categorizePerformance(
      actualProfit,
      projectedProfit,
      realizationRate,
      item.quantity,
    );

    return {
      productId: item.id,
      productName: item.name,

      // ACTUAL/REALIZED (what you use now)
      totalRevenue: data.revenue,
      unitsSold: data.quantity,
      realizedProfit: actualProfit, // -6,000 for Product B
      profitMargin,

      // PROJECTED (full picture)
      projectedRevenue: data.revenue + item.quantity * avgPrice,
      projectedProfit: data.revenue + item.quantity * avgPrice - actualCost, // 0 for Product B
      projectedMargin,

      // INVENTORY HEALTH
      currentStock: item.quantity,
      initialStock,
      realizationRate, // 40% for Product B
      unrealizedValue, // 6,000 for Product B
      stockEfficiency,
      daysOfStockLeft,

      // SCORING
      performanceScore, // Use realized for score
      performanceCategory, // "Underperforming" vs "In Progress"

      // RANKINGS
      rankByRevenue: 0,
      rankByProfit: 0,
      rankByEfficiency: 0,

      stockTurnover,
      estimatedProfit: actualProfit, // Rename or keep for backward compatibility
      revenuePerUnit: avgPrice,
    };
  });

  // Filter out products with no sales
  const activeProducts = products.filter((p) => p.unitsSold > 0);

  // Add rankings
  const withRankings = addRankings(activeProducts);

  return {
    products: withRankings,
    summary: calculateSummary(withRankings),
  };
};

export const getPerformanceCategoryDisplay = (category: string) => {
  const categories: Record<
    string,
    { label: string; color: string; icon: string }
  > = {
    NOT_STARTED: {
      label: "Pas encore vendu",
      color: "bg-gray-100 text-gray-700",
      icon: "⏸️",
    },
    COMPLETED_PROFITABLE: {
      label: "Terminé (Profit)",
      color: "bg-green-100 text-green-700",
      icon: "✅",
    },
    COMPLETED_BREAKEVEN: {
      label: "Terminé (Équilibre)",
      color: "bg-blue-100 text-blue-700",
      icon: "➖",
    },
    COMPLETED_LOSS: {
      label: "Terminé (Perte)",
      color: "bg-red-100 text-red-700",
      icon: "❌",
    },
    IN_PROGRESS_STRONG: {
      label: "En cours (Fort)",
      color: "bg-green-100 text-green-700",
      icon: "📈",
    },
    IN_PROGRESS_RECOVERING: {
      label: "En cours (Récupération)",
      color: "bg-yellow-100 text-yellow-700",
      icon: "🔄",
    },
    IN_PROGRESS_TROUBLED: {
      label: "En cours (Difficile)",
      color: "bg-red-100 text-red-700",
      icon: "⚠️",
    },
    IN_PROGRESS_DECLINING: {
      label: "En cours (Déclin)",
      color: "bg-orange-100 text-orange-700",
      icon: "📉",
    },
    IN_PROGRESS_NEUTRAL: {
      label: "En cours (Neutre)",
      color: "bg-gray-100 text-gray-700",
      icon: "➖",
    },
    UNKNOWN: {
      label: "Inconnu",
      color: "bg-gray-100 text-gray-700",
      icon: "❓",
    },
  };

  return categories[category] || categories.UNKNOWN;
};

const categorizePerformance = (
  realizedProfit: number,
  projectedProfit: number,
  realizationRate: number,
  currentStock: number,
): string => {
  // No sales yet
  if (realizationRate === 0) {
    return "NOT_STARTED";
  }

  // Fully sold out
  if (currentStock === 0) {
    if (realizedProfit > 0) return "COMPLETED_PROFITABLE";
    if (realizedProfit === 0) return "COMPLETED_BREAKEVEN";
    return "COMPLETED_LOSS";
  }

  // Still has stock
  if (realizationRate < 100) {
    // Currently profitable and projected to stay profitable
    if (realizedProfit > 0 && projectedProfit > 0) {
      return "IN_PROGRESS_STRONG";
    }

    // Currently losing but projected to be profitable
    if (realizedProfit < 0 && projectedProfit > 0) {
      return "IN_PROGRESS_RECOVERING";
    }

    // Currently losing and projected to stay in loss
    if (realizedProfit < 0 && projectedProfit < 0) {
      return "IN_PROGRESS_TROUBLED";
    }

    // Currently profitable but projected to lose
    if (realizedProfit > 0 && projectedProfit < 0) {
      return "IN_PROGRESS_DECLINING";
    }

    // Breaking even
    return "IN_PROGRESS_NEUTRAL";
  }

  return "UNKNOWN";
};

const calculateScore = ({
  revenue,
  profit,
  efficiency,
  turnover,
  margin,
  realizationRate,
}: {
  revenue: number;
  profit: number;
  efficiency: number;
  turnover: number;
  margin: number;
  realizationRate: number;
}): number => {
  const weights = {
    revenue: 0.2,
    profit: 0.3,
    efficiency: 0.2,
    turnover: 0.15,
    margin: 0.15,
    realization: 0.1,
  };

  // Normalize each metric (adjust thresholds based on your business)
  const revenueScore = Math.min((revenue / 100000) * 100, 100); // 100k FCFA = 100 points
  const profitScore = Math.min((profit / 50000) * 100, 100); // 50k profit = 100 points
  const efficiencyScore = Math.min(efficiency, 100); // Cap at 100
  const turnoverScore = Math.min(turnover * 50, 100); // 2x turnover = 100 points
  const marginScore = Math.min(margin, 100); // Cap at 100
  const realizationScore = Math.min(realizationRate, 100);

  return Math.round(
    revenueScore * weights.revenue +
      profitScore * weights.profit +
      efficiencyScore * weights.efficiency +
      turnoverScore * weights.turnover +
      marginScore * weights.margin +
      realizationScore * weights.realization,
  );
};

// addRankings and calculateSummary remain the same
const addRankings = (products: ProductPerformance[]): ProductPerformance[] => {
  const byRevenue = [...products].sort(
    (a, b) => b.totalRevenue - a.totalRevenue,
  );
  byRevenue.forEach((p, i) => (p.rankByRevenue = i + 1));

  const byProfit = [...products].sort(
    (a, b) => b.estimatedProfit - a.estimatedProfit,
  );
  byProfit.forEach((p, i) => (p.rankByProfit = i + 1));

  const byEfficiency = [...products].sort(
    (a, b) => b.stockEfficiency - a.stockEfficiency,
  );
  byEfficiency.forEach((p, i) => (p.rankByEfficiency = i + 1));

  return products;
};

const calculateSummary = (products: ProductPerformance[]) => {
  const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalProfit = products.reduce((sum, p) => sum + p.estimatedProfit, 0);
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const bestByRevenue =
    products.length > 0
      ? products.reduce((best, p) =>
          p.totalRevenue > best.totalRevenue ? p : best,
        )
      : null;

  const bestByProfit =
    products.length > 0
      ? products.reduce((best, p) =>
          p.estimatedProfit > best.estimatedProfit ? p : best,
        )
      : null;

  const bestByScore =
    products.length > 0
      ? products.reduce((best, p) =>
          p.performanceScore > best.performanceScore ? p : best,
        )
      : null;

  return {
    totalRevenue,
    totalProfit,
    averageMargin: avgMargin,
    bestByRevenue,
    bestByProfit,
    bestByScore,
    totalProductsAnalyzed: products.length,
  };
};

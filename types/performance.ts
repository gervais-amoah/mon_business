// types/performance.types.ts
export interface ProductPerformance {
  productId: string;
  productName: string;

  // Sales metrics
  totalRevenue: number;
  unitsSold: number;
  realizedProfit: number;

  projectedRevenue: number;
  projectedProfit: number;

  realizationRate: number;
  unrealizedValue: number;
  performanceCategory: string;
  projectedMargin: number;

  // Stock metrics
  currentStock: number;
  initialStock: number; // Total ever received/purchased
  stockTurnover: number; // unitsSold / averageStock

  // Financial metrics
  estimatedProfit: number; // Revenue - (unitsSold * unitCost)
  profitMargin: number; // (estimatedProfit / totalRevenue) * 100
  revenuePerUnit: number; // Average selling price

  // Combined metrics
  performanceScore: number; // 0-100 composite score
  stockEfficiency: number; // (unitsSold / initialStock) * 100
  daysOfStockLeft: number; // currentStock / (unitsSold / daysInPeriod)

  // Rankings
  rankByRevenue: number;
  rankByProfit: number;
  rankByEfficiency: number;
}

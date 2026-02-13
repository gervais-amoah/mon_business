// components/ProductPerformanceTable.tsx
import { getPerformanceCategoryDisplay } from "@/lib/productPerformance";
import { ProductPerformance } from "@/types/performance";
import React, { useState, useMemo } from "react";

interface Props {
  products: ProductPerformance[];
  onProductSelect?: (productId: string) => void;
}

type SortField = keyof ProductPerformance;
type SortDirection = "asc" | "desc";

const ProductPerformanceTable: React.FC<Props> = ({
  products,
  onProductSelect,
}) => {
  const [sortField, setSortField] = useState<SortField>("performanceScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Apply search
    if (searchTerm) {
      filtered = products.filter((p) =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply sort
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      // For string fields
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }, [products, sortField, sortDirection, searchTerm]);

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return value.toFixed(1) + "%";
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header with search */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("totalRevenue")}
              >
                Revenue{" "}
                {sortField === "totalRevenue" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("estimatedProfit")}
              >
                Est. Profit{" "}
                {sortField === "estimatedProfit" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("profitMargin")}
              >
                Margin{" "}
                {sortField === "profitMargin" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("unitsSold")}
              >
                Units Sold{" "}
                {sortField === "unitsSold" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("currentStock")}
              >
                Stock{" "}
                {sortField === "currentStock" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("stockEfficiency")}
              >
                Efficiency{" "}
                {sortField === "stockEfficiency" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("daysOfStockLeft")}
              >
                Days Left{" "}
                {sortField === "daysOfStockLeft" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("performanceScore")}
              >
                Score{" "}
                {sortField === "performanceScore" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedProducts.map((product) => (
              <tr
                key={product.productId}
                onClick={() => onProductSelect?.(product.productId)}
                className={
                  onProductSelect ? "cursor-pointer hover:bg-gray-50" : ""
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {product.productName}
                  </div>
                  <div className="text-sm text-gray-500">
                    #{product.rankByRevenue} by revenue
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {formatCurrency(product.totalRevenue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                  {formatCurrency(product.estimatedProfit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.profitMargin > 30
                        ? "bg-green-100 text-green-800"
                        : product.profitMargin > 15
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {formatPercent(product.profitMargin)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatNumber(product.unitsSold)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={
                      product.currentStock < 10
                        ? "text-red-600 font-medium"
                        : ""
                    }
                  >
                    {formatNumber(product.currentStock)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">
                      {formatPercent(product.stockEfficiency)}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 rounded-full h-2"
                        style={{
                          width: `${Math.min(product.stockEfficiency, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.daysOfStockLeft === Infinity
                    ? "∞"
                    : formatNumber(Math.round(product.daysOfStockLeft))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(product.performanceScore)}`}
                  >
                    {product.performanceScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <h2 className=" text-blue-800 ">
          NEWWWWWWWWWWWWW TAAAAAAAAAAAAAAAAAAABLE
        </h2>
        <div className="md:hidden space-y-3">
          {filteredAndSortedProducts.map((product) => (
            <div
              key={product.productId}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {product.productName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      #{product.rankByRevenue}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        getPerformanceCategoryDisplay(
                          product.performanceCategory,
                        ).color
                      }`}
                    >
                      {
                        getPerformanceCategoryDisplay(
                          product.performanceCategory,
                        ).icon
                      }{" "}
                      {
                        getPerformanceCategoryDisplay(
                          product.performanceCategory,
                        ).label
                      }
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(product.performanceScore)}`}
                >
                  {product.performanceScore}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">CA</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(product.totalRevenue)}
                  </p>
                  {/* Show projected if there's unrealized value */}
                  {product.unrealizedValue > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Projeté: {formatCurrency(product.projectedRevenue)}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Profit</p>
                  <div>
                    <p
                      className={`font-medium ${product.realizedProfit > 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {formatCurrency(product.realizedProfit)}
                    </p>
                    {/* Show potential recovery */}
                    {product.currentStock > 0 &&
                      product.unrealizedValue > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          +{formatCurrency(product.unrealizedValue)} en stock
                        </p>
                      )}
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Marge</p>
                  <div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        product.profitMargin > 30
                          ? "bg-green-100 text-green-700"
                          : product.profitMargin > 15
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {formatPercent(product.profitMargin)}
                    </span>
                    {/* Show projected margin if different */}
                    {product.currentStock > 0 &&
                      Math.abs(product.projectedMargin - product.profitMargin) >
                        1 && (
                        <p className="text-xs text-gray-400 mt-1">
                          → {formatPercent(product.projectedMargin)} si tout
                          vendu
                        </p>
                      )}
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Ventes</p>
                  <p className="text-gray-900">
                    {formatNumber(product.unitsSold)} /{" "}
                    {formatNumber(product.initialStock)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatPercent(product.realizationRate)} vendu
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Stock</p>
                  <p
                    className={
                      product.currentStock < 10
                        ? "text-red-600 font-medium"
                        : "text-gray-900"
                    }
                  >
                    {formatNumber(product.currentStock)}
                  </p>
                  {product.daysOfStockLeft !== Infinity && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      ~{Math.round(product.daysOfStockLeft)} jours restants
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Efficacité</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 text-xs">
                      {formatPercent(product.stockEfficiency)}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 rounded-full h-1.5"
                        style={{
                          width: `${Math.min(product.stockEfficiency, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with summary */}
      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Showing {filteredAndSortedProducts.length} of {products.length}{" "}
            products
          </span>
          <span className="font-medium">
            Best performer: {products[0]?.productName} (Score:{" "}
            {products[0]?.performanceScore})
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductPerformanceTable;

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Decision } from "@/lib/storage";

interface SuccessRateByCategoryChartProps {
  decisions: Decision[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(262 83% 58%)",
  "hsl(280 73% 55%)",
  "hsl(300 63% 52%)",
  "hsl(320 65% 55%)",
];

const SuccessRateByCategoryChart = ({ decisions }: SuccessRateByCategoryChartProps) => {
  const chartData = useMemo(() => {
    const categoryStats: Record<string, { total: number; successful: number }> = {};

    decisions.forEach((decision) => {
      if (!categoryStats[decision.category]) {
        categoryStats[decision.category] = { total: 0, successful: 0 };
      }

      // Count decisions with outcomes
      const hasOutcome = decision.outcomes.length > 0;
      if (hasOutcome) {
        categoryStats[decision.category].total++;
        const avgRating =
          decision.outcomes.reduce((sum, o) => sum + o.rating, 0) /
          decision.outcomes.length;
        if (avgRating >= 4) {
          categoryStats[decision.category].successful++;
        }
      }
    });

    return Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        successRate: stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0,
        total: stats.total,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);
  }, [decisions]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Add outcomes to see success rates
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 12 }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`${value}%`, "Success Rate"]}
          />
          <Bar dataKey="successRate" radius={[0, 4, 4, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SuccessRateByCategoryChart;

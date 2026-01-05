import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Decision } from "@/lib/storage";

interface DecisionBreakdownChartProps {
  decisions: Decision[];
  onCategoryClick?: (category: string) => void;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(262 83% 58%)",
  "hsl(280 73% 55%)",
  "hsl(300 63% 52%)",
  "hsl(320 65% 55%)",
  "hsl(340 75% 55%)",
  "hsl(200 75% 50%)",
  "hsl(160 60% 45%)",
];

const DecisionBreakdownChart = ({
  decisions,
  onCategoryClick,
}: DecisionBreakdownChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    
    decisions.forEach((d) => {
      categoryCount[d.category] = (categoryCount[d.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [decisions]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data to display
      </div>
    );
  }

  const handleClick = (data: { name: string }) => {
    if (onCategoryClick) {
      onCategoryClick(data.name);
    }
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            onClick={handleClick}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                style={{ cursor: onCategoryClick ? "pointer" : "default" }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number, name: string) => [
              `${value} (${Math.round((value / decisions.length) * 100)}%)`,
              name,
            ]}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DecisionBreakdownChart;

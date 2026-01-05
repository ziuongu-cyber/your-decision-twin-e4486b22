import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Decision } from "@/lib/storage";
import { subWeeks, format, startOfWeek, isWithinInterval } from "date-fns";

interface DecisionsOverTimeChartProps {
  decisions: Decision[];
}

const DecisionsOverTimeChart = ({ decisions }: DecisionsOverTimeChartProps) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const weeks: { week: string; count: number; weekStart: Date }[] = [];

    // Generate last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i));
      const weekEnd = startOfWeek(subWeeks(now, i - 1));
      
      const count = decisions.filter((d) => {
        const decisionDate = new Date(d.createdAt);
        return isWithinInterval(decisionDate, { start: weekStart, end: weekEnd });
      }).length;

      weeks.push({
        week: format(weekStart, "MMM d"),
        count,
        weekStart,
      });
    }

    return weeks;
  }, [decisions]);

  if (decisions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Line
            type="monotone"
            dataKey="count"
            name="Decisions"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DecisionsOverTimeChart;

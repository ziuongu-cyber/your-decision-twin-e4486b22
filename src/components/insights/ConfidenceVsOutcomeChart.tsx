import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Decision } from "@/lib/storage";

interface ConfidenceVsOutcomeChartProps {
  decisions: Decision[];
}

const ConfidenceVsOutcomeChart = ({ decisions }: ConfidenceVsOutcomeChartProps) => {
  const chartData = useMemo(() => {
    return decisions
      .filter((d) => d.outcomes.length > 0)
      .map((d) => {
        const avgRating =
          d.outcomes.reduce((sum, o) => sum + o.rating, 0) / d.outcomes.length;
        return {
          confidence: d.confidence,
          outcome: avgRating,
          title: d.title,
        };
      });
  }, [decisions]);

  // Calculate trend line (simple linear regression)
  const trendLine = useMemo(() => {
    if (chartData.length < 2) return null;

    const n = chartData.length;
    const sumX = chartData.reduce((sum, d) => sum + d.confidence, 0);
    const sumY = chartData.reduce((sum, d) => sum + d.outcome, 0);
    const sumXY = chartData.reduce((sum, d) => sum + d.confidence * d.outcome, 0);
    const sumX2 = chartData.reduce((sum, d) => sum + d.confidence * d.confidence, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Add outcomes to see confidence correlation
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            type="number"
            dataKey="confidence"
            name="Confidence"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            label={{ value: "Confidence", position: "bottom", offset: -5 }}
          />
          <YAxis
            type="number"
            dataKey="outcome"
            name="Outcome"
            domain={[1, 5]}
            tick={{ fontSize: 12 }}
            label={{ value: "Outcome", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number, name: string) => {
              if (name === "Confidence") return [`${value}%`, name];
              return [value.toFixed(1), name];
            }}
            labelFormatter={(_, payload) => payload[0]?.payload?.title || ""}
          />
          <Scatter
            name="Decisions"
            data={chartData}
            fill="hsl(var(--primary))"
          />
          {trendLine && (
            <ReferenceLine
              segment={[
                { x: 0, y: trendLine.intercept },
                { x: 100, y: trendLine.slope * 100 + trendLine.intercept },
              ]}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConfidenceVsOutcomeChart;

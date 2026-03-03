import { memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatPrice } from "../../../shared/utils/format";

interface RevenuePoint {
  date: string;
  revenueCents: number;
  orderCount: number;
}

interface Props {
  data: RevenuePoint[];
}

export const RevenueChart = memo<Props>(({ data }) => {
  const chartData = data.map((d) => ({
    ...d,
    revenue: d.revenueCents / 100,
    label: d.date,
  }));

  return (
    <div style={{ height: 280, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="label"
            stroke="#888"
            tick={{ fill: "#888", fontSize: 12 }}
          />
          <YAxis
            stroke="#888"
            tick={{ fill: "#888", fontSize: 12 }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "#1e1e1e",
              border: "1px solid #333",
              borderRadius: 4,
            }}
            labelStyle={{ color: "#fff" }}
            formatter={(value: number) => [formatPrice(value * 100), "Revenue"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#646cff"
            fill="#646cff"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

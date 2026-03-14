import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function RevenuePerCarChart({ data }) {

  return (

    <ResponsiveContainer width="100%" height={300}>

      <BarChart data={data}>

        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7"/>

        <XAxis dataKey="title" />

        <YAxis />

        <Tooltip />

        <Bar
          dataKey="revenue"
          fill="#6366f1"
          radius={[6,6,0,0]}
        />

      </BarChart>

    </ResponsiveContainer>

  );

}

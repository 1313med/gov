import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = [
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#6b7280"
];

export default function BookingStatusChart({ data }) {

  return (

    <ResponsiveContainer width="100%" height={260}>

      <PieChart>

        <Pie
          data={data}
          dataKey="value"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={5}
        >

          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}

        </Pie>

        <Tooltip/>

      </PieChart>

    </ResponsiveContainer>

  );
}

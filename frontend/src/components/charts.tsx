import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { label } from "../lib/format";
import { Panel } from "./ui";

const COLORS = ["#0f6e56", "#c2410c", "#1c1915", "#a16207", "#57534e", "#0e7490", "#9d2c2c"];

export function StatusChart({
  title,
  text,
  data,
  kind = "bar",
}: {
  title: string;
  text?: string;
  data: { name: string; value: number }[];
  kind?: "bar" | "pie";
}) {
  const rows = data.map((item) => ({ ...item, name: label(item.name) }));

  return (
    <Panel>
      <h2 className="font-serif text-xl text-ink">{title}</h2>
      {text ? <p className="mt-1 text-sm text-mute">{text}</p> : null}
      {rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-mute">Nothing to chart yet.</p>
      ) : (
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {kind === "pie" ? (
              <PieChart>
                <Pie data={rows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={2}>
                  {rows.map((row, index) => (
                    <Cell key={row.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#efe8dc" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#6f675c", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#6f675c", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f6f1e8" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {rows.map((row, index) => (
                    <Cell key={row.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}

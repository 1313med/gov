import React from "react";

const filters = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "3 Months", value: "3m" },
  { label: "1 Year", value: "1y" },
];

export default function TimeFilter({ period, setPeriod }) {
  return (
    <div className="flex flex-wrap gap-2">

      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => setPeriod(f.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition 
          
          ${
            period === f.value
              ? "bg-indigo-600 text-white shadow"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }
          
          `}
        >
          {f.label}
        </button>
      ))}

    </div>
  );
}

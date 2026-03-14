export default function DemandHeatmap({ data }) {

  const getColor = (value) => {

    if (value >= 6) return "bg-emerald-600";
    if (value >= 4) return "bg-emerald-500";
    if (value >= 2) return "bg-emerald-400";
    if (value >= 1) return "bg-emerald-300";

    return "bg-gray-200";
  };

  return (

    <div className="grid grid-cols-7 gap-3">

      {data.map((d, i) => (

        <div
          key={i}
          className="flex flex-col items-center gap-2"
        >

          <div
            title={`${d.day} • ${d.demand} bookings`}
            className={`w-12 h-12 rounded-lg ${getColor(d.demand)} 
            flex items-center justify-center text-white text-sm font-semibold`}
          >
            {d.demand}
          </div>

          <span className="text-xs text-gray-500">
            {d.day}
          </span>

        </div>

      ))}

    </div>

  );

}

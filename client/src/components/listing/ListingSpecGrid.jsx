import {
  Calendar,
  Car,
  Fuel,
  Gauge,
  MapPin,
  Settings2,
} from "lucide-react";

const ICONS = {
  brand: Car,
  model: Car,
  year: Calendar,
  mileage: Gauge,
  fuel: Fuel,
  gearbox: Settings2,
  city: MapPin,
};

export default function ListingSpecGrid({ items }) {
  return (
    <div className="ld-spec-grid">
      {items.map((item) => {
        const Icon = ICONS[item.key] || Car;
        return (
          <div key={item.key || item.label} className="ld-spec">
            <span className="ld-spec-icon" aria-hidden>
              <Icon size={18} strokeWidth={2} />
            </span>
            <div>
              <p className="ld-spec-lbl">{item.label}</p>
              <p className="ld-spec-val">{item.value ?? "—"}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

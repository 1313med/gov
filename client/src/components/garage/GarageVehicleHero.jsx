import { Link } from "react-router-dom";
import {
  Bell,
  Calendar,
  Clock,
  Droplets,
  FileText,
  Fuel,
  Gauge,
  Palette,
  Pencil,
  Settings2,
  Trash2,
  UserCheck,
} from "lucide-react";

const HIGHLIGHT_ICONS = {
  year: Calendar,
  mileage: Gauge,
  fuel: Fuel,
  gearbox: Settings2,
};

const DETAIL_ICONS = {
  color: Palette,
  owner: UserCheck,
  mileageUpdate: Clock,
  oil: Droplets,
};

export default function GarageVehicleHero({
  car,
  fr,
  docCount,
  onEdit,
  onDelete,
  highlights,
  details,
  oilLine,
}) {
  const img = car?.image;

  return (
    <header className="ge-vehicle-hero ge-fade-in">
      <div className="ge-vehicle-hero__glow" aria-hidden />

      <div className="ge-vehicle-hero__inner">
        <div className="ge-vehicle-hero__head">
          <div className="ge-vehicle-hero__identity">
            <p className="ge-kicker">{fr ? "Mon garage" : "My garage"}</p>
            <h1 className="ge-vehicle-hero__title">
              {car.brand} {car.model}
            </h1>
            <p className="ge-vehicle-hero__meta">
              <span>{car.year}</span>
              {car.color ? (
                <>
                  <span className="ge-vehicle-hero__dot" aria-hidden />
                  <span>{car.color}</span>
                </>
              ) : null}
              {docCount > 0 ? (
                <span className="ge-docs-badge">
                  <FileText size={12} /> {docCount} {fr ? "doc." : "docs"}
                </span>
              ) : null}
            </p>
          </div>

          <div className="ge-hero-actions">
            <Link to="/notifications" className="ge-icon-btn" title="Notifications">
              <Bell size={18} />
            </Link>
            <button type="button" className="ge-icon-btn" onClick={onEdit} title={fr ? "Modifier" : "Edit"}>
              <Pencil size={18} />
            </button>
            <button type="button" className="ge-icon-btn danger" onClick={onDelete} title={fr ? "Supprimer" : "Delete"}>
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className={`ge-vehicle-hero__panel${img ? "" : " ge-vehicle-hero__panel--solo"}`}>
          {img ? (
            <div className="ge-vehicle-hero__media">
              <img src={img} alt="" className="ge-vehicle-hero__photo" />
            </div>
          ) : null}

          <div className="ge-vehicle-hero__content">
            <div className="ge-vehicle-hero__highlights">
              {highlights.map((item) => {
                const Icon = HIGHLIGHT_ICONS[item.key] || Gauge;
                return (
                  <div key={item.key} className="ge-vehicle-stat">
                    <span className="ge-vehicle-stat__icon" aria-hidden>
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <div className="ge-vehicle-stat__body">
                      <span className="ge-vehicle-stat__label">{item.label}</span>
                      <span className="ge-vehicle-stat__value">{item.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {details.length > 0 ? (
              <ul className="ge-vehicle-hero__details">
                {details.map((item) => {
                  const Icon = DETAIL_ICONS[item.key] || Clock;
                  return (
                    <li key={item.key} className="ge-vehicle-detail">
                      <span className="ge-vehicle-detail__icon" aria-hidden>
                        <Icon size={15} strokeWidth={2} />
                      </span>
                      <span className="ge-vehicle-detail__label">{item.label}</span>
                      <span className="ge-vehicle-detail__value">{item.value}</span>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {oilLine ? <p className="ge-vehicle-hero__oil">{oilLine}</p> : null}
          </div>
        </div>
      </div>
    </header>
  );
}

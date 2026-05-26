import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { fr } from "react-day-picker/locale";
import { format } from "date-fns";
import { fr as dateFnsFr } from "date-fns/locale";
import { CalendarRange } from "lucide-react";

export default function RentalBookingCalendar({ range, onSelect, disabled, lang, labels }) {
  const locale = lang === "fr" ? fr : undefined;
  const dateLocale = lang === "fr" ? dateFnsFr : undefined;
  const from = range?.from;
  const to = range?.to;

  const fmt = (d) => format(d, "d MMM yyyy", { locale: dateLocale });

  return (
    <div className="ld-cal-booking">
      <div className={`ld-date-preview${from ? " has-from" : ""}${to ? " has-to" : ""}`}>
        <CalendarRange size={18} className="ld-date-preview-icon" />
        <div className="ld-date-preview-cols">
          <div className="ld-date-preview-cell">
            <span className="ld-date-preview-lbl">{labels?.from || "Départ"}</span>
            <strong>{from ? fmt(from) : labels?.pickStart || "Choisir…"}</strong>
          </div>
          <span className="ld-date-preview-arrow" aria-hidden>
            →
          </span>
          <div className="ld-date-preview-cell">
            <span className="ld-date-preview-lbl">{labels?.to || "Retour"}</span>
            <strong>{to ? fmt(to) : labels?.pickEnd || "Choisir…"}</strong>
          </div>
        </div>
      </div>

      <div className="ld-cal-wrap">
        <DayPicker
          mode="range"
          locale={locale}
          selected={range}
          onSelect={onSelect}
          disabled={disabled}
          showOutsideDays
          fixedWeeks
          numberOfMonths={1}
        />
      </div>

      <div className="ld-cal-legend">
        <span>
          <i className="ld-cal-dot ld-cal-dot--range" /> {labels?.selected || "Sélection"}
        </span>
        <span>
          <i className="ld-cal-dot ld-cal-dot--today" /> {labels?.today || "Aujourd'hui"}
        </span>
        <span>
          <i className="ld-cal-dot ld-cal-dot--off" /> {labels?.unavailable || "Indisponible"}
        </span>
      </div>
    </div>
  );
}

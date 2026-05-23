/** Cost of ownership estimates for Mon Garage (MAD). */

const DEFAULT_INSURANCE_YEAR = 4500;
const DEFAULT_VIGNETTE_YEAR = 350;
const DEFAULT_VISITE_YEAR = 400;

export function computeGarageCosts(car, serviceLogs, fr) {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const logsYtd = (serviceLogs || []).filter((l) => new Date(l.date) >= yearStart);
  const maintenanceYtd = logsYtd.reduce((s, l) => s + (Number(l.cost) || 0), 0);

  const assuranceYear = estimateAssuranceYear(car);
  const fixedYear = DEFAULT_VIGNETTE_YEAR + DEFAULT_VISITE_YEAR;
  const totalYear = maintenanceYtd + assuranceYear + fixedYear;
  const perMonth = Math.round(totalYear / 12);

  const funFact = funComparison(perMonth, fr);

  return {
    maintenanceYtd,
    assuranceYear,
    fixedYear,
    totalYear,
    perMonth,
    logsCount: logsYtd.length,
    funFact,
    breakdown: [
      {
        key: "maint",
        label: fr ? "Entretien (cette année)" : "Maintenance (YTD)",
        value: maintenanceYtd,
        icon: "construct-outline",
        color: "#38bdf8",
      },
      {
        key: "ins",
        label: fr ? "Assurance (estim.)" : "Insurance (est.)",
        value: assuranceYear,
        icon: "shield-outline",
        color: "#f97316",
      },
      {
        key: "papers",
        label: fr ? "Vignette & visite (estim.)" : "Tax & inspection (est.)",
        value: fixedYear,
        icon: "document-text-outline",
        color: "#a78bfa",
      },
    ],
  };
}

function estimateAssuranceYear(car) {
  if (car?.assurance?.startDate && car?.assurance?.expiryDate) {
    const start = new Date(car.assurance.startDate);
    const end = new Date(car.assurance.expiryDate);
    const days = Math.max(30, (end - start) / 86400000);
    return Math.round((DEFAULT_INSURANCE_YEAR * 365) / days);
  }
  const age = new Date().getFullYear() - (parseInt(car?.year, 10) || new Date().getFullYear());
  if (age <= 3) return 5200;
  if (age <= 8) return 4500;
  return 5800;
}

function funComparison(perMonth, fr) {
  if (perMonth < 400) {
    return fr
      ? "Moins qu'un repas au resto par semaine — votre voiture vous coûte peu !"
      : "Less than one restaurant meal a week — low cost of ownership!";
  }
  if (perMonth < 900) {
    return fr
      ? "Environ l'équivalent d'un plein d'essence par mois — raisonnable au Maroc."
      : "Roughly one tank of fuel per month — reasonable in Morocco.";
  }
  return fr
    ? "Pensez à noter chaque entretien ici — ça aide à économiser sur le long terme."
    : "Log every service here — it helps you save in the long run.";
}

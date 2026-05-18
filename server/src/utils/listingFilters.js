const { safeRegex } = require("./sanitize");

/** Case-insensitive exact / alias match for enum-like listing fields. */
function enumRegex(aliases) {
  const body = aliases.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return { $regex: `^(${body})$`, $options: "i" };
}

function applyCityFilter(filter, city) {
  const c = String(city || "").trim();
  if (!c) return;
  const rx = safeRegex(c);
  if (rx) filter.city = rx;
}

function applyBrandFilter(filter, brand) {
  const b = String(brand || "").trim();
  if (!b) return;
  const rx = safeRegex(b);
  if (rx) filter.brand = rx;
}

function applyFuelFilter(filter, fuel) {
  const f = String(fuel || "").trim().toLowerCase();
  if (!f) return;
  if (f === "essence") filter.fuel = enumRegex(["essence", "petrol", "gasoline", "gas"]);
  else if (f === "diesel") filter.fuel = enumRegex(["diesel"]);
  else if (f === "hybride") filter.fuel = enumRegex(["hybride", "hybrid"]);
  else if (f === "electrique") filter.fuel = enumRegex(["electrique", "électrique", "electric"]);
  else {
    const rx = safeRegex(fuel);
    if (rx) filter.fuel = rx;
  }
}

function applyGearboxFilter(filter, gearbox) {
  const g = String(gearbox || "").trim().toLowerCase();
  if (!g) return;
  if (g === "manuelle") {
    filter.gearbox = enumRegex(["manuelle", "manual", "manuell", "manu"]);
  } else if (g === "automatique") {
    filter.gearbox = enumRegex(["automatique", "automatic", "auto"]);
  } else {
    const rx = safeRegex(gearbox);
    if (rx) filter.gearbox = rx;
  }
}

function applySearchFilter(filter, search) {
  const s = String(search || "").trim();
  if (!s) return;
  const rx = safeRegex(s);
  if (!rx) return;
  filter.$or = [{ title: rx }, { brand: rx }, { model: rx }, { city: rx }];
}

module.exports = {
  applyCityFilter,
  applyBrandFilter,
  applyFuelFilter,
  applyGearboxFilter,
  applySearchFilter,
};

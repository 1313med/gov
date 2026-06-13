function slugify(text) {
  if (!text) return "";
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

exports.buildAgencySlug = (name, id) => `${slugify(name) || "agence"}-${String(id)}`;

exports.buildAgencyPath = (citySlug, name, id) =>
  `/agences/${slugify(citySlug)}/${exports.buildAgencySlug(name, id)}`;

exports.buildDealerPath = (citySlug, name, id) =>
  `/concessionnaires/${slugify(citySlug)}/${exports.buildAgencySlug(name, id)}`;

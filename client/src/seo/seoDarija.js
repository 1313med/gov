/** Darija SEO phrases (Latin script) — natural mix on French public pages. */
export const DARIJA = {
  home:
    "Bghiti tkra tomobil wla tchri tonobil mosta3mala f l-Maghrib? Goovoiture hiya l-plateforme li katjma3 kra tomobil w tomobilat lil bi3 f Casa, Rabat, Marrakech w ga3 l-mdoun.",
  rentals:
    "Kra tomobil f l-Maghrib b taman mzyan: kra tonobil f Casa, Rabat, Marrakech, Tanger w Agadir. 7ezz rezervation en ligne w tomobilat vérifiées 3la Goovoiture.",
  cars:
    "Tomobilat lil bi3 f l-Maghrib: chri tomobil mosta3mala, tonobil d'occasion b prix wa7ed, wla bghiti nbi3 tomobil dyalek — dder annonce f d9i9a.",
  sell:
    "Bghiti tbi3 tomobil dyalek? Nbi3 tomobil dyali b ser3a 3la Goovoiture — publier annonce, wsel l-machetin f Casa, Rabat w ga3 l-Maghrib.",
};

/** City-specific Darija (slug → phrases). */
export const CITY_DARIJA = {
  casablanca: {
    rental:
      "Kra tomobil f Casa wla l-matar Mohammed V — location voiture pas cher, livraison aéroport possible.",
    sale: "Tomobil lil bi3 f Casa: tonobil mosta3mala, voiture occasion Casablanca b taman mzyan.",
  },
  rabat: {
    rental:
      "Kra tonobil f Rabat wla aeroport Rabat-Salé — kra tomobil bla cheque, réservation en ligne.",
    sale: "Tonobil d'occasion f Rabat: chri tomobil mosta3mala wla b3 tomobil dyalek hna.",
  },
  marrakech: {
    rental:
      "Kra tomobil f Marrakech — location voiture Marrakech pas cher, automatique w diesel.",
    sale: "Tomobilat lil bi3 f Marrakech: voiture occasion Marrakech, SUV w citadines.",
  },
  fes: {
    rental: "Kra tomobil f Fès — louer voiture pas cher au Maroc, tarifs clairs.",
    sale: "Voiture occasion Fès: tonobil mosta3mala lil bi3.",
  },
  tanger: {
    rental: "Kra tomobil f Tanger w port — location voiture Tanger pour voyageurs.",
    sale: "Tonobil lil bi3 f Tanger: acheter voiture occasion.",
  },
  agadir: {
    rental: "Kra tomobil f Agadir — location voiture pas cher, idéal plage w vacances.",
    sale: "Voiture occasion Agadir: tomobilat mosta3mala b prix négociables.",
  },
  meknes: {
    rental: "Kra tonobil f Meknès — location auto Maroc, réservation simple.",
    sale: "Voiture occasion Meknès: tonobil d'occasion vérifiés sur Goovoiture.",
  },
  oujda: {
    rental: "Kra tomobil f Oujda — louer voiture oriental Maroc.",
    sale: "Tomobil lil bi3 f Oujda: annonces voiture occasion locale.",
  },
};

export function getCityDarija(slug, mode = "rental") {
  const entry = CITY_DARIJA[slug];
  if (!entry) return null;
  return mode === "sale" ? entry.sale : entry.rental;
}

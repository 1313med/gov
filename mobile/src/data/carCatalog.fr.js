/** Marques et modèles courants au Maroc — aide à la saisie Mon Garage */

export const CAR_BRANDS = [
  "Dacia",
  "Renault",
  "Peugeot",
  "Citroën",
  "Volkswagen",
  "Seat",
  "Skoda",
  "Toyota",
  "Hyundai",
  "Kia",
  "Ford",
  "Fiat",
  "Opel",
  "Nissan",
  "Honda",
  "Suzuki",
  "BMW",
  "Mercedes",
  "Audi",
  "Volvo",
  "Mazda",
  "Mitsubishi",
  "Chevrolet",
  "Jeep",
  "Land Rover",
  "Range Rover",
  "Porsche",
  "Mini",
  "Cupra",
  "MG",
  "Chery",
  "Geely",
  "Autre",
];

export const CAR_MODELS_BY_BRAND = {
  Dacia: ["Sandero", "Sandero Stepway", "Logan", "Logan MCV", "Duster", "Spring", "Jogger", "Lodgy", "Dokker", "Autre"],
  Renault: [
    "Clio",
    "Clio 4",
    "Clio 5",
    "Megane",
    "Megane 4",
    "Captur",
    "Kadjar",
    "Austral",
    "Symbol",
    "Fluence",
    "Talisman",
    "Scenic",
    "Espace",
    "Kangoo",
    "Trafic",
    "Master",
    "Autre",
  ],
  Peugeot: [
    "206",
    "207",
    "208",
    "301",
    "308",
    "408",
    "508",
    "2008",
    "3008",
    "5008",
    "Partner",
    "Rifter",
    "Boxer",
    "Autre",
  ],
  Citroën: [
    "C1",
    "C2",
    "C3",
    "C3 Aircross",
    "C4",
    "C4 Cactus",
    "C5",
    "C5 Aircross",
    "Berlingo",
    "Jumpy",
    "Autre",
  ],
  Volkswagen: [
    "Polo",
    "Golf",
    "Golf 7",
    "Golf 8",
    "Passat",
    "Jetta",
    "Tiguan",
    "T-Roc",
    "Touareg",
    "Touran",
    "Caddy",
    "Transporter",
    "Autre",
  ],
  Seat: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco", "Cordoba", "Toledo", "Alhambra", "Autre"],
  Skoda: ["Fabia", "Octavia", "Superb", "Rapid", "Kamiq", "Karoq", "Kodiaq", "Autre"],
  Toyota: [
    "Yaris",
    "Corolla",
    "Auris",
    "C-HR",
    "RAV4",
    "Hilux",
    "Land Cruiser",
    "Prado",
    "Avensis",
    "Autre",
  ],
  Hyundai: ["i10", "i20", "i30", "Accent", "Elantra", "Tucson", "Santa Fe", "Kona", "Creta", "Autre"],
  Kia: ["Picanto", "Rio", "Ceed", "Cerato", "Sportage", "Sorento", "Stonic", "Niro", "Autre"],
  Ford: ["Fiesta", "Focus", "Fusion", "Mondeo", "Kuga", "Puma", "Ranger", "Transit", "Autre"],
  Fiat: ["500", "Panda", "Punto", "Tipo", "500X", "Doblo", "Ducato", "Autre"],
  Opel: ["Corsa", "Astra", "Insignia", "Mokka", "Crossland", "Grandland", "Combo", "Autre"],
  Nissan: ["Micra", "Note", "Sunny", "Qashqai", "Juke", "X-Trail", "Navara", "Patrol", "Autre"],
  Honda: ["Jazz", "Civic", "Accord", "HR-V", "CR-V", "Autre"],
  Suzuki: ["Swift", "Baleno", "Vitara", "S-Cross", "Jimny", "Autre"],
  BMW: ["Série 1", "Série 2", "Série 3", "Série 5", "X1", "X3", "X5", "Autre"],
  Mercedes: ["Classe A", "Classe B", "Classe C", "Classe E", "GLA", "GLC", "GLE", "Sprinter", "Autre"],
  Audi: ["A1", "A3", "A4", "A6", "Q2", "Q3", "Q5", "Q7", "Autre"],
  Volvo: ["V40", "S60", "V60", "XC40", "XC60", "XC90", "Autre"],
  Mazda: ["2", "3", "6", "CX-3", "CX-5", "CX-30", "Autre"],
  Mitsubishi: ["Space Star", "Colt", "Lancer", "ASX", "Outlander", "Pajero", "L200", "Autre"],
  Chevrolet: ["Spark", "Aveo", "Cruze", "Captiva", "Autre"],
  Jeep: ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Autre"],
  "Land Rover": ["Discovery", "Discovery Sport", "Defender", "Autre"],
  "Range Rover": ["Evoque", "Velar", "Sport", "Vogue", "Autre"],
  Porsche: ["Macan", "Cayenne", "Panamera", "911", "Autre"],
  Mini: ["Cooper", "Countryman", "Clubman", "Autre"],
  Cupra: ["Ibiza", "Leon", "Formentor", "Ateca", "Autre"],
  MG: ["ZS", "HS", "MG3", "MG4", "Autre"],
  Chery: ["Tiggo 2", "Tiggo 4", "Tiggo 7", "Arrizo 5", "Autre"],
  Geely: ["Coolray", "Emgrand", "Autre"],
  Autre: ["Autre"],
};

export const CAR_COLORS = [
  "Blanc",
  "Noir",
  "Gris",
  "Gris clair",
  "Argent",
  "Bleu",
  "Bleu foncé",
  "Rouge",
  "Bordeaux",
  "Beige",
  "Marron",
  "Vert",
  "Orange",
  "Jaune",
  "Autre",
];

const CURRENT_YEAR = new Date().getFullYear();

export const CAR_YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1994 }, (_, i) =>
  String(CURRENT_YEAR - i),
);

export function getModelsForBrand(brand) {
  if (!brand) return [];
  const exact = CAR_MODELS_BY_BRAND[brand];
  if (exact) return exact;
  const key = Object.keys(CAR_MODELS_BY_BRAND).find(
    (k) => k.toLowerCase() === String(brand).toLowerCase(),
  );
  return key ? CAR_MODELS_BY_BRAND[key] : ["Autre"];
}

export function isCatalogBrand(brand) {
  return CAR_BRANDS.includes(brand) && brand !== "Autre";
}

export function isCatalogModel(brand, model) {
  const models = getModelsForBrand(brand);
  return models.includes(model) || model === "Autre";
}

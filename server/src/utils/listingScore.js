/**
 * Listing Quality Score
 * Returns a 0-100 score and actionable improvement tips for a sale listing.
 *
 * Scoring breakdown (total = 100):
 *   Images      30 pts  (5+ images = full score)
 *   Description 25 pts  (200+ chars = full score)
 *   Mileage     10 pts
 *   Year        5 pts   (always present — required field)
 *   Color       5 pts
 *   Features    15 pts  (5+ features = full score)
 *   City        5 pts   (always present — required field)
 *   Price       5 pts   (always present — required field)
 */
function computeListingScore(listing) {
  let score = 0;
  const tips = [];

  // ── Images (30 pts) ──
  const imgCount = (listing.images || []).length;
  if (imgCount >= 5)      score += 30;
  else if (imgCount >= 3) score += 20;
  else if (imgCount >= 1) score += 10;

  if (imgCount < 5) {
    tips.push({
      key:     "images",
      message: imgCount === 0
        ? "Add at least 5 photos — listings with photos get 10× more inquiries."
        : `Add ${5 - imgCount} more photo(s) to reach the recommended 5+.`,
      points: 30 - (imgCount >= 5 ? 30 : imgCount >= 3 ? 20 : imgCount >= 1 ? 10 : 0),
    });
  }

  // ── Description (25 pts) ──
  const descLen = (listing.description || "").trim().length;
  if (descLen >= 200)      score += 25;
  else if (descLen >= 100) score += 15;
  else if (descLen >= 30)  score += 8;

  if (descLen < 200) {
    tips.push({
      key:     "description",
      message: descLen < 30
        ? "Write a description (at least 200 characters). Buyers trust detailed listings."
        : `Your description is ${descLen} characters. Expand to 200+ for full points.`,
      points: 25 - (descLen >= 200 ? 25 : descLen >= 100 ? 15 : descLen >= 30 ? 8 : 0),
    });
  }

  // ── Mileage (10 pts) ──
  if (listing.mileage) {
    score += 10;
  } else {
    tips.push({ key: "mileage", message: "Add the mileage — buyers always ask for it.", points: 10 });
  }

  // ── Year (5 pts — required, always present) ──
  if (listing.year) score += 5;

  // ── Color (5 pts) ──
  if (listing.color) {
    score += 5;
  } else {
    tips.push({ key: "color", message: "Add the car color to help buyers filter.", points: 5 });
  }

  // ── Features (15 pts) ──
  const fCount = (listing.features || []).length;
  if (fCount >= 5)      score += 15;
  else if (fCount >= 3) score += 10;
  else if (fCount >= 1) score += 5;

  if (fCount < 5) {
    tips.push({
      key:     "features",
      message: fCount === 0
        ? "List car features (AC, GPS, Bluetooth, etc.) to stand out."
        : `Add ${5 - fCount} more feature(s) for maximum visibility.`,
      points: 15 - (fCount >= 5 ? 15 : fCount >= 3 ? 10 : fCount >= 1 ? 5 : 0),
    });
  }

  // ── City (5 pts — required, always present) ──
  if (listing.city) score += 5;

  // ── Price (5 pts — required, always present) ──
  if (listing.price) score += 5;

  // Cap at 100
  score = Math.min(100, score);

  // Sort tips by most impactful (most points to gain first)
  tips.sort((a, b) => b.points - a.points);

  return { score, tips };
}

module.exports = { computeListingScore };

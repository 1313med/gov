/** Quality gates — never index thin programmatic pages. */

export const MIN_LISTINGS_FOR_INDEX = 3;
export const MIN_WORDS_FOR_INDEX = 400;

export function countWords(text) {
  if (!text) return 0;
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

export function passesListingGate(listings) {
  return Array.isArray(listings) && listings.length >= MIN_LISTINGS_FOR_INDEX;
}

export function passesContentGate(intro, faqItems = []) {
  const faqText = faqItems.map((f) => `${f.q} ${f.a}`).join(" ");
  return countWords(`${intro} ${faqText}`) >= MIN_WORDS_FOR_INDEX;
}

export function shouldIndexPage({ listings = [], intro = "", faq = [], forceIndex = false }) {
  if (forceIndex) return true;
  if (passesListingGate(listings)) return true;
  return passesContentGate(intro, faq);
}

export function robotsForGate(passes) {
  return passes ? "index, follow" : "noindex, follow";
}

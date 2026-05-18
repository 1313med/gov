/** @param {string|{ _id?: string }} idOrDoc */
function idOf(idOrDoc) {
  if (!idOrDoc) return null;
  if (typeof idOrDoc === "object" && idOrDoc._id != null) return String(idOrDoc._id);
  return String(idOrDoc);
}

export function isOwnSaleListing(item, userId) {
  if (!userId || !item) return false;
  const sellerId = idOf(item.sellerId);
  return sellerId === String(userId);
}

export function isOwnRentalListing(item, userId) {
  if (!userId || !item) return false;
  const ownerId = idOf(item.rentalOwnerId ?? item.owner);
  return ownerId === String(userId);
}

export function filterOutOwnListings(items, userId, type) {
  if (!userId || !Array.isArray(items)) return items ?? [];
  const check = type === "rent" ? isOwnRentalListing : isOwnSaleListing;
  return items.filter((item) => !check(item, userId));
}

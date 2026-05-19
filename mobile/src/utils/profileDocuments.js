export function userHasCinOnFile(profile) {
  const nid = profile?.nationalId;
  return !!(nid?.imageUrl || nid?.number);
}

export function userHasLicenseOnFile(profile) {
  const dl = profile?.driverLicense;
  return !!(dl?.imageUrl || dl?.number);
}

/** Documents on file — enough to submit a rental booking (admin verification optional). */
export function userCanRentWithDocuments(profile) {
  return userHasCinOnFile(profile) && userHasLicenseOnFile(profile);
}

export function userHasApprovedSale(sales) {
  return Array.isArray(sales) && sales.some((s) => s?.status === "approved");
}

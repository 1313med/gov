import { shellForMode } from "./userRoles";

/** Messages tab path for the current app mode */
export function messagesHref(mode = "customer") {
  const shell = shellForMode(mode);
  return `${shell}/messages`;
}

export function profileHref(mode = "customer") {
  const shell = shellForMode(mode);
  return `${shell}/profile`;
}

export function exploreHref() {
  return "/(customer)";
}

export function bookingsHref(params = {}) {
  const q = params.bookingId ? `?bookingId=${params.bookingId}&booked=1` : "";
  return `/(customer)/bookings${q}`;
}

export const VERIFY_CIN_PATH = "/verify-cin";

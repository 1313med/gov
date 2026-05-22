import { api } from "./axios";

// Public rentals (approved only)
export const getApprovedRentals = (params = {}) =>
  api.get("/rental", { params });

// Rental owner
export const getMyRentals = () => api.get("/rental/mine");

// All bookings for the owner's calendar (flat array, date-windowed)
export const getOwnerBookingsCalendar = () => api.get("/rental/owner/bookings");

// Rental owner — listing views
export const getOwnerListingViews = (params = {}) =>
  api.get("/rental/owner/listing-views", { params });
export const markOwnerListingViewsSeen = () =>
  api.post("/rental/owner/listing-views-seen");

// Admin
export const getAdminRentals = () => api.get("/rental/admin");
export const updateRentalStatus = (id, status) =>
  api.put(`/rental/admin/${id}/status`, { status });

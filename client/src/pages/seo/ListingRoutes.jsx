import { Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { parseSemanticListingParam, buildSaleListingPath, buildRentalListingPath } from "../../seo/slugUtils";
import CarDetails from "../CarDetails";
import RentalDetails from "../RentalDetails";

export function SaleListingRoute() {
  const { listingSlug } = useParams();
  const { id } = parseSemanticListingParam(listingSlug);
  if (!id) return <Navigate to="/voiture-occasion" replace />;
  return <CarDetails listingId={id} semanticSlug={listingSlug} />;
}

export function RentalListingRoute() {
  const { listingSlug } = useParams();
  const { id } = parseSemanticListingParam(listingSlug);
  if (!id) return <Navigate to="/location-voiture" replace />;
  return <RentalDetails listingId={id} semanticSlug={listingSlug} />;
}

/** 301-style redirect from legacy /cars/:id to /acheter/:slug-id */
export function LegacySaleRedirect() {
  const { id } = useParams();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    api.get(`/sale/${id}`).then((res) => {
      setTarget(buildSaleListingPath(res.data));
    }).catch(() => setTarget("/voiture-occasion"));
  }, [id]);

  if (!target) return null;
  return <Navigate to={target} replace />;
}

export function LegacyRentalRedirect() {
  const { id } = useParams();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    api.get(`/rental/${id}`).then((res) => {
      setTarget(buildRentalListingPath(res.data));
    }).catch(() => setTarget("/location-voiture"));
  }, [id]);

  if (!target) return null;
  return <Navigate to={target} replace />;
}

export function LegacyCitySaleRedirect() {
  const { citySlug } = useParams();
  return <Navigate to={`/voiture-occasion/${citySlug}`} replace />;
}

export function LegacyCarsHubRedirect() {
  return <Navigate to="/voiture-occasion" replace />;
}

export function LegacyRentalsHubRedirect() {
  return <Navigate to="/location-voiture" replace />;
}

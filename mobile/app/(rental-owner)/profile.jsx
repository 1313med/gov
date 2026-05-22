import { useAuth } from "../../src/context/AuthContext";
import OwnerProfile from "../(tabs)/profile";
import StaffProfile from "../../src/components/StaffProfile";

export default function RentalOwnerProfileScreen() {
  const { auth } = useAuth();
  if (auth?.staffForOwnerId) return <StaffProfile />;
  return <OwnerProfile />;
}

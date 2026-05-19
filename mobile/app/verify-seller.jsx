import { Redirect, useLocalSearchParams } from "expo-router";

/** Legacy route — selling only needs CIN, not seller badge flow. */
export default function VerifySellerRedirect() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: "/verify-cin", params: { ...params, purpose: "sell" } }} />;
}

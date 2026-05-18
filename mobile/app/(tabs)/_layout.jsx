import { Redirect } from "expo-router";

/** Legacy route group — always send to the customer explore shell */
export default function LegacyTabsRedirect() {
  return <Redirect href="/(customer)" />;
}

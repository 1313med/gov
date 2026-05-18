import GarageEliteScreen from "../../src/components/garage/GarageEliteScreen";

export default function CarOwnerGarageScreen() {
  return (
    <GarageEliteScreen mode="tab" accentKey="cyan" sellPath="/new-sale" promptSetupWhenEmpty />
  );
}

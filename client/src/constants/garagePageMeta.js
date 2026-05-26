import {
  Wrench,
  TrendingUp,
  Fuel,
  MapPinned,
  UsersRound,
  ShieldAlert,
  Calculator,
  FileStack,
  Pencil,
  HelpCircle,
  CarFront,
} from "lucide-react";

/** Icon + color variant per garage sub-page */
export const GARAGE_PAGE_META = {
  mechanic: { Icon: Wrench, variant: "amber" },
  worth: { Icon: TrendingUp, variant: "emerald" },
  fuel: { Icon: Fuel, variant: "sky" },
  travel: { Icon: MapPinned, variant: "indigo" },
  community: { Icon: UsersRound, variant: "violet" },
  emergency: { Icon: ShieldAlert, variant: "red" },
  afford: { Icon: Calculator, variant: "indigo" },
  documents: { Icon: FileStack, variant: "teal" },
  addCar: { Icon: CarFront, variant: "teal" },
  edit: { Icon: Pencil, variant: "teal" },
  notFound: { Icon: HelpCircle, variant: "muted" },
};

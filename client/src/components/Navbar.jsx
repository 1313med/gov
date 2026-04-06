import { Link, useNavigate } from "react-router-dom";
import { loadAuth, clearAuth } from "../utils/authStorage";
import { useAppLang } from "../context/AppLangContext";
import LangSwitch from "./LangSwitch";

export default function Navbar() {
  const navigate = useNavigate();
  const auth = loadAuth();
  const { copy } = useAppLang();

  const isSeller =
    auth &&
    typeof auth.role === "string" &&
    ["seller", "admin"].includes(auth.role.toLowerCase());

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/" className="font-bold text-xl tracking-tight">
          Goovoiture
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 text-sm flex-wrap justify-end">
          <LangSwitch />
          <Link to="/cars" className="px-3 py-2 hover:text-black/80">
            {copy.common.browseCars}
          </Link>
          <Link to="/rentals" className="px-3 py-2 hover:text-black/80">
            {copy.common.rentCars}
          </Link>

          {isSeller && (
            <>
              <Link
                to="/my-sales"
                className="px-3 py-2 hover:text-black/80"
              >
                {copy.common.mySales}
              </Link>

              <Link
                to="/my-sales/new"
                className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
              >
                {copy.common.addCar}
              </Link>
            </>
          )}

          {auth?.token ? (
            <button
              type="button"
              onClick={() => {
                clearAuth();
                navigate("/login");
              }}
              className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
            >
              {copy.common.logout}
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-80"
            >
              {copy.common.login}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

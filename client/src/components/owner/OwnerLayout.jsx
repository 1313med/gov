import OwnerSidebar from "./OwnerSidebar";

const LAYOUT_CSS = `
  .ol-shell { display: flex; min-height: 100vh; width: 100%; max-width: 100vw; overflow-x: hidden; }
  .ol-main {
    flex: 1;
    min-width: 0;
    min-height: 100vh;
    overflow-x: hidden;
  }
  @media (max-width: 767px) {
    .ol-main {
      padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
    }
  }
`;

export default function OwnerLayout({ children }) {
  return (
    <div className="ol-shell">
      <style>{LAYOUT_CSS}</style>
      <OwnerSidebar />
      <main className="ol-main">{children}</main>
    </div>
  );
}

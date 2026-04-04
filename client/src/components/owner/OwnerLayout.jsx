import OwnerSidebar from "./OwnerSidebar";

export default function OwnerLayout({ children }) {

  return (
    <div className="flex">

      <OwnerSidebar />

      <main className="flex-1 min-h-screen">
        {children}
      </main>

    </div>
  );
}

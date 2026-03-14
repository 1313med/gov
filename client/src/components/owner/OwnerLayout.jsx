import OwnerSidebar from "./OwnerSidebar";

export default function OwnerLayout({ children }) {

  return (
    <div className="flex">

      <OwnerSidebar />

      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        {children}
      </main>

    </div>
  );
}

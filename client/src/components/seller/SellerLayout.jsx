import Sidebar from "./Sidebar";

export default function SellerLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-100 text-gray-900">
        {children}
      </main>
    </div>
  );
}

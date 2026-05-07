import Sidebar from "./Sidebar";

export default function SellerLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-8 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {children}
      </main>
    </div>
  );
}

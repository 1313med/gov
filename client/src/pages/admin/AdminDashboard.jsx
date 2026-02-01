import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <p className="text-gray-300">
          Welcome to the admin panel.  
          From here you can manage listings and approvals.
        </p>
      </div>
    </AdminLayout>
  );
}

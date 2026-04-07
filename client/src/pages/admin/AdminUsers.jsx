import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import AdminLayout from "../../components/admin/AdminLayout";

const ROLES = ["", "customer", "seller", "rental_owner", "admin"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      const r = await api.get(`/admin/users?${params}`);
      setUsers(r.data.users);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, role]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const handleBan = async (id, isBanned) => {
    const endpoint = isBanned ? `/admin/users/${id}/unban` : `/admin/users/${id}/ban`;
    await api.put(endpoint);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  const roleBadge = (r) => {
    const colors = { admin: "#7c3aed", seller: "#0284c7", rental_owner: "#0891b2", customer: "#6b7280" };
    return (
      <span style={{
        background: colors[r] + "1a", color: colors[r],
        border: `1px solid ${colors[r]}33`,
        borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600,
      }}>{r}</span>
    );
  };

  return (
    <AdminLayout>
      <div style={{ padding: "0 0 40px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>User Management</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
          {total} total users
        </p>

        {/* Filters */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email…"
            style={{
              flex: 1, minWidth: 200, padding: "10px 14px",
              border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none",
            }}
          />
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            style={{ padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, background: "#fff", outline: "none" }}
          >
            {ROLES.map((r) => <option key={r} value={r}>{r || "All roles"}</option>)}
          </select>
          <button
            type="submit"
            style={{ padding: "10px 20px", background: "#141412", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Search
          </button>
        </form>

        {loading ? (
          <p style={{ color: "#9ca3af" }}>Loading…</p>
        ) : (
          <>
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["Name", "Phone", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%", background: "#e5e7eb",
                            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 700, color: "#374151", flexShrink: 0,
                          }}>
                            {u.avatar ? <img src={u.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : u.name[0]}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#6b7280" }}>{u.phone}</td>
                      <td style={{ padding: "12px 16px", color: "#6b7280" }}>{u.email || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>{roleBadge(u.role)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {u.isBanned
                          ? <span style={{ color: "#dc2626", fontSize: 12, fontWeight: 600 }}>Banned</span>
                          : <span style={{ color: "#059669", fontSize: 12, fontWeight: 600 }}>Active</span>}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#6b7280" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          {u.role !== "admin" && (
                            <button
                              onClick={() => handleBan(u._id, u.isBanned)}
                              style={{
                                padding: "5px 12px", fontSize: 11, fontWeight: 600,
                                border: `1px solid ${u.isBanned ? "#059669" : "#dc2626"}`,
                                color: u.isBanned ? "#059669" : "#dc2626",
                                background: "none", borderRadius: 7, cursor: "pointer",
                              }}
                            >
                              {u.isBanned ? "Unban" : "Ban"}
                            </button>
                          )}
                          {u.role !== "admin" && (
                            <button
                              onClick={() => handleDelete(u._id)}
                              style={{
                                padding: "5px 12px", fontSize: 11, fontWeight: 600,
                                border: "1px solid #e5e7eb", color: "#6b7280",
                                background: "none", borderRadius: 7, cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: "1px solid #e5e7eb",
                      background: p === page ? "#141412" : "#fff",
                      color: p === page ? "#fff" : "#374151",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

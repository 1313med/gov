import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import AdminLayout from "../../components/admin/AdminLayout";

const ROLES = ["", "customer", "seller", "rental_owner", "admin"];

const ROLE_COLORS = {
  admin:        { bg: "rgba(124,108,252,.14)", color: "#7c6cfc", border: "rgba(124,108,252,.28)" },
  seller:       { bg: "rgba(96,165,250,.12)",  color: "#60a5fa", border: "rgba(96,165,250,.25)" },
  rental_owner: { bg: "rgba(42,245,192,.12)",  color: "#2af5c0", border: "rgba(42,245,192,.25)" },
  customer:     { bg: "rgba(255,255,255,.06)", color: "#8a8a9e", border: "rgba(255,255,255,.1)" },
};

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole]     = useState("");
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      if (role)   params.set("role", role);
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
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <div className="adm-page">
        <div className="adm-header">
          <div>
            <p className="adm-label">Admin</p>
            <h1 className="adm-title">Users</h1>
            <p className="adm-sub">Manage accounts — pause or remove users as needed.</p>
          </div>
          <span className="adm-meta">{total} total</span>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email…"
            style={{
              flex: 1, minWidth: 200, padding: "10px 14px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 10, fontSize: 13, outline: "none",
              color: "#e8e8f0", fontFamily: "'DM Mono', monospace",
            }}
          />
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            style={{
              padding: "10px 14px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 10, fontSize: 13, color: "#e8e8f0",
              fontFamily: "'DM Mono', monospace", outline: "none",
            }}
          >
            {ROLES.map((r) => <option key={r} value={r} style={{ background: "#111118" }}>{r || "All roles"}</option>)}
          </select>
          <button type="submit" className="adm-btn adm-btn-pri">Search</button>
        </form>

        <div className="adm-card">
          {loading ? (
            <div className="adm-loading">
              <div className="adm-spin" />
              Loading users…
            </div>
          ) : users.length === 0 ? (
            <div className="adm-empty">No users found.</div>
          ) : (
            <div className="adm-card-pad">
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      {["User", "Phone", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const rc = ROLE_COLORS[u.role] || ROLE_COLORS.customer;
                      return (
                        <tr key={u._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                background: "rgba(124,108,252,.2)",
                                overflow: "hidden", display: "flex", alignItems: "center",
                                justifyContent: "center", fontSize: 13, fontWeight: 700,
                                color: "#7c6cfc", flexShrink: 0,
                              }}>
                                {u.avatar
                                  ? <img src={u.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                                  : u.name[0].toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600, color: "#e8e8f0" }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ color: "#8a8a9e" }}>{u.phone}</td>
                          <td style={{ color: "#8a8a9e" }}>{u.email || "—"}</td>
                          <td>
                            <span className="adm-badge" style={{ background: rc.bg, color: rc.color, borderColor: rc.border }}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {u.isBanned
                              ? <span className="adm-badge adm-badge-rejected">Banned</span>
                              : <span className="adm-badge adm-badge-approved">Active</span>}
                          </td>
                          <td style={{ color: "#8a8a9e" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="adm-action-btns">
                              {u.role !== "admin" && (
                                <button
                                  onClick={() => handleBan(u._id, u.isBanned)}
                                  className={`adm-btn-sm ${u.isBanned ? "adm-btn-ok" : "adm-btn-danger"}`}
                                >
                                  {u.isBanned ? "Unban" : "Ban"}
                                </button>
                              )}
                              {u.role !== "admin" && (
                                <button
                                  onClick={() => handleDelete(u._id)}
                                  className="adm-btn-sm"
                                  style={{
                                    background: "rgba(255,255,255,.04)",
                                    borderColor: "rgba(255,255,255,.1)",
                                    color: "#8a8a9e",
                                  }}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pages > 1 && (
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="adm-btn-sm"
                      style={{
                        width: 36, height: 36, padding: 0,
                        background: p === page ? "rgba(124,108,252,.2)" : "rgba(255,255,255,.04)",
                        borderColor: p === page ? "rgba(124,108,252,.4)" : "rgba(255,255,255,.1)",
                        color: p === page ? "#7c6cfc" : "#8a8a9e",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

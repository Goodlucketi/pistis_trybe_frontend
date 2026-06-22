import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, ShieldOff, CheckCircle, Trash2, ChevronDown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, blockUser, unblockUser, verifyUser, changeUserRole, deleteAdminUser } from "../../../services/AdminService";
import DataTable from "../../../community/components/admin/DataTable";
import SearchBar from "../../../community/components/admin/SearchBar";
import Pagination from "../../../community/components/admin/Pagination";
import ConfirmModal from "../../../community/components/admin/ConfirmModal";
import { toast } from "react-toastify";

const roleColors = { super_admin: "bg-red-100 text-red-700", admin: "bg-purple-100 text-purple-700", user: "bg-gray-100 text-gray-600" };
const currentUser = () => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } };

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const me = currentUser();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter, statusFilter],
    queryFn: () => getAdminUsers({ page, limit: 20, search, role: roleFilter, status: statusFilter }),
    keepPreviousData: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const blockMut = useMutation({ mutationFn: (id) => blockUser(id), onSuccess: () => { toast.success("User blocked"); invalidate(); }, onError: (e) => toast.error(e?.response?.data?.message || "Failed") });
  const unblockMut = useMutation({ mutationFn: (id) => unblockUser(id), onSuccess: () => { toast.success("User unblocked"); invalidate(); }, onError: (e) => toast.error(e?.response?.data?.message || "Failed") });
  const verifyMut = useMutation({ mutationFn: (id) => verifyUser(id), onSuccess: () => { toast.success("User verified"); invalidate(); }, onError: (e) => toast.error(e?.response?.data?.message || "Failed") });
  const roleMut = useMutation({ mutationFn: ({ id, role }) => changeUserRole(id, role), onSuccess: () => { toast.success("Role updated"); invalidate(); }, onError: (e) => toast.error(e?.response?.data?.message || "Failed") });
  const deleteMut = useMutation({
    mutationFn: (id) => deleteAdminUser(id),
    onSuccess: () => { toast.success("User deleted"); invalidate(); setConfirm(null); },
    onError: (e) => { toast.error(e?.response?.data?.message || "Failed"); setConfirm(null); },
  });

  const columns = [
    {
      key: "user", label: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          {u.avatarUrl ? <img src={u.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" /> : (
            <div className="w-8 h-8 rounded-full bg-[#401667] flex items-center justify-center"><span className="text-white text-xs font-bold">{u.fullName?.charAt(0) || "?"}</span></div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">{u.fullName || "—"}</p>
            <p className="text-xs text-gray-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role", label: "Role",
      render: (u) => (
        <select value={u.role} disabled={u.role === "super_admin" || me?.role !== "super_admin"}
          onChange={(e) => roleMut.mutate({ id: u._id, role: e.target.value })}
          className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${roleColors[u.role]} disabled:cursor-default`}>
          <option value="user">user</option>
          <option value="admin">admin</option>
          {me?.role === "super_admin" && <option value="super_admin">super_admin</option>}
        </select>
      ),
    },
    { key: "postsCount", label: "Posts", render: (u) => <span className="text-sm text-gray-600">{u.postsCount ?? 0}</span> },
    {
      key: "isVerified", label: "Verified",
      render: (u) => (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {u.isVerified ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "status", label: "Status",
      render: (u) => (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {u.isBlocked ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      key: "joined", label: "Joined",
      render: (u) => <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "actions", label: "Actions",
      render: (u) => {
        if (u._id === me?._id) return <span className="text-xs text-gray-300">You</span>;
        if (u.role === "super_admin") return <span className="text-xs text-gray-300">—</span>;
        return (
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(`/admin/users/${u._id}`)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition" title="View"><Eye className="w-4 h-4" /></button>
            {!u.isVerified && (
              <button onClick={() => verifyMut.mutate(u._id)} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition" title="Verify"><CheckCircle className="w-4 h-4" /></button>
            )}
            {u.isBlocked ? (
              <button onClick={() => unblockMut.mutate(u._id)} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition" title="Unblock"><Shield className="w-4 h-4" /></button>
            ) : (
              <button onClick={() => blockMut.mutate(u._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition" title="Block"><ShieldOff className="w-4 h-4" /></button>
            )}
            {me?.role === "super_admin" && (
              <button onClick={() => setConfirm({ id: u._id, name: u.fullName })} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.pagination?.total ?? "—"} total members</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or email..." /></div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.users || []} isLoading={isLoading} emptyMsg="No users found." />
      <Pagination page={page} pages={data?.pagination?.pages} onPageChange={setPage} />

      <ConfirmModal
        isOpen={!!confirm}
        title="Delete user?"
        message={`This will permanently delete ${confirm?.name || "this user"} and soft-delete all their content. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMut.mutate(confirm?.id)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

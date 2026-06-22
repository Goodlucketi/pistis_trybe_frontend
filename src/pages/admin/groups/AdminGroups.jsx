import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Users } from "lucide-react";
import { getAdminGroups, adminDeleteGroup } from "../../../services/AdminService";
import DataTable from "../../../community/components/admin/DataTable";
import SearchBar from "../../../community/components/admin/SearchBar";
import Pagination from "../../../community/components/admin/Pagination";
import ConfirmModal from "../../../community/components/admin/ConfirmModal";
import { toast } from "react-toastify";

export default function AdminGroups() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-groups", page, search],
    queryFn: () => getAdminGroups({ page, limit: 20, search }),
    keepPreviousData: true,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminDeleteGroup(id),
    onSuccess: () => {
      toast.success("Group removed");
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      setConfirm(null);
    },
    onError: (e) => { toast.error(e?.response?.data?.message || "Failed"); setConfirm(null); },
  });

  const columns = [
    {
      key: "name", label: "Group",
      render: (g) => (
        <div className="flex items-center gap-3">
          {g.coverUrl ? (
            <img src={g.coverUrl} className="w-9 h-9 rounded-xl object-cover" alt="" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#401667] flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">{g.name}</p>
            {g.description && <p className="text-xs text-gray-400 truncate max-w-[160px]">{g.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "createdBy", label: "Created By",
      render: (g) => (
        <div className="flex items-center gap-2">
          {g.createdBy?.avatarUrl ? (
            <img src={g.createdBy.avatarUrl} className="w-6 h-6 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xs">{g.createdBy?.fullName?.charAt(0) || "?"}</span>
            </div>
          )}
          <span className="text-sm text-gray-700">{g.createdBy?.fullName || "Unknown"}</span>
        </div>
      ),
    },
    {
      key: "membersCount", label: "Members",
      render: (g) => (
        <span className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-3.5 h-3.5 text-gray-400" />{g.membersCount ?? 0}
        </span>
      ),
    },
    {
      key: "createdAt", label: "Created",
      render: (g) => <span className="text-xs text-gray-400">{new Date(g.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "actions", label: "Actions",
      render: (g) => (
        <button onClick={() => setConfirm({ id: g._id, name: g.name })}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition">
          <Trash2 className="w-3.5 h-3.5" /> Remove
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data?.pagination?.total ?? "—"} total groups</p>
      </div>

      <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search groups..." />

      <DataTable columns={columns} data={data?.groups || []} isLoading={isLoading} emptyMsg="No groups found." />
      <Pagination page={page} pages={data?.pagination?.pages} onPageChange={setPage} />

      <ConfirmModal
        isOpen={!!confirm}
        title={`Remove "${confirm?.name}"?`}
        message="This will remove the group, all its posts, and all memberships. This cannot be undone."
        confirmLabel="Remove Group"
        onConfirm={() => deleteMut.mutate(confirm?.id)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

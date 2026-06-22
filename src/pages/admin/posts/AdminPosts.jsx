import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, RotateCcw, Heart, Calendar } from "lucide-react";
import { getAdminPosts, adminDeletePost, adminRestorePost } from "../../../services/AdminService";
import DataTable from "../../../community/components/admin/DataTable";
import SearchBar from "../../../community/components/admin/SearchBar";
import Pagination from "../../../community/components/admin/Pagination";
import ConfirmModal from "../../../community/components/admin/ConfirmModal";
import { toast } from "react-toastify";

export default function AdminPosts() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-posts", page, search, status],
    queryFn: () => getAdminPosts({ page, limit: 20, search, status }),
    keepPreviousData: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-posts"] });

  const deleteMut = useMutation({
    mutationFn: (id) => adminDeletePost(id),
    onSuccess: () => { toast.success("Post removed"); invalidate(); setConfirm(null); },
    onError: (e) => { toast.error(e?.response?.data?.message || "Failed"); setConfirm(null); },
  });

  const restoreMut = useMutation({
    mutationFn: (id) => adminRestorePost(id),
    onSuccess: () => { toast.success("Post restored"); invalidate(); },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const columns = [
    {
      key: "author", label: "Author",
      render: (p) => (
        <div className="flex items-center gap-2">
          {p.authorId?.avatarUrl ? (
            <img src={p.authorId.avatarUrl} className="w-7 h-7 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#401667] flex items-center justify-center">
              <span className="text-white text-xs">{p.authorId?.fullName?.charAt(0) || "?"}</span>
            </div>
          )}
          <span className="text-sm font-medium text-gray-800">{p.authorId?.fullName || "Unknown"}</span>
        </div>
      ),
    },
    {
      key: "body", label: "Content",
      render: (p) => <p className="text-sm text-gray-600 max-w-xs truncate">{p.body}</p>,
    },
    {
      key: "likes", label: "Likes",
      render: (p) => (
        <span className="flex items-center gap-1 text-sm text-gray-600">
          <Heart className="w-3.5 h-3.5 text-red-400" />{p.likesCount ?? p.likes?.length ?? 0}
        </span>
      ),
    },
    {
      key: "visibility", label: "Visibility",
      render: (p) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${p.visibility === "public" ? "bg-green-100 text-green-700" : p.visibility === "group" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
          {p.visibility}
        </span>
      ),
    },
    {
      key: "createdAt", label: "Date",
      render: (p) => (
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="w-3.5 h-3.5" />{new Date(p.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions", label: "Actions",
      render: (p) => (
        <div className="flex items-center gap-1">
          {p.isDeleted ? (
            <button onClick={() => restoreMut.mutate(p._id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition">
              <RotateCcw className="w-3.5 h-3.5" /> Restore
            </button>
          ) : (
            <button onClick={() => setConfirm({ id: p._id })} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition">
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data?.pagination?.total ?? "—"} total posts</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search post content..." /></div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
          <option value="active">Active</option>
          <option value="deleted">Removed</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.posts || []} isLoading={isLoading} emptyMsg="No posts found." />
      <Pagination page={page} pages={data?.pagination?.pages} onPageChange={setPage} />

      <ConfirmModal
        isOpen={!!confirm}
        title="Remove this post?"
        message="The post author will be notified. The post can be restored later if needed."
        confirmLabel="Remove"
        onConfirm={() => deleteMut.mutate(confirm?.id)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

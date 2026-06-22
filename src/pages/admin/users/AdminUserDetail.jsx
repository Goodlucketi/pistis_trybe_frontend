import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Shield, ShieldOff, CheckCircle, Trash2, FileText, Users, Heart, MessageCircle } from "lucide-react";
import { getAdminUserDetail, blockUser, unblockUser, verifyUser, deleteAdminUser } from "../../../services/AdminService";
import ConfirmModal from "../../../community/components/admin/ConfirmModal";
import { toast } from "react-toastify";
import { useState } from "react";

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState(null);
  const me = (() => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } })();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => getAdminUserDetail(userId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-user-detail", userId] });

  const blockMut = useMutation({ mutationFn: () => blockUser(userId), onSuccess: () => { toast.success("User blocked"); invalidate(); }, onError: (e) => toast.error(e?.response?.data?.message || "Failed") });
  const unblockMut = useMutation({ mutationFn: () => unblockUser(userId), onSuccess: () => { toast.success("User unblocked"); invalidate(); }, onError: (e) => toast.error(e?.response?.data?.message || "Failed") });
  const verifyMut = useMutation({ mutationFn: () => verifyUser(userId), onSuccess: () => { toast.success("User verified"); invalidate(); }, onError: (e) => toast.error(e?.response?.data?.message || "Failed") });
  const deleteMut = useMutation({
    mutationFn: () => deleteAdminUser(userId),
    onSuccess: () => { toast.success("User deleted"); navigate("/admin/users"); },
    onError: (e) => { toast.error(e?.response?.data?.message || "Failed"); setConfirm(null); },
  });

  if (isLoading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { user, stats, recentPosts } = data || {};
  if (!user) return <p className="text-gray-500 text-center py-16">User not found.</p>;

  const isSelf = user._id === me?._id;
  const isSuperAdmin = user.role === "super_admin";

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate("/admin/users")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row gap-6 items-start">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} className="w-20 h-20 rounded-2xl object-cover shrink-0" alt="" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-[#401667] flex items-center justify-center shrink-0">
            <span className="text-white text-3xl font-bold">{user.fullName?.charAt(0) || "?"}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900">{user.fullName || "No name"}</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
              user.role === "super_admin" ? "bg-red-100 text-red-700"
              : user.role === "admin" ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-600"}`}>{user.role}</span>
            {user.isBlocked && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Blocked</span>}
            {user.isVerified && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Verified</span>}
          </div>
          <p className="text-sm text-gray-500 mb-1">{user.email}</p>
          {user.biography && <p className="text-sm text-gray-600 mt-2">{user.biography}</p>}
          <p className="text-xs text-gray-400 mt-2">Joined {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          <p className="text-xs text-gray-400">Sign-up method: <span className="font-medium capitalize">{user.singupMethod}</span></p>
        </div>

        {!isSelf && !isSuperAdmin && (
          <div className="flex flex-wrap gap-2 shrink-0">
            {!user.isVerified && (
              <button onClick={() => verifyMut.mutate()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition">
                <CheckCircle className="w-4 h-4" /> Verify
              </button>
            )}
            {user.isBlocked ? (
              <button onClick={() => unblockMut.mutate()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition">
                <Shield className="w-4 h-4" /> Unblock
              </button>
            ) : (
              <button onClick={() => blockMut.mutate()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition">
                <ShieldOff className="w-4 h-4" /> Block
              </button>
            )}
            {me?.role === "super_admin" && (
              <button onClick={() => setConfirm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Posts", value: stats?.postsCount, icon: <FileText className="w-4 h-4" /> },
          { label: "Followers", value: stats?.followersCount, icon: <Users className="w-4 h-4" /> },
          { label: "Following", value: stats?.followingCount, icon: <Users className="w-4 h-4" /> },
          { label: "Comments", value: stats?.commentsCount, icon: <MessageCircle className="w-4 h-4" /> },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value ?? 0}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      {recentPosts?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Recent Posts</h3>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post._id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-2">{post.body}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Heart className="w-3 h-3" />{post.likes?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirm}
        title="Delete this user?"
        message="This will permanently delete the user account and soft-delete all their posts and comments. This cannot be undone."
        confirmLabel="Delete User"
        onConfirm={() => deleteMut.mutate()}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Send, Trash2, ImagePlus, X, EyeOff, Eye, Pencil } from "lucide-react";
import { getAdminAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../../../services/AnnouncementService";
import Pagination from "../../../community/components/admin/Pagination";
import ConfirmModal from "../../../community/components/admin/ConfirmModal";
import { toast } from "react-toastify";

const EMPTY_FORM = { title: "", body: "", targetRole: "all" };

export default function AdminAnnouncements() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-announcements", page],
    queryFn: () => getAdminAnnouncements(page, 20),
    keepPreviousData: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });

  const createMut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("body", form.body);
      fd.append("targetRole", form.targetRole);
      if (imageFile) fd.append("file", imageFile);
      return createAnnouncement(fd);
    },
    onSuccess: () => { toast.success("Announcement published!"); invalidate(); resetForm(); },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to publish"),
  });

  const updateMut = useMutation({
    mutationFn: () => updateAnnouncement(editingId, { title: form.title, body: form.body }),
    onSuccess: () => { toast.success("Updated!"); invalidate(); resetForm(); },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to update"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteAnnouncement(id),
    onSuccess: () => { toast.success("Deleted"); invalidate(); setConfirm(null); },
    onError: (e) => { toast.error(e?.response?.data?.message || "Failed"); setConfirm(null); },
  });

  const togglePublishMut = useMutation({
    mutationFn: ({ id, isPublished }) => updateAnnouncement(id, { isPublished }),
    onSuccess: (_, { isPublished }) => { toast.success(isPublished ? "Published" : "Unpublished"); invalidate(); },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleEdit = (a) => {
    setForm({ title: a.title, body: a.body, targetRole: a.targetRole || "all" });
    setImageFile(null);
    setImagePreview(a.imageUrl || null);
    setEditingId(a._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSubmit = form.title.trim() && form.body.trim();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Announcements appear in the community feed and send in-app notifications.
        </p>
      </div>

      {/* Compose form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 pb-5 border-b border-gray-100 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-[#401667]" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{editingId ? "Edit Announcement" : "New Announcement"}</p>
            <p className="text-xs text-gray-400">
              Reaches users as a feed post AND an in-app notification
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Welcome to Pistis Trybe V1! 🎉"
              maxLength={120}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.title.length}/120</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="Write your announcement here..."
              rows={5}
              maxLength={1000}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.body.length}/1000</p>
          </div>

          {/* Image upload */}
          {!editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Image <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img src={imagePreview} alt="preview" className="w-80 object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 transition w-full"
                >
                  <ImagePlus className="w-5 h-5" />
                  Click to attach an image
                </button>
              )}
            </div>
          )}

          {/* Target audience */}
          {!editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Target Audience
              </label>
              <select
                value={form.targetRole}
                onChange={(e) => setForm((p) => ({ ...p, targetRole: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="all">Everyone</option>
                <option value="user">Regular users only</option>
                <option value="admin">Admins only</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Blocked users are always excluded.</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            {editingId && (
              <button onClick={resetForm}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
            )}
            <button
              onClick={() => editingId ? updateMut.mutate() : createMut.mutate()}
              disabled={!canSubmit || createMut.isPending || updateMut.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-[#401667] hover:bg-[#2e1048] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition"
            >
              {(createMut.isPending || updateMut.isPending) ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {editingId ? "Save Changes" : "Publish Announcement"}
            </button>
          </div>
        </div>
      </div>

      {/* Past announcements */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Published Announcements
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data?.announcements?.length ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-sm text-gray-400">
            No announcements yet.
          </div>
        ) : (
          <div className="space-y-3">
            {data.announcements.map((a) => (
              <div key={a._id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start gap-4">
                  {a.imageUrl && (
                    <img src={a.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {a.isPublished ? "Published" : "Hidden"}
                      </span>
                      {a.targetRole && a.targetRole !== "all" && (
                        <span className="text-xs text-gray-400 capitalize">· {a.targetRole}s only</span>
                      )}
                      <span className="text-xs text-gray-400">
                        · {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.body}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePublishMut.mutate({ id: a._id, isPublished: !a.isPublished })}
                      className={`p-2 rounded-lg transition ${a.isPublished ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-gray-400 hover:text-green-600"}`}
                      title={a.isPublished ? "Unpublish" : "Publish"}
                    >
                      {a.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(a)}
                      className="p-2 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-[#401667] transition"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirm({ id: a._id, title: a.title })}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} pages={data?.pagination?.pages} onPageChange={setPage} />
      </div>

      <ConfirmModal
        isOpen={!!confirm}
        title={`Delete "${confirm?.title}"?`}
        message="This announcement will be removed from the feed and cannot be recovered."
        confirmLabel="Delete"
        onConfirm={() => deleteMut.mutate(confirm?.id)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

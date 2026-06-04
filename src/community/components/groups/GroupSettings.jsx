import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2, Save, Upload } from "lucide-react";
import { getGroupById, updateGroup, deleteGroup } from "../../../services/GroupService";
import { getMe } from "../../../services/UserService";
import getErrorMessage from "../../../hooks/useErrorToast";
import { toast } from "react-toastify";

const GroupSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroupById(id),
    enabled: !!id,
  });

  const [form, setForm] = useState({ name: "", description: "" });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    if (group) {
      setForm({ name: group.name || "", description: group.description || "" });
      setCoverPreview(group.coverUrl || null);
    }
  }, [group]);

  const isAdmin = group?.userRole === "admin" || group?.createdBy?._id === currentUser?._id;

  const updateMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.description) formData.append("description", form.description);
      if (coverFile) formData.append("file", coverFile);
      return updateGroup(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Group updated successfully!");
      navigate(`/dashboard/groups/${id}`);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      navigate("/dashboard/groups");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return (
    <div className="p-8 text-center text-gray-400">Access denied. Admins only.</div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(`/dashboard/groups/${id}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Group
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Group Settings</h1>

        <div className="space-y-5">
          {/* Cover image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <div
              className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#401667] transition cursor-pointer bg-gray-50"
              onClick={() => document.getElementById("cover-input").click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-400">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">Click to update cover image</span>
                </div>
              )}
              <input id="cover-input" type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="What is this group about?"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => updateMutation.mutate()}
              disabled={!form.name.trim() || updateMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#401667] text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              <Save size={16} /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => { if (confirm("Delete this group? This cannot be undone.")) deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition ml-auto disabled:opacity-50"
            >
              <Trash2 size={16} /> {deleteMutation.isPending ? "Deleting..." : "Delete Group"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSettings;
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2, Save } from "lucide-react";
import { getGroupById, updateGroup, deleteGroup } from "../../../services/GroupService";

const GroupSettings = ({ currentUserId = 1 }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: community } = useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroupById(id),
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    isPrivate: false
  });

  // Sync form when data loads
  useState(() => {
    if (community) {
      setForm({
        title: community.title,
        description: community.description,
        image: community.image,
        isPrivate: community.isPrivate || false
      });
    }
  }, [community]);

  const currentUserRole = community?.members?.find(m => m.id === currentUserId)?.role;
  
  const updateMutation = useMutation({
    mutationFn: (data) => updateGroup({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      alert("Settings saved!");
      navigate(`/dashboard/groups/${id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      navigate('/dashboard/groups');
    },
  });

  if (currentUserRole!== "admin") {
    return <div className="p-8">Access denied. Admin only.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6">
      <button onClick={() => navigate(`/dashboard/groups/${id}`)} className="flex items-center gap-2 text-gray-600 mb-6">
        <ArrowLeft size={20} /> Back to Group
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Group Settings</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Group Name</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#401667]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#401667]"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Banner Image URL</label>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#401667]"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="private"
              checked={form.isPrivate}
              onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="private" className="text-sm">Private Group - Require approval to join</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => updateMutation.mutate(form)}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-[#401667] text-white rounded-lg hover:bg-[#2e1048] disabled:opacity-50"
            >
              <Save size={18} /> {updateMutation.isPending? "Saving..." : "Save Changes"}
            </button>
            <button 
              onClick={() => {
                if (confirm("Delete this group? This cannot be undone.")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-auto disabled:opacity-50"
            >
              <Trash2 size={18} /> Delete Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSettings;
// src/pages/groups/GroupSettings.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Trash2, Save } from "lucide-react";
import communitiesData from "../../store/data/communities.json";

const GroupSettings = ({ currentUserId = 1 }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const communityData = communitiesData.find(c => c.id === Number(id));
  const [form, setForm] = useState({
    title: communityData?.title || "",
    description: communityData?.description || "",
    image: communityData?.image || "",
    isPrivate: false
  });

  const currentUserRole = communityData?.members?.find(m => m.id === currentUserId)?.role;
  
  if (currentUserRole !== "admin") {
    return <div className="p-8">Access denied. Admin only.</div>;
  }

  const handleSave = () => {
    // Update logic here
    alert("Settings saved!");
    navigate(`/dashboard/groups/${id}`);
  };

  const handleDelete = () => {
    if (confirm("Delete this group? This cannot be undone.")) {
      // Delete logic here
      navigate('/dashboard/groups');
    }
  };

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
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-[#401667] text-white rounded-lg hover:bg-[#2e1048]"
            >
              <Save size={18} /> Save Changes
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-auto"
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
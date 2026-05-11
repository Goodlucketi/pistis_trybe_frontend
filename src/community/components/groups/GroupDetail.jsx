// src/pages/groups/GroupDetail.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { ArrowLeft, MoreVertical, Users, Settings, Pin, Trash2 } from "lucide-react";
import communitiesData from "../../store/data/communities.json";

const GroupDetail = ({ currentUserId = 1 }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([
    { id: 1, userId: 2, text: "Excited for today's session!", timestamp: new Date().toISOString(), pinned: false },
    { id: 2, userId: 1, text: "Remember to bring your mats", timestamp: new Date().toISOString(), pinned: true }
  ]);
  const [newPost, setNewPost] = useState("");

  const community = communitiesData.find(c => c.id === Number(id));
  const member = community?.members?.find(m => m.id === currentUserId);
  const userRole = member?.role || "non-member";
  const canPost = userRole !== "non-member";

  const handlePost = () => {
    if (!newPost.trim()) return;
    setPosts([{ 
      id: Date.now(), 
      userId: currentUserId, 
      text: newPost, 
      timestamp: new Date().toISOString(),
      pinned: false 
    }, ...posts]);
    setNewPost("");
  };

  const handlePin = (postId) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, pinned: !p.pinned } : p));
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  if (!community) return <div className="p-8">Group not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
        <div 
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${community.image})` }}
        />
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <button onClick={() => navigate('/dashboard/groups')} className="flex items-center gap-2 text-gray-600 mb-3">
                <ArrowLeft size={20} /> Back
              </button>
              <h1 className="text-3xl font-bold">{community.title}</h1>
              <p className="text-gray-600 mt-1">{community.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <Link to={`/dashboard/groups/${id}/members`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#401667]">
                  <Users size={16} /> {community.membersCount} members
                </Link>
                {userRole === "admin" && (
                  <span className="px-3 py-1 bg-[#401667] text-white text-xs rounded-full">Admin</span>
                )}
                {userRole === "member" && (
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">Member</span>
                )}
              </div>
            </div>
            {userRole === "admin" && (
              <Link to={`/dashboard/groups/${id}/settings`} className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Post Box - Only for members/admin */}
      {canPost && (
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share something with the group..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#401667]"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <button 
              onClick={handlePost}
              className="px-6 py-2 bg-[#401667] text-white rounded-lg hover:bg-[#2e1048]"
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts
          .sort((a, b) => (b.pinned - a.pinned) || new Date(b.timestamp) - new Date(a.timestamp))
          .map(post => {
            const author = community.members.find(m => m.id === post.userId);
            return (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={author?.avatar} alt={author?.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">{author?.name}</p>
                      <p className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleString()}</p>
                    </div>
                    {post.pinned && <Pin size={16} className="text-[#401667]" />}
                  </div>
                  {userRole === "admin" && (
                    <div className="flex gap-2">
                      <button onClick={() => handlePin(post.id)} className="p-1 hover:bg-gray-100 rounded">
                        <Pin size={16} />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="p-1 hover:bg-gray-100 rounded text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-800">{post.text}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default GroupDetail;
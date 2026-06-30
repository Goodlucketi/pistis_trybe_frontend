import { useState, useRef } from "react";
import { X, Camera, Users, Crown, Trash2, UserMinus, Check, Pencil } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGroupChat } from "../../../services/ChatService";
import { toast } from "react-toastify";

export default function GroupInfoModal({
  isOpen, onClose, conversation, currentUser,
  contacts, onAddMembers, onRemoveMember, onPromoteAdmin,
  onLeaveGroup, onDeleteGroup, onUpdateGroupName, onUpdateGroupAvatar,
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(conversation?.name || "");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const isAdmin = conversation?.participants?.some(
    (p) => p?.id === currentUser?.id && p?.role === "admin"
  );

  const updateMut = useMutation({
    mutationFn: ({ name, avatarFile }) =>
      updateGroupChat(conversation?.id, { name, avatarFile }),
    onSuccess: (updated) => {
      if (updated?.name) onUpdateGroupName?.(updated.name);
      if (updated?.coverUrl) onUpdateGroupAvatar?.(updated.coverUrl);
      toast.success("Group updated");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setEditingName(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to update group"),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = () => {
    if (!avatarFile) return;
    updateMut.mutate({ avatarFile });
  };

  const handleSaveName = () => {
    if (!newName.trim() || newName.trim() === conversation?.name) {
      setEditingName(false);
      return;
    }
    updateMut.mutate({ name: newName.trim() });
  };

  if (!isOpen || !conversation) return null;

  const displayAvatar = avatarPreview || conversation?.avatar;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-900">Group Info</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Avatar + Name */}
          <div className="flex flex-col items-center p-6 pb-4">
            {/* FIX: Avatar upload */}
            <div className="relative mb-3">
              {displayAvatar ? (
                <img src={displayAvatar} alt={conversation.name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-100" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#401667] flex items-center justify-center ring-4 ring-gray-100">
                  <Users className="w-8 h-8 text-white" />
                </div>
              )}

              {isAdmin && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-[#401667] rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-[#2e1048] transition"
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Save avatar button */}
            {avatarFile && (
              <button
                onClick={handleSaveAvatar}
                disabled={updateMut.isPending}
                className="mb-2 px-3 py-1.5 bg-[#401667] text-white text-xs font-medium rounded-lg hover:bg-[#2e1048] transition disabled:opacity-50 flex items-center gap-1"
              >
                {updateMut.isPending ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Save Photo
              </button>
            )}

            {/* Group name */}
            {editingName ? (
              <div className="flex items-center gap-2 w-full max-w-xs">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                  className="flex-1 text-center font-bold text-gray-900 px-3 py-1.5 border border-purple-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <button onClick={handleSaveName} disabled={updateMut.isPending}
                  className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingName(false)}
                  className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900 text-lg">{conversation.name}</h4>
                {isAdmin && (
                  <button onClick={() => { setNewName(conversation.name); setEditingName(true); }}
                    className="p-1 hover:bg-gray-100 rounded-full transition">
                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            )}

            <p className="text-sm text-gray-400 mt-0.5">
              {conversation.participants?.length || 0} members
            </p>
          </div>

          {/* Members list */}
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Members</p>
            <div className="space-y-1">
              {(conversation.participants || []).map((p) => {
                if (!p?.id) return null;
                const isCurrentUser = p.id === currentUser?.id;
                const isMemberAdmin = p.role === "admin";
                return (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 group">
                    {p.avatar ? (
                      <img src={p.avatar} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{p.name?.charAt(0) || "?"}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {p.name} {isCurrentUser && <span className="text-gray-400 font-normal">(you)</span>}
                      </p>
                      {isMemberAdmin && (
                        <p className="text-xs text-purple-500 font-semibold flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Admin
                        </p>
                      )}
                    </div>
                    {isAdmin && !isCurrentUser && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isMemberAdmin && (
                          <button onClick={() => onPromoteAdmin?.(p.id)}
                            className="p-1.5 hover:bg-purple-50 text-gray-400 hover:text-purple-600 rounded-lg transition" title="Make Admin">
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => onRemoveMember?.(p.id)}
                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition" title="Remove">
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danger zone */}
          <div className="p-4 space-y-2 border-t border-gray-100 mt-2">
            <button
              onClick={() => { onLeaveGroup?.(); onClose(); }}
              className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
            >
              Leave Group
            </button>
            {isAdmin && (
              <button
                onClick={() => { onDeleteGroup?.(); onClose(); }}
                className="w-full px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Group
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

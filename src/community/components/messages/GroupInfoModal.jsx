import { X, UserPlus, LogOut, Crown, Shield, MoreVertical, Trash2, Camera, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";

const GroupInfoModal = ({
  isOpen,
  onClose,
  conversation,
  currentUser,
  contacts = [],
  onAddMembers,
  onRemoveMember,
  onPromoteAdmin,
  onLeaveGroup,
  onDeleteGroup,
  onUpdateGroupName,
  onUpdateGroupAvatar
}) => {
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [memberMenuOpen, setMemberMenuOpen] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const menuRef = useRef(null);

  // ← GUARD: don't render if critical props missing
  if (!isOpen ||!conversation || conversation.type!== 'group' ||!currentUser) return null;

  // ← SAFE: update newName when conversation changes
  useEffect(() => {
    setNewName(conversation?.name || "");
  }, [conversation?.name]);

  const participants = conversation.participants || [];
  const currentUserRole = participants.find(p => p?.id === currentUser.id)?.role;
  const isAdmin = currentUserRole === 'admin';
  const isCreator = conversation.createdBy === currentUser.id;

  const availableContacts = (contacts || []).filter(c =>
 !participants.find(p => p?.id === c?.id)
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current &&!menuRef.current.contains(e.target)) {
        setMemberMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddMembers = () => {
    if (selectedToAdd.length === 0) return;
    onAddMembers(selectedToAdd);
    setSelectedToAdd([]);
    setShowAddMembers(false);
  };

  const handleSaveName = () => {
    if (newName.trim() && newName!== conversation.name) {
      onUpdateGroupName(newName.trim());
    }
    setIsEditingName(false);
  };

  const toggleAddMember = (contact) => {
    setSelectedToAdd(prev =>
      prev.find(m => m?.id === contact?.id)
     ? prev.filter(m => m?.id!== contact?.id)
        : [...prev, contact]
    );
  };

  // ← SAFE: handle null createdAt
  const getCreatedDate = () => {
    if (!conversation.createdAt) return "";
    try {
      const date = new Date(conversation.createdAt);
      if (isNaN(date.getTime())) return "";
      return format(date, "MMM d, yyyy");
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h- flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Group Info</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Group profile */}
          <div className="p-6 text-center border-b">
            <div className="relative inline-block">
              <img
                src={conversation.avatar || "/default-group.png"}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
                alt={conversation.name || "Group"}
              />
              {isAdmin && (
                <button
                  onClick={() => onUpdateGroupAvatar?.()}
                  className="absolute bottom-3 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditingName && isAdmin? (
              <div className="flex items-center gap-2 justify-center">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="text-xl font-semibold text-center border-b-2 border-purple-500 focus:outline-none"
                  autoFocus
                />
              </div>
            ) : (
              <h3
                className={`text-xl font-semibold ${isAdmin? 'cursor-pointer hover:text-purple-600' : ''}`}
                onClick={() => isAdmin && setIsEditingName(true)}
              >
                {conversation.name || "Group Chat"}
              </h3>
            )}

            <p className="text-sm text-gray-500 mt-1">
              Created {getCreatedDate()}
            </p>
            <p className="text-sm text-gray-500">
              {participants.length} members
            </p>
          </div>

          {/* Members section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Members</h4>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMembers(true)}
                  className="text-purple-600 text-sm font-medium flex items-center gap-1 hover:text-purple-700"
                >
                  <UserPlus className="w-4 h-4" />
                  Add
                </button>
              )}
            </div>

            <div className="space-y-1">
              {participants.map(member => (
                <div key={member?.id || Math.random()} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={member?.avatar || "/default-avatar.png"}
                      className="w-10 h-10 rounded-full object-cover"
                      alt={member?.name || "User"}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {member?.name || "Unknown"} {member?.id === currentUser.id && '(You)'}
                      </p>
                      <div className="flex items-center gap-1">
                        {member?.role === 'admin' && (
                          <div className="flex items-center gap-1 text-xs text-purple-600">
                            <Crown className="w-3 h-3" />
                            Admin
                          </div>
                        )}
                        {conversation.createdBy === member?.id && (
                          <span className="text-xs text-gray-500">Creator</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Member menu - only for admins, not self, not creator */}
                  {isAdmin && member?.id!== currentUser.id && conversation.createdBy!== member?.id && (
                    <div className="relative">
                      <button
                        onClick={() => setMemberMenuOpen(memberMenuOpen === member.id? null : member.id)}
                        className="p-1.5 hover:bg-gray-200 rounded-full"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {memberMenuOpen === member.id && (
                        <div ref={menuRef} className="absolute right-0 top-8 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10 w-40">
                          {member?.role!== 'admin' && (
                            <button
                              onClick={() => {
                                onPromoteAdmin(member.id);
                                setMemberMenuOpen(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4" />
                              Make Admin
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onRemoveMember(member.id);
                              setMemberMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t space-y-2">
            <button
              onClick={() => {
                if (window.confirm('Leave this group?')) {
                  onLeaveGroup();
                  onClose();
                }
              }}
              className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Leave Group</span>
            </button>

            {isCreator && (
              <button
                onClick={() => {
                  if (window.confirm('Delete this group for everyone? This cannot be undone.')) {
                    onDeleteGroup();
                    onClose();
                  }
                }}
                className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Delete Group</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Members Modal */}
      {showAddMembers && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h- flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Add Members</h3>
              <button onClick={() => setShowAddMembers(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {availableContacts.length === 0? (
                <p className="text-center text-gray-500 py-8">All contacts already in group</p>
              ) : (
                availableContacts.map(contact => {
                  const isSelected = selectedToAdd.find(m => m?.id === contact?.id);
                  return (
                    <button
                      key={contact?.id}
                      onClick={() => toggleAddMember(contact)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <img
                        src={contact?.avatar || "/default-avatar.png"}
                        className="w-10 h-10 rounded-full object-cover"
                        alt={contact?.name || "Contact"}
                      />
                      <span className="font-medium">{contact?.name || "Unknown"}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={handleAddMembers}
                disabled={selectedToAdd.length === 0}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300"
              >
                Add {selectedToAdd.length > 0 && `(${selectedToAdd.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfoModal;

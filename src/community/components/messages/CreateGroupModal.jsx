import { X, Camera, Check } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "react-toastify";

const CreateGroupModal = ({ isOpen, onClose, contacts, currentUser, onCreateGroup }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const toggleMember = (contact) => {
    setSelectedMembers((prev) =>
      prev.find((m) => m.id === contact.id)
       ? prev.filter((m) => m.id!== contact.id)
        : [...prev, contact]
    );
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setGroupName("");
    setSelectedMembers([]);
    setGroupAvatar(null);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      toast.error("Enter a group name");
      return;
    }
    if (selectedMembers.length < 2) {
      toast.error("Add at least 2 members");
      return;
    }

    onCreateGroup({
      name: groupName.trim(),
      participantIds: [currentUser.id,...selectedMembers.map((m) => m.id)], // include creator
      avatarFile,
      avatarPreview: groupAvatar,
    });

    resetForm();
    onClose();
  };

  const resetAndClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed top-0 inset-0 backdrop-blur-sm bg-white/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 flex-shrink-0">
          <h2 className="text-lg font-semibold">New Group</h2>
          <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group info */}
        <div className="p-4 shadow-md flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <button
                onClick={handleAvatarClick}
                className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden hover:opacity-80 transition group"
              >
                {groupAvatar? (
                  <img src={groupAvatar} className="w-full h-full object-cover" alt="Group" />
                ) : (
                  <Camera className="w-6 h-6 text-purple-600 group-hover:scale-110 transition" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              maxLength={50}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {selectedMembers.length} {selectedMembers.length === 1? "member" : "members"}
          </p>
        </div>

        {/* Contact list - scrollable */}
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {contacts.length === 0? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No contacts available
            </div>
          ) : (
            contacts
             .filter((c) => c.id!== currentUser.id) // don't show yourself
             .map((contact) => {
                const isSelected = selectedMembers.find((m) => m.id === contact.id);
                return (
                  <button
                    key={contact.id}
                    onClick={() => toggleMember(contact)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                         ? "bg-purple-600 border-purple-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <img
                      src={contact.avatar}
                      className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                      alt={contact.name}
                    />
                    <span className="font-medium text-left truncate">{contact.name}</span>
                  </button>
                );
              })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex-shrink-0">
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedMembers.length < 2}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Create Group
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Add at least 2 members
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;

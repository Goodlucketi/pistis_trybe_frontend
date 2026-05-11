import { X, Camera, Check } from "lucide-react";
import { useState } from "react";

const CreateGroupModal = ({ isOpen, onClose, contacts, currentUser, onCreateGroup }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);

  if (!isOpen) return null;

  const toggleMember = (contact) => {
    setSelectedMembers(prev => 
      prev.find(m => m.id === contact.id)
        ? prev.filter(m => m.id !== contact.id)
        : [...prev, contact]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedMembers.length < 1) return;

    onCreateGroup({
      name: groupName.trim(),
      participantIds: selectedMembers.map((m) => m.id),
    });

    setGroupName("");
    setSelectedMembers([]);
    setGroupAvatar(null);
    onClose();
  };

  return (
    <div className="fixed top-20 inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header - fixed */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold">New Group</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group info - fixed */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                {groupAvatar ? (
                  <img src={groupAvatar} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-purple-600" />
                )}
              </div>
            </div>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {selectedMembers.length} {selectedMembers.length === 1? 'member' : 'members'}
          </p>
        </div>

        {/* Contact list - ONLY scrollable area */}
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {contacts.length === 0? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No contacts available
            </div>
          ) : (
            contacts.map(contact => {
              const isSelected = selectedMembers.find(m => m.id === contact.id);
              return (
                <button
                  key={contact.id}
                  onClick={() => toggleMember(contact)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <img src={contact.avatar} className="w-10 h-10 rounded-full flex-shrink-0" />
                  <span className="font-medium text-left">{contact.name}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer - fixed */}
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
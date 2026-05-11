import { X } from "lucide-react";

const ForwardModal = ({ message, conversations, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md max-h- flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Forward message</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-gray-50 border-b">
          <p className="text-sm text-gray-600 truncate">{message.text}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => {
            const name = conv.type === "group"? conv.name : conv.participants.find(p => p.id!== 1)?.name;
            return (
              <button
                key={conv.id}
                onClick={() => onConfirm(conv.id)}
                className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 text-left border-b"
              >
                <img src={conv.avatar || conv.participants[1]?.avatar} className="w-10 h-10 rounded-full" />
                <span className="font-medium">{name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
import { MessageSquare } from "lucide-react";

const EmptyChatState = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Messages</h3>
        <p className="text-gray-500">Select a conversation to start chatting</p>
      </div>
    </div>
  );
};

export default EmptyChatState;
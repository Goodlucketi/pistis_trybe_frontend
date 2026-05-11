import { useState, useEffect } from "react";
import { X, Search, MessageCircle, AlertCircle } from "lucide-react";
import { searchUsers } from "../../../services/UserService";

const NewChatModal = ({ isOpen, onClose, onStartChat, currentUserId }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const users = await searchUsers(query.trim());
        setResults(Array.isArray(users) ? users : []);
      } catch (err) {
        setError(err?.message || "Search failed. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">New Message</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition ${
            error ? "border-red-300 bg-red-50" : "bg-gray-100 border-transparent"
          }`}>
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
            />
            {loading && (
              <div className="w-4 h-4 border-2 border-[#401667] border-t-transparent rounded-full animate-spin shrink-0" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Empty prompt */}
          {!loading && !error && query.trim().length < 2 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Type at least 2 characters to search
            </div>
          )}

          {/* No results */}
          {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No users found for "<span className="font-medium">{query}</span>"
            </div>
          )}

          {/* Results list */}
          {!error && results.map((user) => (
            <button
              key={user._id}
              onClick={() => {
                onStartChat(user);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {user.fullName?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName || "No name set"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <MessageCircle className="w-4 h-4 text-[#401667] shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
import { useEffect, useRef } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { markNotificationsRead } from "../../../services/NotificationService";
import { Heart, MessageCircle, UserPlus, Bell, X } from "lucide-react";

const typeIcon = {
  post_like: <Heart className="w-4 h-4 text-red-500" />,
  post_comment: <MessageCircle className="w-4 h-4 text-blue-500" />,
  follow: <UserPlus className="w-4 h-4 text-green-500" />,
  group_invite: <Bell className="w-4 h-4 text-purple-500" />,
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function NotificationsPanel({ notifications = [], onClose }) {
  const panelRef = useRef(null);
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: () => markNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Mark all as read when panel opens
  useEffect(() => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length > 0) markReadMutation.mutate();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute left-0 top-0 ml-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition ${
                !n.isRead ? "bg-purple-50/50" : ""
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {typeIcon[n.type] || <Bell className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-snug">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-[#401667] mt-1.5 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

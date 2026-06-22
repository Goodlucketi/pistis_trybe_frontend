import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Megaphone, Send } from "lucide-react";
import { broadcastAnnouncement } from "../../../services/AdminService";
import { toast } from "react-toastify";

export default function AdminAnnouncements() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const sendMut = useMutation({
    mutationFn: () => broadcastAnnouncement({ title: title.trim(), body: body.trim(), targetRole: targetRole || undefined }),
    onSuccess: (data) => {
      toast.success(`Sent to ${data.recipientCount} users`);
      setLastResult(data);
      setTitle("");
      setBody("");
      setTargetRole("");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to send"),
  });

  const canSend = title.trim().length > 0 && body.trim().length > 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-sm text-gray-500 mt-0.5">Broadcast a notification to all or selected users</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-[#401667]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">New Announcement</p>
            <p className="text-xs text-gray-400">Recipients receive this as an in-app notification</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Welcome to Pistis Trybe V1!"
            maxLength={100}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your announcement message here..."
            rows={5}
            maxLength={500}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/500</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
          <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
            <option value="">All users</option>
            <option value="user">Regular users only</option>
            <option value="admin">Admins only</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Blocked users are always excluded.</p>
        </div>

        {/* Preview */}
        {(title || body) && (
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">Preview</p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{title || "Title..."}</p>
                <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-line">{body || "Your message..."}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => sendMut.mutate()}
          disabled={!canSend || sendMut.isPending}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#401667] hover:bg-[#2e1048] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition">
          {sendMut.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {sendMut.isPending ? "Sending..." : "Send Announcement"}
        </button>
      </div>

      {lastResult && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-sm text-green-800">
            Last announcement sent to <strong>{lastResult.recipientCount} users</strong> successfully.
          </p>
        </div>
      )}
    </div>
  );
}

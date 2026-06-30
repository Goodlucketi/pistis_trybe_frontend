import { Megaphone, Calendar } from "lucide-react";

const roleColors = {
  all: "bg-purple-100 text-purple-700",
  admin: "bg-red-100 text-red-700",
  user: "bg-blue-100 text-blue-700",
};

export default function AnnouncementCard({ announcement: a }) {
  if (!a) return null;

  return (
    <div className="bg-gradient-to-br from-[#401667]/5 to-purple-50 rounded-2xl sm:rounded-3xl border border-purple-200 p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Header badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#401667] flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-[#401667] uppercase tracking-wider">
              Announcement
            </span>
            {a.targetRole && a.targetRole !== "all" && (
              <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${roleColors[a.targetRole]}`}>
                {a.targetRole}s only
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(a.createdAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          })}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-base sm:text-lg my-2 leading-snug">
        {a.title}
      </h3>

      {/* Image */}
      {a.imageUrl && (
        <div className="rounded-xl overflow-hidden mb-3">
          <img
            src={a.imageUrl}
            alt={a.title}
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      {/* Body */}
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {a.body}
      </p>

      {/* Footer — posted by */}
      {a.publishedBy && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-purple-100">
          {a.publishedBy.avatarUrl ? (
            <img src={a.publishedBy.avatarUrl} className="w-6 h-6 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">
                {a.publishedBy.fullName?.charAt(0) || "A"}
              </span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Posted by <span className="font-semibold text-gray-700">{a.publishedBy.fullName}</span>
            <span className="ml-1 text-[10px] text-purple-500 capitalize font-medium">
              · {a.publishedBy.role?.replace("_", " ")}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

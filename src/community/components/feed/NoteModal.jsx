import { X, Check } from "lucide-react";
import { TRANSLATIONS } from "../../store/readingPlans";

const NoteModal = ({
  isOpen,
  onClose,
  selectedBook,
  selectedChapter,
  translation,
  passage,
  noteTitle,
  setNoteTitle,
  noteContent,
  setNoteContent,
  mutation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Add Note</h3>
            <p className="text-xs text-[#401667] mt-0.5">
              {selectedBook} {selectedChapter} · {TRANSLATIONS.find((t) => t.id === translation)?.short}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {passage?.verses?.[0] && (
          <div className="mx-5 mt-4 px-3 py-2 bg-purple-50 border-l-2 border-[#401667] rounded-r-lg">
            <p className="text-xs text-gray-500 italic line-clamp-2">
              "{passage.verses[0].text}..."
            </p>
          </div>
        )}

        <div className="p-5 space-y-3">
          <input
            autoFocus
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-400"
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write your thoughts, reflections, prayer..."
            rows={5}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!noteContent.trim() || mutation.isPending}
            className="flex-1 py-2.5 bg-[#401667] text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {mutation.isPending ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
import { ChevronDown, ChevronUp, Plus, Share2, StickyNote, Trash2 } from "lucide-react";

const NotesTab = ({ notes, expandedNote, setExpandedNote, shareNoteMutation, deleteNoteMutation, onNewNote }) => (
  <div className="p-4">
    <button
      onClick={onNewNote}
      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-purple-200 rounded-xl text-sm text-[#401667] hover:bg-purple-50 transition mb-4"
    >
      <Plus className="w-4 h-4" /> New Note
    </button>

    {notes.length === 0 && (
      <div className="text-center py-10 text-gray-400 text-sm">
        <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p>No notes yet.</p>
        <p className="text-xs mt-1">Go to Read tab and tap "Add Note" while reading.</p>
      </div>
    )}

    <div className="space-y-3">
      {notes.map((note) => (
        <div key={note._id} className="border border-gray-200 rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-3 bg-gray-50 cursor-pointer"
            onClick={() => setExpandedNote(expandedNote === note._id ? null : note._id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {note.title || note.reference || "Untitled Note"}
              </p>
              {note.reference && (
                <p className="text-xs text-[#401667]">{note.reference} · {note.translation?.toUpperCase()}</p>
              )}
            </div>
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleDateString()}</span>
              {expandedNote === note._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>

          {expandedNote === note._id && (
            <div className="px-3 py-3">
              {note.verseText && (
                <p className="text-xs text-gray-500 italic border-l-2 border-purple-300 pl-2 mb-2">"{note.verseText}..."</p>
              )}
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{note.content}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => { if (window.confirm("Share this note to your feed?")) shareNoteMutation.mutate(note._id); }}
                  disabled={shareNoteMutation.isPending || note.sharedToFeed}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
                    note.sharedToFeed ? "bg-green-50 text-green-600 border border-green-200" : "bg-[#401667] text-white hover:opacity-90"
                  }`}
                >
                  <Share2 className="w-3 h-3" />
                  {note.sharedToFeed ? "Shared" : shareNoteMutation.isPending ? "Sharing..." : "Share to Feed"}
                </button>
                <button
                  onClick={() => { if (window.confirm("Delete this note?")) deleteNoteMutation.mutate(note._id); }}
                  disabled={deleteNoteMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition disabled:opacity-50 ml-auto"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default NotesTab;
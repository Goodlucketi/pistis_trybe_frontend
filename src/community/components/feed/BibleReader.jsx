import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  BookOpen, BookMarked, StickyNote, ChevronDown, ChevronUp,
  Trash2, Share2, Plus, X, Check, ChevronLeft, ChevronRight,
  Calendar
} from "lucide-react";
import { BIBLE_BOOKS, READING_PLANS, TRANSLATIONS, STREAM_COLORS } from "../../store/readingPlans";
import { getNotes, createNote, deleteNote, shareNoteToFeed } from "../../../services/NoteService";
import getErrorMessage from "../../../hooks/useErrorToast";

const fetchPassage = async ({ book, chapter, translation }) => {
  const ref = `${book} ${chapter}`;
  const { data } = await axios.get(
    `https://bible-api.com/${encodeURIComponent(ref)}?translation=${translation}`
  );
  return data;
};

export default function BibleReader() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("read");

  // Reader state
  const [selectedBook, setSelectedBook] = useState("John");
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [translation, setTranslation] = useState("kjv");
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // Plan state
  const [activePlan, setActivePlan] = useState("1-year");
  const [planDay, setPlanDay] = useState(1);
  const [planReading, setPlanReading] = useState(null);

  // Notes state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [expandedNote, setExpandedNote] = useState(null);

  const currentBook = BIBLE_BOOKS.find((b) => b.name === selectedBook);
  const totalChapters = currentBook?.chapters || 1;

  const { data: passage, isLoading, error: passageError } = useQuery({
    queryKey: ["bible", selectedBook, selectedChapter, translation],
    queryFn: () => fetchPassage({ book: selectedBook, chapter: selectedChapter, translation }),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const { data: planPassage, isLoading: planLoading } = useQuery({
    queryKey: ["bible-plan", planReading?.book, planReading?.chapter, translation],
    queryFn: () => fetchPassage({ book: planReading.book, chapter: planReading.chapter, translation }),
    enabled: !!planReading,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  });

  const createNoteMutation = useMutation({
    mutationFn: () => createNote({
      title: noteTitle,
      content: noteContent,
      reference: `${selectedBook} ${selectedChapter}`,
      translation,
      verseText: passage?.verses?.[0]?.text || passage?.text?.slice(0, 200) || "",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setNoteTitle("");
      setNoteContent("");
      setShowNoteForm(false);
    },
    onError: (e) => alert(getErrorMessage(e)),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
    onError: (e) => alert(getErrorMessage(e)),
  });

  const shareNoteMutation = useMutation({
    mutationFn: shareNoteToFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      alert("Note shared to your feed! 🙏");
    },
    onError: (e) => alert(getErrorMessage(e)),
  });

  const goToPrevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter((c) => c - 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex((b) => b.name === selectedBook);
      if (idx > 0) {
        const prev = BIBLE_BOOKS[idx - 1];
        setSelectedBook(prev.name);
        setSelectedChapter(prev.chapters);
      }
    }
  };

  const goToNextChapter = () => {
    if (selectedChapter < totalChapters) {
      setSelectedChapter((c) => c + 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex((b) => b.name === selectedBook);
      if (idx < BIBLE_BOOKS.length - 1) {
        const next = BIBLE_BOOKS[idx + 1];
        setSelectedBook(next.name);
        setSelectedChapter(1);
      }
    }
  };

  const currentPlan = READING_PLANS[activePlan];
  const currentDayReadings = currentPlan.plan[planDay - 1]?.readings || [];

  const closeNoteModal = () => {
    setShowNoteForm(false);
    setNoteTitle("");
    setNoteContent("");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ── Add Note Modal ── */}
      {showNoteForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Add Note</h3>
                <p className="text-xs text-[#401667] mt-0.5">
                  {selectedBook} {selectedChapter} · {TRANSLATIONS.find((t) => t.id === translation)?.short}
                </p>
              </div>
              <button onClick={closeNoteModal} className="p-2 hover:bg-gray-100 rounded-full transition">
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
                onClick={closeNoteModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => createNoteMutation.mutate()}
                disabled={!noteContent.trim() || createNoteMutation.isPending}
                className="flex-1 py-2.5 bg-[#401667] text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {createNoteMutation.isPending ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#401667] px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-purple-200" />
          <h2 className="text-white font-semibold text-lg">Bible</h2>
        </div>
        <div className="flex gap-1 bg-purple-900/40 rounded-xl p-1">
          {[
            { id: "read", label: "Read", icon: BookOpen },
            { id: "plan", label: "Plan", icon: Calendar },
            { id: "notes", label: "Notes", icon: StickyNote },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id ? "bg-white text-[#401667] shadow-sm" : "text-purple-200 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {id === "notes" && notes.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === "notes" ? "bg-[#401667] text-white" : "bg-purple-700 text-purple-200"}`}>
                  {notes.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════ READ TAB ════════════ */}
      {tab === "read" && (
        <div>
          {/* Controls */}
          <div className="flex flex-wrap gap-2 p-3 border-b border-gray-100 bg-gray-50">
            {/* Book picker */}
            <div className="relative">
              <button
                onClick={() => { setShowBookPicker(!showBookPicker); setShowChapterPicker(false); setShowTranslation(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-[#401667] transition"
              >
                <BookMarked className="w-3.5 h-3.5 text-[#401667]" />
                {selectedBook}
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {showBookPicker && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-xl w-48 max-h-64 overflow-y-auto">
                  {BIBLE_BOOKS.map((book) => (
                    <button
                      key={book.name}
                      onClick={() => { setSelectedBook(book.name); setSelectedChapter(1); setShowBookPicker(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 transition ${selectedBook === book.name ? "text-[#401667] font-semibold bg-purple-50" : "text-gray-700"}`}
                    >
                      {book.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chapter picker */}
            <div className="relative">
              <button
                onClick={() => { setShowChapterPicker(!showChapterPicker); setShowBookPicker(false); setShowTranslation(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-[#401667] transition"
              >
                Ch. {selectedChapter}
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {showChapterPicker && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-xl w-40 max-h-56 overflow-y-auto p-2">
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => { setSelectedChapter(ch); setShowChapterPicker(false); }}
                        className={`py-1.5 text-xs rounded-lg transition ${selectedChapter === ch ? "bg-[#401667] text-white" : "hover:bg-purple-50 text-gray-700"}`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Translation picker */}
            <div className="relative ml-auto">
              <button
                onClick={() => { setShowTranslation(!showTranslation); setShowBookPicker(false); setShowChapterPicker(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-[#401667] transition"
              >
                {TRANSLATIONS.find((t) => t.id === translation)?.short}
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {showTranslation && (
                <div className="absolute top-full right-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-xl w-56">
                  {TRANSLATIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTranslation(t.id); setShowTranslation(false); }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-purple-50 transition first:rounded-t-xl last:rounded-b-xl ${translation === t.id ? "text-[#401667] font-semibold bg-purple-50" : "text-gray-700"}`}
                    >
                      <span className="font-medium">{t.short}</span>
                      <span className="text-gray-400 text-xs ml-2">{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Passage */}
          <div className="p-4 min-h-48">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {passageError && (
              <p className="text-center text-red-500 text-sm py-8">Failed to load passage. Please try again.</p>
            )}
            {passage && !isLoading && (
              <>
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  {passage.reference}
                  <span className="ml-2 text-xs text-gray-400 font-normal uppercase">
                    {TRANSLATIONS.find((t) => t.id === translation)?.short}
                  </span>
                </h3>
                <div className="text-gray-700 leading-8 text-sm sm:text-[15px] space-y-1">
                  {passage.verses?.map((v) => (
                    <span key={v.verse}>
                      <sup className="text-[10px] text-[#401667] font-bold mr-1">{v.verse}</sup>
                      {v.text}{" "}
                    </span>
                  )) || <p className="whitespace-pre-line">{passage.text}</p>}
                </div>
              </>
            )}
          </div>

          {/* Navigation + Add Note */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <button onClick={goToPrevChapter} className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#401667] transition">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              onClick={() => setShowNoteForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#401667] text-white rounded-lg text-xs font-medium hover:opacity-90 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Note
            </button>
            <button onClick={goToNextChapter} className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#401667] transition">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ════════════ PLAN TAB ════════════ */}
      {tab === "plan" && (
        <div>
          <div className="flex gap-2 p-3 border-b border-gray-100 overflow-x-auto">
            {Object.entries(READING_PLANS).map(([key, plan]) => (
              <button
                key={key}
                onClick={() => { setActivePlan(key); setPlanDay(1); setPlanReading(null); }}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activePlan === key ? "bg-[#401667] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {plan.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <button
              onClick={() => { setPlanDay((d) => Math.max(1, d - 1)); setPlanReading(null); }}
              disabled={planDay === 1}
              className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">Day {planDay}</p>
              <p className="text-xs text-gray-400">of {currentPlan.days} days</p>
            </div>
            <button
              onClick={() => { setPlanDay((d) => Math.min(currentPlan.days, d + 1)); setPlanReading(null); }}
              disabled={planDay === currentPlan.days}
              className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
              {currentDayReadings.length} chapter{currentDayReadings.length !== 1 ? "s" : ""} today
            </p>
            <div className="space-y-2">
              {currentDayReadings.map((r, i) => {
                const isActive = planReading?.book === r.book && planReading?.chapter === r.chapter;
                const streamColor = STREAM_COLORS[r.stream] || "bg-gray-100 text-gray-500";
                return (
                  <button
                    key={i}
                    onClick={() => setPlanReading(r)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition ${
                      isActive
                        ? "bg-[#401667] text-white border-[#401667]"
                        : "bg-white border-gray-200 text-gray-700 hover:border-[#401667] hover:text-[#401667]"
                    }`}
                  >
                    <span className="font-medium">{r.book} {r.chapter}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? "bg-white/20 text-white" : streamColor}`}>
                      {r.stream}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {planReading && (
            <div className="border-t border-gray-100 p-4">
              {planLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {planPassage && !planLoading && (
                <>
                  <h3 className="font-bold text-gray-900 text-base mb-4">
                    {planPassage.reference}
                    <span className="ml-2 text-xs text-gray-400 font-normal uppercase">
                      {TRANSLATIONS.find((t) => t.id === translation)?.short}
                    </span>
                  </h3>
                  <div className="text-gray-700 leading-8 text-sm space-y-1">
                    {planPassage.verses?.map((v) => (
                      <span key={v.verse}>
                        <sup className="text-[10px] text-[#401667] font-bold mr-1">{v.verse}</sup>
                        {v.text}{" "}
                      </span>
                    )) || <p className="whitespace-pre-line">{planPassage.text}</p>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════ NOTES TAB ════════════ */}
      {tab === "notes" && (
        <div className="p-4">
          <button
            onClick={() => { setTab("read"); setShowNoteForm(true); }}
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
      )}
    </div>
  );
}
import { BookMarked, ChevronDown, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { BIBLE_BOOKS, TRANSLATIONS } from "../../store/readingPlans";

const ReadTab = ({
  showBookPicker,
  setShowBookPicker,
  showChapterPicker,
  setShowChapterPicker,
  showVersePicker,
  setShowVersePicker,
  showTranslation,
  setShowTranslation,
  selectedBook,
  setSelectedBook,
  selectedChapter,
  setSelectedChapter,
  selectedVerse,
  setSelectedVerse,
  passage,
  isLoading,
  passageError,
  translation,
  setTranslation,
  totalChapters,
  goToPrevChapter,
  goToNextChapter,
  onAddNote,
}) => (
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
      {/* Verse picker */}
      <div className="relative">
        <button
          onClick={() => {
            setShowVersePicker(!showVersePicker);
            setShowBookPicker(false);
            setShowChapterPicker(false);
            setShowTranslation(false);
          }}
          disabled={!passage?.verses?.length}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-[#401667] transition disabled:opacity-50"
        >
          {selectedVerse ? `v. ${selectedVerse}` : "All verses"}
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
        {showVersePicker && passage?.verses && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-xl w-40 max-h-56 overflow-y-auto p-2">
            <button
              onClick={() => { setSelectedVerse(null); setShowVersePicker(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded-lg transition mb-1 ${!selectedVerse ? "text-[#401667] font-semibold bg-purple-50" : "text-gray-700"}`}
            >
              All verses
            </button>
            <div className="grid grid-cols-4 gap-1">
              {passage.verses.map((v) => (
                <button
                  key={v.verse}
                  onClick={() => {
                    setSelectedVerse(v.verse);
                    setShowVersePicker(false);
                    // Scroll to verse
                    document.getElementById(`verse-${v.verse}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={`py-1.5 text-xs rounded-lg transition ${selectedVerse === v.verse ? "bg-[#401667] text-white" : "hover:bg-purple-50 text-gray-700"}`}
                >
                  {v.verse}
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
          <div className="text-gray-700 leading-8 text-sm space-y-2">
            {passage.verses?.map((v) => (
              <p
                key={v.verse}
                id={`verse-${v.verse}`}
                className={`flex gap-2 scroll-mt-20 rounded-lg transition-all ${
                  selectedVerse === v.verse
                    ? "bg-purple-100 px-2 py-1 -mx-2 border-l-4 border-[#401667]"
                    : ""
                }`}
              >
                <sup className="text-xs text-[#401667] font-bold shrink-0 mt-1">{v.verse}</sup>
                <span className="flex-1">{v.text}</span>
              </p>
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
        onClick={onAddNote}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#401667] text-white rounded-lg text-xs font-medium hover:opacity-90 transition"
      >
        <Plus className="w-3.5 h-3.5" /> Add Note
      </button>
      <button onClick={goToNextChapter} className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#401667] transition">
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default ReadTab;
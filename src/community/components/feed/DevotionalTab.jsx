import { Heart } from "lucide-react";
import DevotionalContent from "./DevotionalContent";

const DevotionalTab = ({ devotional, devoLoading, onJumpToVerse, onSaveAsNote }) => (
  <div className="p-6">
    {devoLoading && (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
      </div>
    )}

    {!devotional && !devoLoading && (
      <div className="text-center py-12 text-gray-400 text-sm">
        <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p>No devotional for today yet.</p>
        <p className="text-xs mt-1">Check back soon!</p>
      </div>
    )}

    {devotional && !devoLoading && (
      <div className="max-w-2xl mx-auto">
        {/* Header: series, author, date */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
            <Heart className="w-6 h-6 text-[#401667]" />
          </div>
          <p className="text-sm font-bold text-[#401667] uppercase tracking-widest">
            {devotional.seriesTitle || "Daily Devotional"}
          </p>
          {devotional.author && (
            <p className="text-sm text-gray-600 mt-1">With {devotional.author}</p>
          )}
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-2">
            {new Date(devotional.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <DevotionalContent d={devotional} />

        <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => onJumpToVerse(devotional.bibleVerseReference)}
            className="flex-1 py-2.5 bg-[#401667] text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
          >
            Read Full Chapter
          </button>
          <button
            onClick={onSaveAsNote}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            Save as Note
          </button>
        </div>
      </div>
    )}
  </div>
);

export default DevotionalTab;

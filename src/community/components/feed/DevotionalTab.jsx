import { Heart } from "lucide-react";

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
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
            <Heart className="w-6 h-6 text-[#401667]" />
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {new Date(devotional.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">Daily Devotional</h2>
        </div>

        {/* Topic */}
        {devotional.topic && (
          <h3 className="text-xl font-bold text-center text-[#401667] mb-6">
            {devotional.topic}
          </h3>
        )}

        {/* Bible Verse */}
        <div className="bg-purple-50 border-l-4 border-[#401667] rounded-r-xl p-5 mb-6">
          <p className="text-lg text-gray-800 font-medium italic leading-relaxed">
            "{devotional.bibleVerse}"
          </p>
          <p className="text-sm text-[#401667] font-semibold mt-3">
            — {devotional.bibleVerseReference}
          </p>
        </div>

        {/* Exhortation/Message */}
        <div className="prose prose-sm max-w-none mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Message</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {devotional.exhortation}
          </p>
        </div>

        {/* Scripture for Meditation */}
        {devotional.scriptureForMeditation && (
          <div className="bg-gray-50 rounded-xl p-5 mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Scripture for Meditation
            </p>
            <p className="text-sm text-gray-700 italic leading-relaxed mb-2">
              "{devotional.scriptureForMeditation}"
            </p>
            <p className="text-xs text-[#401667] font-semibold">
              — {devotional.meditationReference}
            </p>
          </div>
        )}

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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { READING_PLANS, STREAM_COLORS, TRANSLATIONS } from "../../store/readingPlans";

const PlanTab = ({
  activePlan,
  setActivePlan,
  planDay,
  setPlanDay,
  planReading,
  setPlanReading,
  currentPlan,
  currentDayReadings,
  planPassage,
  planLoading,
  selectedVerse,
  translation,
}) => (
  <div>
    <div className="grid grid-cols-2 md:flex gap-2 p-3 border-b border-gray-100 overflow-x-auto">
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
            <div className="text-gray-700 leading-8 text-sm space-y-2">
              {planPassage.verses?.map((v) => (
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
              )) || <p className="whitespace-pre-line">{planPassage.text}</p>}
            </div>
          </>
        )}
      </div>
    )}
  </div>
);

export default PlanTab;
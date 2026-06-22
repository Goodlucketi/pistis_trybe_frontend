import Card from "../ui/Card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTodaysDevotional } from "../../../services/DevotionalService";

const Devotional = () => {
  const navigate = useNavigate();

  const { data: devotional, isLoading } = useQuery({
    queryKey: ["devotional-today"],
    queryFn: getTodaysDevotional,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const handleReadMore = (e) => {
    e.preventDefault();
    navigate("/dashboard/bible?tab=devotional");
  };

  if (isLoading) {
    return (
      <Card className="px-4 py-6 bg-[#4B1D83] text-white relative animate-pulse">
        <h3 className="font-semibold text-sm mb-2">Daily Devotional</h3>
        <div className="space-y-2">
          <div className="h-3 bg-white/20 rounded w-full" />
          <div className="h-3 bg-white/20 rounded w-4/5" />
        </div>
      </Card>
    );
  }

  if (!devotional) {
    return (
      <Card className="px-4 py-6 bg-[#4B1D83] text-white relative">
        <h3 className="font-semibold text-sm mb-2">Daily Devotional</h3>
        <p className="text-xs text-gray-200">No devotional for today yet. Check back soon!</p>
      </Card>
    );
  }

  const dateLabel = new Date(devotional.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <Card className="px-4 py-6 bg-[#4B1D83] text-white relative">
      <div className="mb-2">
        <h3 className="font-semibold text-sm">Daily Devotional</h3>
        <p className="text-[10px] text-white/60">{dateLabel}</p>
      </div>

      {devotional.topic && (
        <p className="font-bold text-white text-sm leading-snug mb-2">
          {devotional.topic}
        </p>
      )}

      <p className="text-xs text-gray-200 leading-relaxed line-clamp-3 mb-3">
        "{devotional.bibleVerse}" — {devotional.bibleVerseReference}
      </p>

      <div className="btn absolute bottom-2 right-8">
        <button
          onClick={handleReadMore}
          className="text-xs text-purple-200 hover:text-purple-100 transition"
        >
          Read more →
        </button>
      </div>
    </Card>
  );
};

export default Devotional;
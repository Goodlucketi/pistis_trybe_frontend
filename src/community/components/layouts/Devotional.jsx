import Card from "../ui/Card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchDailyVerse = async () => {
  const { data } = await axios.get('https://beta.ourmanna.com/api/v1/get/?format=json&order=daily');
  return {
    text: data.verse.details.text,
    reference: data.verse.details.reference,
  };
};

const Devotional = () => {
  const navigate = useNavigate();

  const { data: verse } = useQuery({
    queryKey: ['daily-verse-card'],
    queryFn: fetchDailyVerse,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  });

  const handleReadMore = (e) => {
    e.preventDefault();
    // Navigate to Bible page with devotional tab open
    navigate('/dashboard/bible?tab=devotional');
  };

  return (
    <Card className="px-4 py-6 bg-[#4B1D83] text-white relative">
      <h3 className="font-semibold text-sm mb-2">Daily Devotional</h3>
      <p className="text-xs text-gray-200 leading-relaxed line-clamp-3">
        {verse? `${verse.text} — ${verse.reference}` : 'Loading devotional...'}
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
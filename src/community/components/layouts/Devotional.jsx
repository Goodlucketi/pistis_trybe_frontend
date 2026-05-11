import Card from "../ui/Card";

const Devotional = () => {
  return (
    <Card className="px-4 py-6 bg-[#4B1D83] text-white relative">
        <h3 className="font-semibold text-sm mb-2">Daily Devotional</h3>
        <p className="text-xs text-gray-200 leading-relaxed">
            Trust in the Lord with all your heart and lean not on your own
            understanding. — Proverbs 3:5
        </p>
        
        <div className="btn absolute bottom-2 right-8">
            <a href="#" className="text-xs text-purple-200 hover:text-purple-100 transition">Read ...</a>
        </div>
    </Card>
  );
};

export default Devotional;
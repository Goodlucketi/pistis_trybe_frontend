import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchVerse = async (reference) => {
  const { data } = await axios.get(
    `https://bible-api.com/${encodeURIComponent(reference)}`
  );
  return data;
};

const BibleReader = () => {
  const [reference, setReference] = useState("John 3:16");

  const { data, isLoading } = useQuery({
    queryKey: ["bible", reference],
    queryFn: () => fetchVerse(reference),
  });

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex gap-2 mb-4">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm w-full"
          placeholder="Enter verse e.g. Psalm 23"
        />
      </div>

      {isLoading && <p>Loading scripture...</p>}

      {data && (
        <>
          <h3 className="font-semibold mb-3">{data.reference}</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {data.text}
          </p>
        </>
      )}
    </div>
  );
};

export default BibleReader;
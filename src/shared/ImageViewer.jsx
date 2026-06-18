import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function ImageViewer({ images = [], startIndex = 0, isOpen, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((p) => (p + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrent((p) => (p - 1 + images.length) % images.length);
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || !images.length) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full" onClick={onClose}>
        <X className="w-5 h-5 text-white" />
      </button>

      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setCurrent((p) => (p - 1 + images.length) % images.length); }}
            className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setCurrent((p) => (p + 1) % images.length); }}
            className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      <img
        src={images[current]}
        alt={`Image ${current + 1}`}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="absolute bottom-4 flex gap-2">
          {images.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition ${i === current ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

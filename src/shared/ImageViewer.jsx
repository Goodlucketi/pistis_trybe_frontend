import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const ImageViewer = ({ images = [], startIndex = 0, isOpen, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    setCurrent(startIndex);
  }, [startIndex, isOpen]);

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, goNext, goPrev, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm z-10">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <img
        src={images[current]}
        alt={`Image ${current + 1}`}
        className="max-w-full max-h-full object-contain select-none"
        style={{ maxHeight: "90vh", maxWidth: "90vw" }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition ${
                i === current ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
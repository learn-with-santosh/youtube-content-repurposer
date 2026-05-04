import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const CarouselCard = ({ carousel, images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!carousel) return null;

  const slides = carousel.slides || [];

  const nextSlide = () =>
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const downloadSlide = (index) => {
    if (images?.[index]) {
      const link = document.createElement("a");
      link.href = `data:${images[index].mimeType};base64,${images[index].image}`;
      link.download = `slide-${index + 1}.png`;
      link.click();
      toast.success(`Slide ${index + 1} downloaded!`);
    }
  };

  const downloadAll = () => {
    images?.forEach((img, i) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = `data:${img.mimeType};base64,${img.image}`;
        link.download = `carousel-slide-${i + 1}.png`;
        link.click();
      }, i * 500);
    });
    toast.success("Downloading all slides...");
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(carousel.caption || "");
    toast.success("Caption copied!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{carousel.title}</h3>
        <div className="flex gap-2">
          {images && (
            <button
              onClick={downloadAll}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
            >
              ⬇️ Download All
            </button>
          )}
        </div>
      </div>

      {/* Carousel Preview */}
      <div className="flex gap-8">
        {/* Slide Preview */}
        <div className="flex-1">
          <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-square max-w-md mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
                style={{
                  backgroundColor:
                    slides[currentSlide]?.backgroundColor || "#1a1a2e",
                  color: slides[currentSlide]?.textColor || "#ffffff",
                }}
              >
                {images?.[currentSlide] ? (
                  <img
                    src={`data:${images[currentSlide].mimeType};base64,${images[currentSlide].image}`}
                    alt={`Slide ${currentSlide + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <span className="text-5xl mb-4">
                      {slides[currentSlide]?.emoji}
                    </span>
                    <h4 className="text-2xl font-bold text-center mb-3">
                      {slides[currentSlide]?.headline}
                    </h4>
                    {slides[currentSlide]?.subtext && (
                      <p className="text-center opacity-80 text-sm">
                        {slides[currentSlide].subtext}
                      </p>
                    )}
                    <span className="absolute bottom-4 text-xs opacity-50">
                      {currentSlide + 1} / {slides.length}
                    </span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white disabled:opacity-30"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white disabled:opacity-30"
            >
              ›
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentSlide ? "bg-purple-500" : "bg-gray-600"
                }`}
              />
            ))}
          </div>

          {images?.[currentSlide] && (
            <div className="flex justify-center mt-3">
              <button
                onClick={() => downloadSlide(currentSlide)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                ⬇️ Download This Slide
              </button>
            </div>
          )}
        </div>

        {/* Slide List */}
        <div className="w-72 space-y-2 max-h-[500px] overflow-y-auto">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                i === currentSlide
                  ? "bg-purple-600/20 border border-purple-500"
                  : "bg-gray-800 border border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-500">
                  #{i + 1}
                </span>
                <span>{slide.emoji}</span>
                <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">
                  {slide.type}
                </span>
              </div>
              <p className="text-gray-300 text-xs line-clamp-2">
                {slide.headline}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Caption */}
      {carousel.caption && (
        <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-400">
              Suggested Caption
            </h4>
            <button
              onClick={copyCaption}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              📋 Copy
            </button>
          </div>
          <p className="text-gray-300 text-sm whitespace-pre-line">
            {carousel.caption}
          </p>
          {carousel.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {carousel.hashtags.map((tag, i) => (
                <span key={i} className="text-blue-400 text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CarouselCard;

import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

export default function ListingGallery({
  images = [],
  activeIndex,
  onSelect,
  onPrev,
  onNext,
  emptyLabel = "No image",
  alt = "Vehicle",
  showFav,
  isFav,
  onToggleFav,
}) {
  const hasMany = images.length > 1;

  return (
    <div className="ld-gallery ld-reveal">
      <div className="ld-gallery-main">
        {images.length > 0 ? (
          <>
            <img src={images[activeIndex]} alt={alt} className="ld-gallery-img" />
            {hasMany && (
              <>
                <button type="button" className="ld-gallery-nav ld-gallery-nav--prev" onClick={onPrev} aria-label="Previous">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" className="ld-gallery-nav ld-gallery-nav--next" onClick={onNext} aria-label="Next">
                  <ChevronRight size={22} />
                </button>
                <span className="ld-gallery-counter">
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            )}
          </>
        ) : (
          <div className="ld-gallery-empty">{emptyLabel}</div>
        )}

        {showFav && (
          <button
            type="button"
            className={`ld-fav-btn${isFav ? " on" : ""}`}
            onClick={onToggleFav}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={22} fill={isFav ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {hasMany && (
        <div className="ld-thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              className={`ld-thumb${i === activeIndex ? " on" : ""}`}
              onClick={() => onSelect(i)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

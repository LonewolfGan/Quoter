export const HeaderBackground = ({
  images,
  currentIndex,
  nextIndex,
  isTransitioning,
}) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="absolute z-0 inset-0">
      {/* Base layer */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
          opacity: 0.5,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          willChange: "opacity",
          transition: "opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
      />

      {/* Transition layer */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out"
        style={{
          backgroundImage: `url(${images[nextIndex]})`,
          opacity: isTransitioning ? 0.5 : 0,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          willChange: "opacity",
          transition: "opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
      />

      <div className="absolute inset-0 border-b" />
    </div>
  );
};

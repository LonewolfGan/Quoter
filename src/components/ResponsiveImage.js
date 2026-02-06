export const ResponsiveImage = ({
  src,
  srcMobile,
  srcSet,
  sizes,
  sources,
  alt,
  className = "",
  loading = "lazy",
  ...props
}) => {
  return (
    <picture>
      {sources &&
        sources.map((s, i) => (
          <source
            key={i}
            media={s.media}
            srcSet={s.srcSet}
            type={s.type}
          />
        ))}
      {srcMobile && <source media="(max-width: 640px)" srcSet={srcMobile} />}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        loading={loading}
        {...props}
      />
    </picture>
  );
};

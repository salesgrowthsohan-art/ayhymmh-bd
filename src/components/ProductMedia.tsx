type ProductMediaProps = {
  src?: string | undefined;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  /** Render video with visible controls and sound (product detail page). */
  controls?: boolean;
};

export function isVideoMedia(src?: string) {
  if (!src) return false;
  return src.startsWith("data:video/") || /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(src);
}

export function ProductMedia({
  src,
  alt,
  className,
  loading = "lazy",
  controls = false,
}: ProductMediaProps) {
  if (!src) {
    return <div className={`${className ?? ""} grid place-items-center bg-brand-wash text-xs font-bold`}>NO MEDIA</div>;
  }

  if (isVideoMedia(src)) {
    if (controls) {
      return (
        <video
          src={src}
          aria-label={alt}
          className={className}
          controls
          playsInline
          preload="metadata"
        />
      );
    }
    return (
      <video
        src={src}
        aria-label={alt}
        className={className}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={loading === "eager" ? "high" : undefined}
      className={className}
    />
  );
}

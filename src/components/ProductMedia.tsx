import { useEffect, useState } from "react";

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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
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
          onError={() => setFailed(true)}
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
        preload="none"
        onError={() => setFailed(true)}
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
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

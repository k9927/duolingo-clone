/* eslint-disable @next/next/no-img-element -- Duolingo's CDN SVGs don't need next/image optimisation */

interface DuoImgProps {
  src: string | { light: string; dark: string };
  width: number;
  height?: number;
  className?: string;
  alt?: string;
}

/** Duolingo artwork; pass {light, dark} for assets that differ per theme. */
export function DuoImg({ src, width, height = width, className = "", alt = "" }: DuoImgProps) {
  const common = { width, height, draggable: false, style: { width, height } } as const;
  if (typeof src === "string") return <img src={src} className={`shrink-0 ${className}`} alt={alt} {...common} />;
  return (
    <>
      <img src={src.light} className={`shrink-0 dark:hidden ${className}`} alt={alt} {...common} />
      <img src={src.dark} className={`hidden shrink-0 dark:block ${className}`} alt={alt} {...common} />
    </>
  );
}

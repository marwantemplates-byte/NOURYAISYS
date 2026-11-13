/** Item cover: uploaded image, or a branded pattern placeholder. */
export default function ItemImage({ id, src, className = "" }: { id: string; src: string | null; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-olive via-emerald to-olive ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <svg className="absolute inset-0 h-full w-full text-gold/25" aria-hidden="true">
          <defs>
            <pattern id={`p-${id}`} width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M14 2l12 12-12 12L2 14z" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#p-${id})`} />
        </svg>
      )}
    </div>
  );
}

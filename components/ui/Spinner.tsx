/** Small circular spinner (inherits the text color). */
export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

export default function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  light = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  id: string;
  light?: boolean;
}) {
  return (
    <div className="mb-10 max-w-2xl md:mb-14">
      <p className={`mb-3 text-sm font-bold tracking-wide ${light ? "text-gold-light" : "text-gold-dark"}`}>
        {eyebrow}
      </p>
      <h2 id={id} className={`text-3xl font-bold leading-tight md:text-4xl ${light ? "text-white" : "text-olive"}`}>
        {title}
      </h2>
      <span aria-hidden="true" className="mt-4 block h-1 w-16 rounded-full bg-gold" />
      {intro && (
        <p className={`mt-5 text-lg leading-relaxed ${light ? "text-white/85" : "text-ink/75"}`}>{intro}</p>
      )}
    </div>
  );
}

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldBase =
  "w-full min-h-12 rounded-xl border border-olive/20 bg-white px-4 text-base text-ink placeholder:text-ink/40 transition-colors focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/25 disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-medium text-ink">
        {label}
        {required && (
          <span className="text-red-700" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="mt-1 text-sm text-ink/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldBase} min-h-32 py-3 leading-relaxed ${props.className ?? ""}`} />;
}

export function SubmitButton({ loading, children }: { loading?: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gold px-6 text-lg font-bold text-ink transition-colors hover:bg-gold-light disabled:cursor-wait disabled:opacity-70"
    >
      {loading ? "لحظة…" : children}
    </button>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "success" | "info"; children: ReactNode }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald/30 bg-emerald/10 text-olive",
    info: "border-gold/40 bg-gold-light/30 text-ink",
  }[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}

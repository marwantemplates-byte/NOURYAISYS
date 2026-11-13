"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Spinner from "@/components/ui/Spinner";
import { RSVP_MESSAGES, arabicError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";

type Props = {
  itemId: string;
  online: boolean;
  confirmed: boolean;
  attended: boolean | null;
  meetingLink: string | null;
  full: boolean;
  ended: boolean;
};

/** "نأكد مشاركتي" ⇄ "✓ مسجّل", with cancel, capacity and the Google Meet button after confirming. */
export default function RsvpButton(props: Props) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(props.confirmed);
  const [link, setLink] = useState(props.meetingLink);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  const refresh = () => startTransition(() => router.refresh());

  const confirm = async () => {
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { data, error } = await supabase.rpc("rsvp_item", { p_item_id: props.itemId });
    if (error) {
      setBusy(false);
      setMessage(arabicError(error.message));
      return;
    }
    if (data === "ok" || data === "already") {
      setConfirmed(true);
      if (props.online) {
        const { data: l } = await supabase.rpc("get_meeting_link", { p_item_id: props.itemId });
        setLink((l as string | null) ?? null);
      }
      refresh();
    } else {
      setMessage(RSVP_MESSAGES[data as string] ?? "تعذّر التأكيد.");
      if (data === "full") refresh();
    }
    setBusy(false);
  };

  const cancel = async () => {
    setBusy(true);
    setMessage("");
    const { data, error } = await createClient().rpc("cancel_rsvp", { p_item_id: props.itemId });
    setBusy(false);
    if (error) return setMessage(arabicError(error.message));
    if (data === "ok" || data === "not_found") {
      setConfirmed(false);
      setLink(null);
      refresh();
    } else {
      setMessage(RSVP_MESSAGES[data as string] ?? "تعذّر الإلغاء.");
    }
  };

  const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-bold transition-colors";

  return (
    <div className="space-y-2">
      {confirmed ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${btn} bg-emerald/10 text-emerald ring-1 ring-emerald/30`} role="status">
              ✓ مسجّل
            </span>
            {props.attended === null && !props.ended && (
              <button type="button" onClick={cancel} disabled={busy} className={`${btn} min-h-11 px-3 text-sm font-medium text-ink/60 underline underline-offset-4 hover:text-red-800 ${busy ? "pending-ring" : ""}`}>
                {busy && <Spinner className="h-4 w-4" />}
                {busy ? "لحظة…" : "إلغاء المشاركة"}
              </button>
            )}
            {props.attended === true && <span className="text-sm font-medium text-emerald">حضرت ✓</span>}
            {props.attended === false && <span className="text-sm font-medium text-red-800">سُجّلت غائبًا</span>}
          </div>
          {props.online && link && !props.ended && (
            <a href={link} target="_blank" rel="noopener noreferrer" className={`${btn} w-full bg-olive text-white hover:bg-emerald`}>
              دخول الدورة (Google Meet)
              <span className="sr-only">(يفتح في نافذة جديدة)</span>
            </a>
          )}
        </>
      ) : props.ended ? (
        <span className={`${btn} w-full bg-olive/5 text-ink/50`}>انتهى</span>
      ) : props.full ? (
        <span className={`${btn} w-full bg-olive/5 text-ink/60`}>اكتملت الأماكن</span>
      ) : (
        <button type="button" onClick={confirm} disabled={busy} aria-busy={busy} className={`${btn} w-full bg-gold text-ink hover:bg-gold-light ${busy ? "pending-ring" : ""}`}>
          {busy && <Spinner />}
          {busy ? "لحظة…" : "نأكد مشاركتي"}
        </button>
      )}
      {message && (
        <p role="alert" className="text-sm font-medium text-red-800">
          {message}
        </p>
      )}
    </div>
  );
}

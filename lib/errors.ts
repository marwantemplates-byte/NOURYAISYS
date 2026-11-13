/** Translate Supabase/auth errors into clear Arabic messages. */
export function arabicError(message: string | undefined | null): string {
  const m = (message || "").toLowerCase();
  if (!m) return "حدث خطأ غير متوقع. حاول مرة أخرى.";
  if (m.includes("invalid login credentials")) return "البريد الإلكتروني أو كلمة السر غير صحيحة.";
  if (m.includes("email not confirmed"))
    return "لم تؤكّد بريدك الإلكتروني بعد. افتح الرسالة التي أرسلناها لك واضغط على رابط التأكيد.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "هذا البريد الإلكتروني مسجّل من قبل. جرّب تسجيل الدخول أو استرجاع كلمة السر.";
  if (m.includes("password should be") || m.includes("weak password"))
    return "كلمة السر ضعيفة: استعمل 8 أحرف على الأقل.";
  if (m.includes("same password") || m.includes("different from the old"))
    return "كلمة السر الجديدة يجب أن تكون مختلفة عن القديمة.";
  if (m.includes("rate limit") || m.includes("security purposes") || m.includes("too many"))
    return "محاولات كثيرة في وقت قصير. انتظر دقيقة ثم أعد المحاولة.";
  if (m.includes("invalid email") || m.includes("unable to validate email"))
    return "صيغة البريد الإلكتروني غير صحيحة.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "تعذّر الاتصال بالخادم. تحقّق من الإنترنت وأعد المحاولة.";
  if (m.includes("expired") || m.includes("otp"))
    return "انتهت صلاحية الرابط. اطلب رابطًا جديدًا.";
  return "حدث خطأ: " + message;
}

/** Messages for the rsvp_item / cancel_rsvp database functions. */
export const RSVP_MESSAGES: Record<string, string> = {
  full: "اكتملت الأماكن.",
  not_found: "هذا العنصر غير متاح.",
  blocked: "حسابك موقوف. تواصل مع إدارة الحاضنة.",
  not_signed_in: "سجّل الدخول أولًا.",
  locked: "لا يمكن الإلغاء بعد تسجيل الحضور من طرف الإدارة.",
};

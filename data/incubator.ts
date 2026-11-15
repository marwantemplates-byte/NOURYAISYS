/**
 * Real information about the incubator, shown in the STUDENT area (/app/about, /app/home).
 * Source: the incubator's official listing on startup.dz (national startup portal).
 * Edit the texts here — the pages read them from this file.
 */

/** Who the incubator is for (about block). */
export const INCUBATOR_AUDIENCE =
  "الحاضنة موجّهة لطلبة الليسانس والماستر والدكتوراه المقبلين على التخرّج، الراغبين في إنشاء مؤسساتهم.";

export type Offer = { title: string; text: string; extra?: string; icon: string };

/** What the incubator offers (cards). Icons: 24×24 stroke paths, same style as the home page. */
export const STUDENT_OFFERS: Offer[] = [
  {
    title: "المرافقة",
    text: "مؤطرون يتابعونك خطوة بخطوة: صياغة الفكرة، دراسة السوق، وبناء نموذج العمل.",
    extra: "مرافقة في الإجراءات الإدارية، منها استخراج السجل التجاري.",
    icon: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0",
  },
  {
    title: "التكوين",
    text: "تكوين متخصص في: التسيير، المحاسبة، الجباية، التسويق، والتفاوض التجاري.",
    icon: "M4 6l8-3 8 3-8 3-8-3zm3 2v5c0 1.5 2.5 3 5 3s5-1.5 5-3V8",
  },
  {
    title: "التوجيه نحو التمويل",
    text: "نعرّفك بآليات التمويل المتاحة للمؤسسات الناشئة ونساعدك على تحضير ملفك.",
    icon: "M12 3v18M16 7H10a3 3 0 000 6h4a3 3 0 010 6H7",
  },
  {
    title: "مسار «شهادة — مؤسسة ناشئة»",
    text: "مرافقة الطلبة في مسار القرار الوزاري 1275 لتحويل مذكرة التخرج إلى مشروع مؤسسة ناشئة.",
    icon: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  },
  {
    title: "مقرّ لمؤسستك الناشئة",
    text: "توفّر الحاضنة فضاءات داخل الجامعة يمكن اعتمادها مقرًّا اجتماعيًا للمؤسسات الناشئة بإيجار رمزي.",
    icon: "M4 21V7l8-4 8 4v14M9 21v-6h6v6M8 9h2M14 9h2M8 12.5h2M14 12.5h2M3 21h18",
  },
];

/** Postal address (contact block). */
export const INCUBATOR_ADDRESS = "نهج قدور بومدوس، ص.ب 137، قسنطينة";

/** Official listing on the national startup portal. */
export const STARTUP_DZ = {
  label: "الحاضنة مسجّلة في البوابة الوطنية للمؤسسات الناشئة startup.dz",
  url: "https://startup.dz/trouver-un-incubateur/categories/incubateurs-universitaires/",
};

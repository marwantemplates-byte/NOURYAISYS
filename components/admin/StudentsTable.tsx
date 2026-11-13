"use client";

import { Fragment, useMemo, useState } from "react";
import { LEVELS } from "@/lib/profile-options";
import { PROJECT_BUCKET } from "@/lib/project-file";
import { createClient } from "@/lib/supabase/client";

export type StudentRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  faculty: string | null;
  specialty: string | null;
  level: string | null;
  project_title: string | null;
  project_idea: string | null;
  has_prototype: boolean;
  prototype_desc: string | null;
  prototype_link: string | null;
  project_file: string | null;
  status: "active" | "blocked";
  created_at: string;
  /** Courses confirmed / actually attended; rate = attended ÷ marked (−1 = nothing marked yet). */
  confirmed: number;
  attended: number;
  rate: number;
};

type SortKey = "created_at" | "full_name" | "specialty" | "level" | "attended" | "rate";

const dateFmt = new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Algiers" });
const norm = (v: string | null | undefined) => (v ?? "").toLowerCase();

/** Google-Sheet-like table of all students: search, filters, sort, CSV (Excel) export, PDF. */
export default function StudentsTable({ rows }: { rows: StudentRow[] }) {
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [level, setLevel] = useState("");
  const [proto, setProto] = useState<"" | "yes" | "no">("");
  const [pdf, setPdf] = useState<"" | "yes" | "no">("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "created_at", dir: -1 });
  const [openId, setOpenId] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState("");

  const specialties = useMemo(
    () => Array.from(new Set(rows.map((r) => r.specialty?.trim()).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "ar")),
    [rows],
  );

  const shown = useMemo(() => {
    const term = norm(q.trim());
    const list = rows.filter((r) => {
      if (term && ![r.full_name, r.email, r.phone, r.project_title, r.specialty].some((v) => norm(v).includes(term))) return false;
      if (specialty && r.specialty?.trim() !== specialty) return false;
      if (level && r.level !== level) return false;
      if (proto && r.has_prototype !== (proto === "yes")) return false;
      if (pdf && !!r.project_file !== (pdf === "yes")) return false;
      return true;
    });
    return list.sort((a, b) => {
      if (sort.key === "attended" || sort.key === "rate") return (a[sort.key] - b[sort.key]) * sort.dir;
      const av = sort.key === "created_at" ? a.created_at : (a[sort.key] ?? "");
      const bv = sort.key === "created_at" ? b.created_at : (b[sort.key] ?? "");
      return av.localeCompare(bv, "ar") * sort.dir;
    });
  }, [rows, q, specialty, level, proto, pdf, sort]);

  const filtered = q || specialty || level || proto || pdf;

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: key === "created_at" || key === "attended" || key === "rate" ? -1 : 1 }));

  const openPdf = async (path: string) => {
    setPdfError("");
    const win = window.open("", "_blank"); // open now (avoids popup blockers), fill after
    const { data, error } = await createClient().storage.from(PROJECT_BUCKET).createSignedUrl(path, 600);
    if (error || !data?.signedUrl) {
      win?.close();
      setPdfError("تعذّر فتح الملف.");
      return;
    }
    if (win) win.location.href = data.signedUrl;
    else window.location.href = data.signedUrl;
  };

  const exportCsv = () => {
    const head = ["الاسم واللقب", "البريد الإلكتروني", "الهاتف", "الكلية", "التخصص", "المستوى", "عنوان المشروع", "فكرة المشروع", "نموذج أولي", "وصف النموذج", "رابط النموذج", "ملف PDF", "دورات أكّدها", "دورات حضرها", "نسبة الحضور", "الحالة", "تاريخ التسجيل"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = shown.map((r) =>
      [r.full_name, r.email, r.phone, r.faculty, r.specialty, r.level, r.project_title, r.project_idea, r.has_prototype ? "نعم" : "لا", r.prototype_desc, r.prototype_link, r.project_file ? "نعم" : "لا", r.confirmed, r.attended, r.rate < 0 ? "—" : `${r.rate}%`, r.status === "blocked" ? "موقوف" : "نشط", new Date(r.created_at).toLocaleDateString("fr-DZ")]
        .map(esc)
        .join(","),
    );
    // BOM so Excel opens Arabic correctly
    const blob = new Blob(["﻿" + [head.map(esc).join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talaba-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const sel = "min-h-11 rounded-xl border border-olive/20 bg-white px-3 text-sm text-ink focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/25";
  const th = "whitespace-nowrap px-3 py-3 text-right text-sm font-bold text-ink/80";
  const td = "px-3 py-3 align-top text-sm text-ink/85";

  const SortTh = ({ k, children }: { k: SortKey; children: string }) => (
    <th scope="col" className={th} aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => toggleSort(k)} className="inline-flex min-h-8 items-center gap-1 hover:text-emerald">
        {children}
        <span aria-hidden="true" className="text-xs">{sort.key === k ? (sort.dir === 1 ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );

  return (
    <div className="mt-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-olive/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="q">بحث</label>
          <input
            id="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالاسم، الإيميل، الهاتف أو المشروع…"
            className={`${sel} flex-1 text-base`}
          />
          <button
            type="button"
            onClick={exportCsv}
            disabled={shown.length === 0}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald px-5 font-bold text-white hover:bg-olive disabled:opacity-50"
          >
            <span aria-hidden="true">⬇</span> تصدير Excel
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <select aria-label="التخصص" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={sel}>
            <option value="">كل التخصصات</option>
            {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select aria-label="المستوى" value={level} onChange={(e) => setLevel(e.target.value)} className={sel}>
            <option value="">كل المستويات</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select aria-label="النموذج الأولي" value={proto} onChange={(e) => setProto(e.target.value as "" | "yes" | "no")} className={sel}>
            <option value="">النموذج الأولي: الكل</option>
            <option value="yes">عنده نموذج أولي</option>
            <option value="no">ما عندوش نموذج</option>
          </select>
          <select aria-label="ملف PDF" value={pdf} onChange={(e) => setPdf(e.target.value as "" | "yes" | "no")} className={sel}>
            <option value="">ملف PDF: الكل</option>
            <option value="yes">رفع ملف PDF</option>
            <option value="no">بدون ملف</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-ink/70" aria-live="polite">
            <strong className="text-olive">{shown.length}</strong> طالب{filtered ? ` من أصل ${rows.length}` : ""}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={() => { setQ(""); setSpecialty(""); setLevel(""); setProto(""); setPdf(""); }}
              className="min-h-11 font-medium text-emerald underline underline-offset-4"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
        {pdfError && <p role="alert" className="text-sm font-medium text-red-700">{pdfError}</p>}
      </div>

      {/* Sheet */}
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-olive/20 bg-white/70 p-10 text-center text-ink/60">لا يوجد طلبة مسجلون بعد.</p>
      ) : shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-olive/20 bg-white/70 p-10 text-center text-ink/60">لا توجد نتائج لهذا البحث.</p>
      ) : (
        <>
        <p className="text-xs text-ink/55 lg:hidden">↔ اسحب الجدول يمينًا ويسارًا لرؤية باقي الأعمدة.</p>
        <div className="overflow-x-auto rounded-2xl border border-olive/10 bg-white shadow-sm">
          <table className="w-full min-w-[960px] border-collapse">
            <thead className="sticky top-0 bg-olive/5">
              <tr>
                <th scope="col" className={`${th} w-10`}>#</th>
                <SortTh k="full_name">الاسم واللقب</SortTh>
                <SortTh k="specialty">التخصص</SortTh>
                <SortTh k="level">المستوى</SortTh>
                <th scope="col" className={th}>المشروع</th>
                <th scope="col" className={th}>نموذج أولي</th>
                <th scope="col" className={th}>PDF</th>
                <SortTh k="attended">حضر</SortTh>
                <SortTh k="rate">نسبة الحضور</SortTh>
                <SortTh k="created_at">التسجيل</SortTh>
                <th scope="col" className={th}><span className="sr-only">تفاصيل</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => {
                const open = openId === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr className={`border-t border-olive/10 ${i % 2 ? "bg-ivory/50" : ""} ${r.status === "blocked" ? "opacity-60" : ""}`}>
                      <td className={`${td} text-ink/50`}>{i + 1}</td>
                      <td className={td}>
                        <a href={`/admin/students/${r.id}`} className="font-bold text-ink hover:text-emerald hover:underline">{r.full_name || "—"}</a>
                        {r.status === "blocked" && <span className="ms-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">موقوف</span>}
                        <a href={`mailto:${r.email}`} dir="ltr" className="block text-xs text-ink/60 hover:text-emerald">{r.email}</a>
                        {r.phone && (
                          <a href={`tel:${r.phone}`} dir="ltr" className="block whitespace-nowrap text-xs text-ink/60 hover:text-emerald">{r.phone}</a>
                        )}
                      </td>
                      <td className={td}>
                        {r.specialty || "—"}
                        {r.faculty && <span className="block text-xs text-ink/55">{r.faculty}</span>}
                      </td>
                      <td className={`${td} whitespace-nowrap`}>{r.level || "—"}</td>
                      <td className={`${td} max-w-[220px]`}>
                        <span className="font-medium">{r.project_title || "—"}</span>
                      </td>
                      <td className={td}>
                        {r.has_prototype ? <span className="rounded-full bg-emerald/10 px-2 py-0.5 font-medium text-emerald">نعم</span> : <span className="text-ink/50">لا</span>}
                      </td>
                      <td className={td}>
                        {r.project_file ? (
                          <button type="button" onClick={() => openPdf(r.project_file!)} className="inline-flex min-h-9 items-center gap-1 whitespace-nowrap rounded-lg bg-gold/20 px-2 font-bold text-ink hover:bg-gold/40">
                            📄 فتح
                          </button>
                        ) : (
                          <span className="text-ink/40">—</span>
                        )}
                      </td>
                      <td className={`${td} whitespace-nowrap`}>
                        <span className="font-bold text-olive">{r.attended}</span>
                        <span className="text-ink/50"> / {r.confirmed}</span>
                      </td>
                      <td className={`${td} whitespace-nowrap font-bold`}>{r.rate < 0 ? <span className="font-normal text-ink/40">—</span> : `${r.rate}%`}</td>
                      <td className={`${td} whitespace-nowrap text-ink/60`}>{dateFmt.format(new Date(r.created_at))}</td>
                      <td className={td}>
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : r.id)}
                          aria-expanded={open}
                          className="inline-flex min-h-9 items-center whitespace-nowrap rounded-lg border border-olive/20 px-2 font-medium text-olive hover:border-olive"
                        >
                          {open ? "إخفاء" : "التفاصيل"}
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-t border-dashed border-olive/10 bg-gold-light/15">
                        <td colSpan={11} className="px-4 py-4">
                          <dl className="grid gap-4 text-sm md:grid-cols-3">
                            <div className="md:col-span-2">
                              <dt className="font-bold text-olive">فكرة المشروع</dt>
                              <dd className="mt-1 whitespace-pre-line leading-relaxed text-ink/85">{r.project_idea || "—"}</dd>
                            </div>
                            <div>
                              <dt className="font-bold text-olive">النموذج الأولي</dt>
                              <dd className="mt-1 whitespace-pre-line leading-relaxed text-ink/85">
                                {r.has_prototype ? r.prototype_desc || "—" : "لا يوجد"}
                                {r.prototype_link && (
                                  <a href={r.prototype_link} target="_blank" rel="noopener noreferrer" dir="ltr" className="mt-1 block break-all text-emerald underline">
                                    {r.prototype_link}
                                  </a>
                                )}
                              </dd>
                            </div>
                          </dl>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}

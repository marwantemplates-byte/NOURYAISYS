import type { Metadata } from "next";
import IncubatorInfo from "@/components/app/IncubatorInfo";

export const metadata: Metadata = { title: "حاضنة الأعمال — التعريف" };

export default function AboutIncubatorPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold text-olive">حاضنة الأعمال</h1>
      <IncubatorInfo withContact />
    </>
  );
}

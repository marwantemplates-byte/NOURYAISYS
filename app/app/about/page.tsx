import type { Metadata } from "next";
import IncubatorInfo from "@/components/app/IncubatorInfo";
import { INCUBATOR_FULL_NAME } from "@/data/incubator";

export const metadata: Metadata = { title: "حاضنة الأعمال — التعريف" };

export default function AboutIncubatorPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold leading-snug text-olive">{INCUBATOR_FULL_NAME}</h1>
      <IncubatorInfo withContact />
    </>
  );
}

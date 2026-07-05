import type { Metadata } from "next";
import { HomePageClient } from "@/components/marketing/HomePageClient";
import { StructuredData } from "@/components/marketing/StructuredData";

export const metadata: Metadata = {
  title: "Superior Minds Academy — Minna, Nigeria",
  description:
    "Where excellence begins, character grows, and every child is inspired to achieve greatness. A premier nursery and primary school in Minna, Niger State, Nigeria.",
};

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <HomePageClient />
    </>
  );
}

import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StudentProfileClient } from "./StudentProfileClient";
import { adminDb } from "@/lib/firebase/admin";
import { STUDENTS_COLLECTION } from "@/lib/firebase/students";
import { mapStudentDoc } from "@/lib/server/mapStudentDoc";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ photoFailed?: string }>;
}

export default async function StudentProfilePage({ params, searchParams }: PageProps) {
  const user = await requireStaff();
  const { id } = await params;
  const { photoFailed } = await searchParams;

  const snap = await adminDb.collection(STUDENTS_COLLECTION).doc(id).get();
  if (!snap.exists) {
    notFound();
  }

  const student = mapStudentDoc(snap.id, snap.data() ?? {});

  return (
    <DashboardShell role={user.role} title="Student Profile">
      <StudentProfileClient currentUser={user} student={student} photoFailed={photoFailed === "1"} />
    </DashboardShell>
  );
}

import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { STUDENTS_COLLECTION } from "@/lib/firebase/students";
import { TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION } from "@/lib/firebase/academic";

export interface TeacherOverviewStats {
  classCount: number;
  studentCount: number;
}

export interface TeacherClassSummary {
  armId: string;
  className: string;
  armName: string;
  subjects: string[];
}

/**
 * A teacher's "classes" are the distinct (class, arm) pairs they appear in
 * across `teacherSubjectAssignments` — one teacher can be assigned several
 * subjects in the same arm, so this de-duplicates by arm, not by
 * assignment row. Student totals are then summed per distinct arm, since
 * Student.class/arm are plain strings rather than foreign keys.
 */
export async function getTeacherOverviewStats(teacherUid: string): Promise<TeacherOverviewStats> {
  const snap = await adminDb
    .collection(TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION)
    .where("teacherUid", "==", teacherUid)
    .get();

  const distinctArms = new Map<string, { className: string; armName: string }>();
  snap.forEach((doc) => {
    const data = doc.data();
    distinctArms.set(doc.data().armId, { className: data.className, armName: data.armName });
  });

  if (distinctArms.size === 0) {
    return { classCount: 0, studentCount: 0 };
  }

  const counts = await Promise.all(
    Array.from(distinctArms.values()).map(async ({ className, armName }) => {
      const countSnap = await adminDb
        .collection(STUDENTS_COLLECTION)
        .where("class", "==", className)
        .where("arm", "==", armName)
        .where("status", "==", "active")
        .count()
        .get();
      return countSnap.data().count;
    })
  );

  return {
    classCount: distinctArms.size,
    studentCount: counts.reduce((sum, c) => sum + c, 0),
  };
}

/** Groups a teacher's subject assignments by arm, for the overview page's "My Classes" list. */
export async function getTeacherClassSummaries(teacherUid: string): Promise<TeacherClassSummary[]> {
  const snap = await adminDb
    .collection(TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION)
    .where("teacherUid", "==", teacherUid)
    .get();

  const byArm = new Map<string, TeacherClassSummary>();
  snap.forEach((doc) => {
    const data = doc.data();
    const existing = byArm.get(data.armId);
    if (existing) {
      existing.subjects.push(data.subjectName);
    } else {
      byArm.set(data.armId, {
        armId: data.armId,
        className: data.className,
        armName: data.armName,
        subjects: [data.subjectName],
      });
    }
  });

  return Array.from(byArm.values()).sort((a, b) => `${a.className} ${a.armName}`.localeCompare(`${b.className} ${b.armName}`));
}

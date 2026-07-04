/** Shape of the singleton `settings/general` Firestore document. */
export interface SchoolSettings {
  /** When true, Administrative Staff may add students in addition to Administrator/Super Admin. */
  allowStaffAddStudents: boolean;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  allowStaffAddStudents: false,
};

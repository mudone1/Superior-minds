"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SessionsTermsTab } from "./SessionsTermsTab";
import { ClassesArmsTab } from "./ClassesArmsTab";
import { SubjectsTab } from "./SubjectsTab";
import { AssignmentsTab } from "./AssignmentsTab";

const TABS = [
  { id: "sessions", label: "Sessions & Terms" },
  { id: "classes", label: "Classes & Arms" },
  { id: "subjects", label: "Subjects" },
  { id: "assignments", label: "Teacher Assignments" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AcademicSetupClient() {
  const [activeTab, setActiveTab] = useState<TabId>("sessions");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 overflow-x-auto border-b border-ink-300/20">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-indigo text-indigo-600"
                : "border-transparent text-ink-500 hover:text-ink"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "sessions" && <SessionsTermsTab />}
      {activeTab === "classes" && <ClassesArmsTab />}
      {activeTab === "subjects" && <SubjectsTab />}
      {activeTab === "assignments" && <AssignmentsTab />}
    </div>
  );
}

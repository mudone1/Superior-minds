export * from "./user";
export * from "./student";
export * from "./settings";
export * from "./academic";
export * from "./notification";

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export * from "./user";
export * from "./student";
export * from "./settings";

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface ApiError {
  code: string;
  message: string;
}

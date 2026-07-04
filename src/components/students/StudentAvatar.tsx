import Image from "next/image";
import { getInitials, cn } from "@/lib/utils";

interface StudentAvatarProps {
  photoURL?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-24 w-24 text-2xl",
};

export function StudentAvatar({ photoURL, name, size = "md", className }: StudentAvatarProps) {
  if (photoURL) {
    return (
      <Image
        src={photoURL}
        alt={name}
        width={96}
        height={96}
        className={cn("shrink-0 rounded-md object-cover", sizeClasses[size], className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-sage font-mono font-semibold text-white",
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}

import Image from "next/image";
import { getInitials, cn } from "@/lib/utils";

interface UserAvatarProps {
  photoURL?: string | null;
  displayName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-20 w-20 text-xl",
};

export function UserAvatar({ photoURL, displayName, size = "md", className }: UserAvatarProps) {
  if (photoURL) {
    return (
      <Image
        src={photoURL}
        alt={displayName}
        width={80}
        height={80}
        className={cn("shrink-0 rounded-full object-cover", sizeClasses[size], className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-indigo font-mono font-semibold text-white",
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    >
      {getInitials(displayName)}
    </span>
  );
}

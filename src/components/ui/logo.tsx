import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
}

export function Logo({ className, size = "md", asLink = true }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const logoContent = (
    <div
      className={cn(
        "font-bold flex items-center",
        sizeClasses[size],
        className
      )}
    >
      <span className="text-primary">Edu</span>
      <span className="text-accent">Series</span>
    </div>
  );

  if (asLink) {
    return <Link href="/">{logoContent}</Link>;
  }

  return logoContent;
}

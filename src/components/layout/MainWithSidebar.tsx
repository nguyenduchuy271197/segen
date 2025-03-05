import { cn } from "@/lib/utils";

interface MainWithSidebarProps {
  main: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  mainClassName?: string;
  sidebarClassName?: string;
}

export function MainWithSidebar({
  main,
  sidebar,
  className = "",
  mainClassName = "",
  sidebarClassName = "",
}: MainWithSidebarProps) {
  return (
    <div
      className={cn(
        "container mx-auto flex flex-col lg:flex-row gap-6 py-8 md:py-12 px-4 md:px-6",
        className
      )}
    >
      <main className={cn("flex-1", mainClassName)}>{main}</main>

      {sidebar && (
        <aside
          className={cn(
            "w-full lg:w-80 space-y-6 mb-8 lg:mb-0",
            sidebarClassName
          )}
        >
          {sidebar}
        </aside>
      )}
    </div>
  );
}

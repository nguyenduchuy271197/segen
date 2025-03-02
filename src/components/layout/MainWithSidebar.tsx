interface MainWithSidebarProps {
  main: React.ReactNode;
  sidebar?: React.ReactNode;
  mainClassName?: string;
  sidebarClassName?: string;
}

export function MainWithSidebar({
  main,
  sidebar,
  mainClassName = "",
  sidebarClassName = "",
}: MainWithSidebarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-6 py-6 md:py-8">
      <main className={`flex-1 ${mainClassName}`}>{main}</main>

      {sidebar && (
        <aside
          className={`w-full lg:w-80 space-y-6 mb-8 lg:mb-0 ${sidebarClassName}`}
        >
          {sidebar}
        </aside>
      )}
    </div>
  );
}

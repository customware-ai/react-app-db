import { useState } from "react";
import type { ReactElement, ReactNode } from "react";
import clsx from "clsx";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { TemplateBanner } from "../ui/TemplateBanner";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  children: ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export function PageLayout({ children, breadcrumbs }: PageLayoutProps): ReactElement {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors">
      {/* Industrial Grid Pattern Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <TemplateBanner />
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <TopBar breadcrumbs={breadcrumbs} sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <main className={clsx(
        "relative pt-[5.5rem] min-h-screen transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}

import type { ReactElement, ReactNode } from "react";
import clsx from "clsx";

interface Tab {
  label: string;
  value: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: number | string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
  variant?: "default" | "pills";
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
}: TabsProps): ReactElement {
  const activeTabContent = tabs.find((tab) => tab.value === activeTab)?.content;

  if (variant === "pills") {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-surface-100 dark:bg-surface-800 rounded-lg">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  isActive
                    ? "bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm"
                    : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200"
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={clsx(
                      "px-2 py-0.5 text-xs font-semibold rounded-full",
                      isActive
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                        : "bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="animate-fade-in">{activeTabContent}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-200 dark:border-surface-700">
        <nav className="flex gap-8" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.value)}
                className={clsx(
                  "relative flex items-center gap-2 pb-4 px-1 text-sm font-semibold transition-colors",
                  isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200"
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={clsx(
                      "px-2 py-0.5 text-xs font-medium rounded-full",
                      isActive
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                        : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="animate-fade-in">{activeTabContent}</div>
    </div>
  );
}

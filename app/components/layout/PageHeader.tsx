import type { ReactElement, ReactNode } from "react";
import { cn } from "~/lib/utils";

interface Tab {
  label: string;
  value: string;
  count?: number;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export function PageHeader({
  title,
  description,
  actions,
  tabs,
  activeTab,
  onTabChange,
}: PageHeaderProps): ReactElement {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {tabs && tabs.length > 0 && (
        <div className="mt-4 border-b">
          <nav className="flex gap-4" role="tablist">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  role="tab"
                  aria-selected={isActive}
                  onClick={(): void => onTabChange?.(tab.value)}
                  className={cn(
                    "relative pb-3 text-sm font-medium transition-colors hover:text-foreground",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {tab.count !== undefined && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

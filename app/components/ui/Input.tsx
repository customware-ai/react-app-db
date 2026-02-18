import * as React from "react"

import { cn } from "~/lib/utils"

interface InputProps extends Omit<React.ComponentProps<"input">, "ref"> {
  label?: string
  error?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const generatedId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={generatedId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
          >
            {label}
          </label>
        )}
        <input
          id={generatedId}
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="text-[0.8rem] font-medium text-destructive mt-2">{error}</p>
        ) : helperText ? (
          <p className="text-[0.8rem] text-muted-foreground mt-2">{helperText}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

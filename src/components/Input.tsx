import * as React from "react"
import { twMerge } from "tailwind-merge"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={twMerge(
          "flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-base disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

export default Input;


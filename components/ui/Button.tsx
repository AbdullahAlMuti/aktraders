import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#533afd] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#533afd] text-white hover:bg-[#4434d4] shadow-sm shadow-[#533afd]/20 hover:shadow-md hover:shadow-[#533afd]/30",
        primary: "bg-[#533afd] text-white hover:bg-[#4434d4] shadow-sm shadow-[#533afd]/20 hover:shadow-md hover:shadow-[#533afd]/30",
        secondary: "bg-[#f6f9fc] text-[#0d253d] hover:bg-[#e3e8ee] border border-[#e3e8ee] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700",
        outline: "border border-[#a8c3de]/80 bg-transparent text-[#0d253d] hover:bg-[#f6f9fc] hover:border-[#533afd] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
        destructive: "bg-[#ea2261] text-white hover:bg-rose-700 shadow-sm",
        ghost: "hover:bg-[#f6f9fc] text-[#273951] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        link: "text-[#533afd] underline-offset-4 hover:underline dark:text-blue-400 p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs",
        sm: "h-7 rounded-full px-3 text-[11px]",
        lg: "h-11 rounded-full px-6 text-sm",
        icon: "h-8 w-8 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : leftIcon ? (
          <span className="mr-1.5 inline-flex items-center">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon ? (
          <span className="ml-1.5 inline-flex items-center">{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";

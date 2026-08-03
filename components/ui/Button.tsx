import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cc785c] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#cc785c] text-white hover:bg-[#a9583e] shadow-xs hover:shadow-sm",
        primary: "bg-[#cc785c] text-white hover:bg-[#a9583e] shadow-xs hover:shadow-sm",
        secondary: "bg-[#efe9de] text-[#141413] hover:bg-[#e6dfd8] border border-[#e6dfd8] dark:bg-[#252320] dark:text-[#faf9f5] dark:hover:bg-[#2e2c28] dark:border-[#2e2c28]",
        outline: "border border-[#e6dfd8] bg-transparent text-[#141413] hover:bg-[#efe9de] hover:border-[#cc785c] dark:border-[#2e2c28] dark:text-[#faf9f5] dark:hover:bg-[#252320]",
        destructive: "bg-[#c64545] text-white hover:bg-[#a53636] shadow-xs",
        ghost: "hover:bg-[#efe9de] text-[#3d3d3a] dark:text-[#faf9f5] dark:hover:bg-[#252320]",
        link: "text-[#cc785c] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs",
        sm: "h-7 rounded-md px-3 text-[11px]",
        lg: "h-11 rounded-lg px-6 text-sm",
        icon: "h-8 w-8 rounded-md p-0",
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

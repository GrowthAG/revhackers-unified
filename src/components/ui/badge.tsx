import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Badge - Design System RevHackers
 * Radius: 2px (--radius-sm)
 * Tracking: 0.06em máximo
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xxs font-bold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Verde - acao/destaque
        default:
          "border-transparent bg-revgreen text-black",

        // Neutro em fundo claro
        secondary:
          "border-transparent bg-zinc-100 text-zinc-600",

        // Outline em fundo claro
        outline:
          "border-zinc-200 text-zinc-500 bg-transparent",

        // Outline em fundo escuro
        "outline-dark":
          "border-white/15 text-zinc-400 bg-transparent",

        // Destructive
        destructive:
          "border-transparent bg-red-100 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Tracking fixo via CSS - nao via classe inline arbitraria
const badgeStyle: React.CSSProperties = {
  letterSpacing: '0.06em',
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...badgeStyle, ...style }}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

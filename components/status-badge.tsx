// Status badge component for lands, policies, and claims

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: number
  labels: { [key: number]: string }
  colors: { [key: number]: string }
  className?: string
}

export function StatusBadge({ status, labels, colors, className }: StatusBadgeProps) {
  const label = labels[status] || "Unknown"
  const colorClass = colors[status] || "bg-gray-100 text-gray-800"

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", colorClass, className)}>
      {label}
    </span>
  )
}

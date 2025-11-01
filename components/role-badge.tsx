// Role badge component for user roles

import { cn } from "@/lib/utils"
import { getRoleLabel } from "@/lib/transaction-utils"

interface RoleBadgeProps {
  role: number | null
  className?: string
}

const roleColors: { [key: number]: string } = {
  1: "bg-blue-100 text-blue-800", // Patwari
  2: "bg-amber-100 text-amber-800", // Tehsildar
  3: "bg-emerald-100 text-emerald-800", // DLR
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const label = getRoleLabel(role)
  const colorClass = roleColors[role || 0] || "bg-gray-100 text-gray-800"

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", colorClass, className)}>
      {label}
    </span>
  )
}

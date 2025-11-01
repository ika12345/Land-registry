// Button component for blockchain transactions

"use client"

import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface TransactionButtonProps extends ButtonProps {
  onTransaction: () => Promise<void>
  loadingText?: string
  successText?: string
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}

export function TransactionButton({
  children,
  onTransaction,
  loadingText = "Processing...",
  successText,
  className,
  disabled,
  ...props
}: TransactionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleClick = async () => {
    try {
      setIsLoading(true)
      await onTransaction()
      if (successText) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
      }
    } catch (error) {
      console.error("[v0] Transaction failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading || disabled} className={cn(className)} {...props}>
      {isLoading ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          {loadingText}
        </>
      ) : showSuccess ? (
        successText
      ) : (
        children
      )}
    </Button>
  )
}

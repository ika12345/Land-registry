"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTransactionHistory, type TransactionHistoryEntry } from "@/lib/transaction-utils"
import { CheckCircle2, Clock, AlertCircle, Copy } from "lucide-react"

export function TransactionStatus({ hash, status }: { hash: string; status: "pending" | "success" | "failed" }) {
  const statusConfig = {
    pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    success: { icon: CheckCircle2, color: "bg-green-100 text-green-800", label: "Success" },
    failed: { icon: AlertCircle, color: "bg-red-100 text-red-800", label: "Failed" },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      <Badge className={config.color}>{config.label}</Badge>
      {hash && <code className="text-xs bg-gray-100 px-2 py-1 rounded">{hash.slice(0, 8)}...</code>}
    </div>
  )
}

export function TransactionHistory() {
  const [history, setHistory] = useState<TransactionHistoryEntry[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    setHistory(getTransactionHistory())
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>No transactions yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>{history.length} transaction(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((entry) => (
            <div key={entry.hash} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">{entry.type.replace(/_/g, " ")}</span>
                  <TransactionStatus hash={entry.hash} status={entry.status} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(entry.timestamp).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(entry.hash)}
                  title={copied === entry.hash ? "Copied!" : "Copy hash"}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

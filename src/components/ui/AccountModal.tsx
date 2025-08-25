"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useDisconnect } from "wagmi"
import { Dialog, DialogContent, DialogTitle } from "./dialog"
import { Drawer, DrawerContent, DrawerTitle } from "./drawer"
import { Button } from "./button"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Copy, LogOut } from "lucide-react"
import { emojiAvatarForAddress } from "@/utils/avatar"

interface AccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: {
    address?: string
    displayName?: string
    displayBalance?: string
    ensAvatar?: string
    balanceFormatted?: string
    balanceSymbol?: string
  }
  onDisconnect?: () => void
}

export function AccountModal({ open, onOpenChange, account, onDisconnect }: AccountModalProps) {
  const [copied, setCopied] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const copyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const { disconnect } = useDisconnect()
  const handleDisconnect = () => {
    disconnect()
    onDisconnect?.()
    onOpenChange(false)
  }

  const ModalContent = () => (
    <>
      {/* Account Info */}
      <div className="text-center mb-6">
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <AvatarImage src={account?.ensAvatar} alt={account?.displayName} />
          <AvatarFallback 
            className="text-3xl flex items-center justify-center"
            style={{
              backgroundColor: account?.address ? emojiAvatarForAddress(account.address).color : undefined
            }}
          >
            {account?.address ? emojiAvatarForAddress(account.address).emoji : '?'}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {account?.displayName || `${account?.address?.slice(0, 6)}...${account?.address?.slice(-4)}`}
        </h3>
        
        {(account?.displayBalance || account?.balanceFormatted) && (
          <p className="text-base text-muted-foreground">
            {account.displayBalance || `${account.balanceFormatted} ${account.balanceSymbol || ''}`}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={copyAddress}
          variant="outline"
          className="flex-1 h-12 rounded-xl border border-border hover:bg-accent transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" />
          <span className="text-base font-medium">
            {copied ? 'Copied!' : 'Copy Address'}
          </span>
        </Button>
        
        <Button
          onClick={handleDisconnect}
          variant="outline"
          className="flex-1 h-12 rounded-xl border border-border hover:bg-destructive/10 hover:border-destructive/20 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-base font-medium">Disconnect</span>
        </Button>
      </div>
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl">
          <DialogTitle className="sr-only">Account Details</DialogTitle>
          <ModalContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-6">
        <DrawerTitle className="sr-only">Account Details</DrawerTitle>
        <ModalContent />
      </DrawerContent>
    </Drawer>
  )
}

"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useDisconnect } from "wagmi"
import { Dialog, DialogContent, DialogTitle } from "./dialog"
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from "./drawer"
import { Button } from "./button"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Copy, LogOut, XIcon } from "lucide-react"
import { emojiAvatarForAddress } from "@/utils/avatar"
import { usePreferredIdentity } from "@/hooks/use-subnames"

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
  
  const { name, avatarSrc } = usePreferredIdentity({
    address: account?.address,
    fallbackName: account?.displayName,
    fallbackAvatar: account?.ensAvatar,
  })

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

  const ModalContent = ({ showCloseButton = false }) => (
    <div className="bg-gray-50 rounded-2xl p-6 relative">
      {showCloseButton && (
        <DrawerClose asChild>
          <button className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </DrawerClose>
      )}
      
      {/* Account Info */}
      <div className="text-center mb-6">
        <Avatar className="w-20 h-20 mx-auto my-3">
          <AvatarImage src={avatarSrc} alt={name} />
          <AvatarFallback 
            className="text-2xl flex items-center justify-center"
            style={{
              backgroundColor: account?.address ? emojiAvatarForAddress(account.address).color : undefined
            }}
          >
            {account?.address ? emojiAvatarForAddress(account.address).emoji : '?'}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="text-2xl font-bold text-gray-900 ">
          {name}
        </h3>
        
        {(account?.displayBalance || account?.balanceFormatted) && (
          <p className="text-sm text-gray-600 ">
            {account.displayBalance || `${account.balanceFormatted} ${account.balanceSymbol || ''}`}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={copyAddress}
          className="w-1/2 h-14 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1"
        >
          <Copy className="w-4 h-4" />
          <span className="text-sm">
            {copied ? 'Copied!' : 'Copy Address'}
          </span>
        </Button>
        
        <Button
          onClick={handleDisconnect}
          className="w-1/2 h-14 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Disconnect</span>
        </Button>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm p-2 rounded-2xl bg-transparent border-0 shadow-none">
          <DialogTitle className="sr-only">Account Details</DialogTitle>
          <ModalContent showCloseButton={false} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-4 border-0 [&_.bg-muted]:hidden">
        <DrawerTitle className="sr-only">Account Details</DrawerTitle>
        <ModalContent showCloseButton={true} />
      </DrawerContent>
    </Drawer>
  )
}

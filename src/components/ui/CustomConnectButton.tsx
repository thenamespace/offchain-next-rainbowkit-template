"use client"

import * as React from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { ChevronDown, Copy, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Badge } from "./badge"
import { emojiAvatarForAddress } from "@/utils/avatar"

export const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated')

        if (!ready) {
          return (
            <div
              aria-hidden
              style={{
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <Button disabled>Connect Wallet</Button>
            </div>
          )
        }

        if (!connected) {
          return (
            <Button
              onClick={openConnectModal}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-base"
            >
              Connect Wallet
            </Button>
          )
        }

        if (chain.unsupported) {
          return (
            <Button
              onClick={openChainModal}
              variant="destructive"
              className="font-medium px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base"
            >
              Wrong network
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            {/* Network Selector */}
            <Button
              onClick={openChainModal}
              variant="outline"
              className="h-10 px-3 py-2 rounded-xl border border-border bg-background hover:bg-accent transition-all duration-200 shadow-sm hover:shadow-md text-base"
            >
              {chain.hasIcon && (
                <div
                  className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 "
                  style={{
                    background: chain.iconBackground,
                  }}
                >
                  {chain.iconUrl && (
                    <img
                      alt={chain.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
              <span className="font-medium text-foreground text-base hidden sm:inline">{chain.name}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
            </Button>

            {/* Combined Account & Balance Display */}
            <Button
              onClick={openAccountModal}
              variant="outline"
              className="h-10 px-3 py-2 rounded-xl border border-border bg-background hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md text-base flex items-center justify-between"
            >
              {account.displayBalance && (
                <span className="text-muted-foreground text-base mr-3">
                  {account.displayBalance}
                </span>
              )}
              <div className="flex items-center rounded-lg px-2 py-1 sm:bg-muted">
                <Avatar className="w-6 h-6 mr-2">
                  <AvatarImage src={account.ensAvatar} alt={account.displayName} />
                  <AvatarFallback 
                    className="text-sm flex items-center justify-center"
                    style={{
                      backgroundColor: account.address ? emojiAvatarForAddress(account.address).color : undefined
                    }}
                  >
                    {account.address ? emojiAvatarForAddress(account.address).emoji : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground text-base mr-2">
                  {account.displayName || `${account.address?.slice(0, 6)}...${account.address?.slice(-4)}`}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </Button>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

// Account Modal Component
export const AccountModal = ({ 
  account, 
  onClose, 
  onDisconnect 
}: { 
  account: {
    address?: string
    displayName?: string
    displayBalance?: string
    ensAvatar?: string
  }
  onClose: () => void
  onDisconnect: () => void 
}) => {
  const [copied, setCopied] = React.useState(false)

  const copyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-2xl p-6 w-80 max-w-[90vw] shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 border border-border">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-semibold text-foreground">Account</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-accent"
          >
            ×
          </Button>
        </div>

        {/* Account Info */}
        <div className="text-center mb-6">
          <Avatar className="w-16 h-16 mx-auto mb-4">
            <AvatarImage src={account?.ensAvatar} alt={account?.displayName} />
            <AvatarFallback 
              className="text-2xl"
              style={{
                backgroundColor: account?.address ? emojiAvatarForAddress(account.address).color : undefined
              }}
            >
              {account?.address ? emojiAvatarForAddress(account.address).emoji : '?'}
            </AvatarFallback>
          </Avatar>
          
          <p className="font-semibold text-foreground mb-1">
            {account?.displayName || `${account?.address?.slice(0, 6)}...${account?.address?.slice(-4)}`}
          </p>
          
          {account?.displayBalance && (
            <p className="text-sm text-muted-foreground">{account.displayBalance}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={copyAddress}
            variant="outline"
            className="flex-1 h-12 rounded-xl border border-border hover:bg-accent transition-all duration-200"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Copied!' : 'Copy Address'}
          </Button>
          
          <Button
            onClick={onDisconnect}
            variant="outline"
            className="flex-1 h-12 rounded-xl border border-border hover:bg-destructive/10 hover:border-destructive/20 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  )
}

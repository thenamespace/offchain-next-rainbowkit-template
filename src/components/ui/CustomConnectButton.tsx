"use client"

import * as React from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { ChevronDown } from "lucide-react"
import { Button } from "./button"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { emojiAvatarForAddress } from "@/utils/avatar"
import { AccountModal } from "./AccountModal"

export const CustomConnectButton = () => {
  const [accountModalOpen, setAccountModalOpen] = React.useState(false)

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
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
        console.log("account")
        console.log(account)
        console.log("done")

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
              onClick={() => setAccountModalOpen(true)}
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

            {/* Custom Account Modal */}
            <AccountModal
              open={accountModalOpen}
              onOpenChange={setAccountModalOpen}
              account={account}
              onDisconnect={() => {
                setAccountModalOpen(false)
              }}
            />
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}



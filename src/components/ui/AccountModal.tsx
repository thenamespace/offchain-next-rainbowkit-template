"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useDisconnect } from "wagmi"
import { Dialog, DialogContent, DialogTitle } from "./dialog"
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from "./drawer"
import { Button } from "./button"
import { Input } from "./input"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Copy, LogOut, XIcon, Plus, Check, AlertCircle, Loader2 } from "lucide-react"
import { emojiAvatarForAddress } from "@/utils/avatar"
import { usePreferredIdentity } from "@/hooks/use-subnames"
import { useSubnameAvailability, useCreateSubname } from "@/hooks/use-subname-creation"
import { useDebounce } from "@/hooks/use-debounce"

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
  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [username, setUsername] = React.useState('')
  const [avatarUrl, setAvatarUrl] = React.useState('')
  const isDesktop = useMediaQuery("(min-width: 768px)")
  
  // Debounce username to avoid excessive API calls
  const debouncedUsername = useDebounce(username, 500)
  
  const { name, avatarSrc, hasSubnames, isLoading: identityLoading, refetch: refetchIdentity } = usePreferredIdentity({
    address: account?.address,
    fallbackName: account?.displayName,
    fallbackAvatar: account?.ensAvatar,
  })

  const { data: isAvailable, isLoading: availabilityLoading } = useSubnameAvailability(debouncedUsername)
  const { createSubname, isCreating, error, isSuccess, reset } = useCreateSubname()

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

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setShowCreateForm(false)
      setUsername('')
      setAvatarUrl('')
      reset()
    }
  }, [open, reset])

  // Handle successful creation
  React.useEffect(() => {
    if (isSuccess) {
      setShowCreateForm(false)
      setUsername('')
      setAvatarUrl('')
      // Refresh the identity data to show the new subname
      refetchIdentity()
    }
  }, [isSuccess, refetchIdentity])

  const handleCreateSubname = () => {
    if (!account?.address || !username) return
    
    createSubname({
      label: username,
      address: account.address,
      displayName: username, // Use username as display name
      pfpUrl: avatarUrl || '', // Use provided avatar or empty string
    })
  }

  const isFormValid = username.length > 0 && isAvailable === true
  const showAvailabilityIcon = debouncedUsername.length > 0 && !availabilityLoading
  const showLoadingIcon = debouncedUsername.length > 0 && availabilityLoading

  const ModalContent = ({ showCloseButton = false }) => (
    <div className="bg-gray-50 rounded-2xl p-6 relative">
      {showCloseButton && (
        <DrawerClose asChild>
          <button className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </DrawerClose>
      )}
      
      {showCreateForm ? (
        /* Subname Creation Form */
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Your Subname</h3>
            <p className="text-sm text-gray-600">Choose a username and display name for your identity</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="pr-10"
                />
                {/* Always render icon container to prevent layout shifts */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {showLoadingIcon && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                  {showAvailabilityIcon && !showLoadingIcon && (
                    <>
                      {isAvailable ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </>
                  )}
                </div>
              </div>
              {username && (
                <p className="text-xs text-gray-500 mt-1">
                  Your subname will be: <span className="font-medium">{username}.{process.env.NEXT_PUBLIC_ENS_NAME}</span>
                </p>
              )}
              {showAvailabilityIcon && !isAvailable && (
                <p className="text-xs text-red-500 mt-1">This username is already taken</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL (optional)</label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                type="url"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateForm(false)}
              variant="outline"
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubname}
              disabled={!isFormValid || isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Subname'
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Default Account View */
        <>
          {/* Account Info */}
          <div className="text-center mb-6">
            <Avatar className="w-20 h-20 mx-auto my-3">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
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
          <div className="space-y-3">
            {!hasSubnames && !identityLoading && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Subname</span>
              </Button>
            )}
            
            <div className="flex gap-3">
              <Button
                onClick={copyAddress}
                className="flex-1 h-14 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">
                  {copied ? 'Copied!' : 'Copy Address'}
                </span>
              </Button>
              
              <Button
                onClick={handleDisconnect}
                className="flex-1 h-14 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Disconnect</span>
              </Button>
            </div>
          </div>
        </>
      )}
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
      <DrawerContent className="p-4 border-0">
        <DrawerTitle className="sr-only">Account Details</DrawerTitle>
        <ModalContent showCloseButton={true} />
      </DrawerContent>
    </Drawer>
  )
}

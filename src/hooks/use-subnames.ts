import { useQuery } from '@tanstack/react-query'
import clientSideClient from '@/lib/namespace-client'

interface SubnameData {
  id: string
  fullName: string
  parentName: string
  label: string
  texts: Record<string, string>
  addresses: Record<string, string>
  metadata: Record<string, string>
  contenthash: string | null
  namehash: string
  owner: string | null
}

interface SubnamesResponse {
  page: number
  size: number
  totalItems: number
  items: SubnameData[]
}

export function useSubnames(address: string | undefined) {
  return useQuery({
    queryKey: ['subnames', address],
    queryFn: async (): Promise<SubnamesResponse | null> => {
      if (!address) {
        return null
      }

      try {
        const requestParams: {
          owner: string
          parentName?: string
        } = {
          owner: address,
        }

        if (process.env.NEXT_PUBLIC_ENS_NAME) {
          requestParams.parentName = process.env.NEXT_PUBLIC_ENS_NAME
        }

        const response = await clientSideClient.getFilteredSubnames(requestParams)
        return response as SubnamesResponse
      } catch (error) {
        console.error('Error fetching subnames:', error)
        return null
      }
    },
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}

export function useFirstSubname(address: string | undefined) {
  const { data: subnamesData, isLoading, error } = useSubnames(address)
  
  const firstSubname = subnamesData?.items?.[0] || null
  
  return {
    subname: firstSubname,
    isLoading,
    error,
    hasSubnames: (subnamesData?.totalItems || 0) > 0
  }
}

export function usePreferredIdentity(args: {
  address?: string
  fallbackName?: string
  fallbackAvatar?: string
}) {
  const { address, fallbackName, fallbackAvatar } = args
  const { subname, isLoading, hasSubnames } = useFirstSubname(address)

  // Helper to check if fallbackName is just a truncated address (like "0x92…5a3e")
  const isTruncatedAddress = (name: string) => {
    return /^0x[a-fA-F0-9]{2,6}[…\.]{1,3}[a-fA-F0-9]{2,6}$/.test(name)
  }

  // Priority: subname > meaningful fallbackName > truncated address
  const getName = () => {
    // 1. Prefer subname if available
    if (subname?.fullName) {
      return subname.fullName
    }
    
    // 2. Use fallbackName only if it's not a truncated address
    if (fallbackName && !isTruncatedAddress(fallbackName)) {
      return fallbackName
    }
    
    // 3. Final fallback to truncated address
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  }

  const name = getName()
  const avatarSrc = fallbackAvatar || subname?.texts?.avatar || undefined

  return {
    name,
    avatarSrc,
    isLoading,
    hasSubnames,
    subname,
  }
}

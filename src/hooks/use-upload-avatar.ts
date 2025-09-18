 import { useMutation } from '@tanstack/react-query';
import { SiweMessage } from 'siwe';
import { useAccount, useSignMessage, useChainId } from 'wagmi';

type Network = 'mainnet' | 'sepolia' | 'holesky';
type UploadParams = {
  file: File;
  subname: string;      // e.g. 'alice.offchainsub.eth'
  network: Network;     // must match backend enum
  scope?: 'avatar' | 'header' | 'avatar+header';
};

// Direct calls to avatar service
const baseUrl = 'https://metadata.namespace.ninja';

async function getNonce(address: string, scope: UploadParams['scope'] = 'avatar+header') {
  const url = `${baseUrl}/auth/nonce`;
  console.log('Fetching nonce directly from:', url);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'content-type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ address, scope }),
    });
    
    console.log('Nonce response status:', res.status);
    console.log('Nonce response headers:', Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('Nonce request failed:', res.status, errorText);
      throw new Error(`Failed to get nonce: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Nonce response:', data);
    return data as { nonce: string; expiresAt: number };
  } catch (error) {
    console.error('Nonce fetch error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Cannot connect to avatar service. Check if the server is running and CORS is configured.');
    }
    throw error;
  }
}

function buildSiweMessage(params: {
  address: string;
  chainId: number;
  nonce: string;
  statement?: string;
}) {
  const { address, chainId, nonce, statement } = params;
  
  const msg = new SiweMessage({
    domain: 'offchain-next-rainbowkit-template.vercel.app',
    address: address, 
    statement:'Sign in to Avatar Service (local test)',
    uri: 'https://offchain-next-rainbowkit-template.vercel.app',
    version: '1',
    chainId,
    nonce,
    issuedAt: new Date().toISOString(),
  });
  
  const preparedMessage = msg.prepareMessage();
  
  console.log('Prepared SIWE message structure:');
  console.log('- domain:', msg.domain);
  console.log('- address:', msg.address);
  console.log('- statement:', msg.statement);
  console.log('- uri:', msg.uri);
  console.log('- version:', msg.version);
  console.log('- chainId:', msg.chainId);
  console.log('- nonce:', msg.nonce);
  console.log('- issuedAt:', msg.issuedAt);
  console.log('Raw prepared message:', JSON.stringify(preparedMessage));
  console.log('Message bytes:', new TextEncoder().encode(preparedMessage));
  
  return preparedMessage;
}

async function uploadAvatarDirect({
  file,
  subname,
  network,
  address,
  chainId,
  signMessageAsync,
}: {
  file: File;
  subname: string;
  network: Network;
  address: `0x${string}`;
  chainId: number;
  signMessageAsync: (args: { message: string }) => Promise<`0x${string}`>;
}) {
  // 1) Get nonce
  console.log('Getting nonce for upload with scope: avatar+header');
  const nonceStartTime = Date.now();
  const { nonce, expiresAt } = await getNonce(address, 'avatar+header');
  console.log('Received nonce:', nonce);
  console.log('Nonce expires at:', new Date(expiresAt));
  console.log('Time until expiry:', Math.round((expiresAt - Date.now()) / 1000), 'seconds');

  // 2) Build SIWE message and sign
  console.log('Building SIWE message');
  console.log('address', address);
  console.log('chainId', chainId);
  console.log('nonce', nonce);
  const siweMessage = buildSiweMessage({ address, chainId, nonce });
  console.log('siweMessage (exact string to be signed):', siweMessage);
  console.log('siweMessage bytes:', new TextEncoder().encode(siweMessage));
  
  const siweSignature = await signMessageAsync({ message: siweMessage });
  console.log('siweSignature:', siweSignature);
  
  // Verify we're sending the EXACT same message that was signed
  console.log('Confirming: message to send === message that was signed:', siweMessage);

  // 3) POST multipart form
  const form = new FormData();
  
  // Append fields in a specific order (some servers are sensitive to this)
  form.append('address', address);
  form.append('siweMessage', siweMessage);
  form.append('siweSignature', siweSignature);
  form.append('avatar', file, file.name);  // Explicitly set filename

  console.log('Form data being sent:');
  console.log('- avatar file:', file.name, file.size, 'bytes', file.type);
  console.log('- siweMessage:', siweMessage);
  console.log('- siweSignature:', siweSignature);
  console.log('- address:', address);
  
  // Debug the actual FormData contents
  console.log('FormData entries:');
  for (const [key, value] of form.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}:`, {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified
      });
    } else {
      console.log(`  ${key}:`, typeof value, value.length, 'chars');
    }
  }

  console.log('Making request directly to:', `${baseUrl}/profile/${network}/${subname}/avatar`);
  
  const res = await fetch(`${baseUrl}/profile/${network}/${subname}/avatar`, {
    method: 'POST',
    body: form,
    // Don't set Content-Type - let browser set multipart/form-data boundary
  });
  
  console.log('Response status:', res.status);
  console.log('Response headers:', Object.fromEntries(res.headers.entries()));

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Upload failed');
  }

  return res.json() as Promise<{
    subname: string;
    network: string;
    avatarUrl: string;
    uploadedAt: string;
    fileSize: number;
    isUpdate: boolean;
  }>;
}

async function deleteAvatarDirect({
  subname,
  network,
  address,
  chainId,
  signMessageAsync,
}: {
  subname: string;
  network: Network;
  address: `0x${string}`;
  chainId: number;
  signMessageAsync: (args: { message: string }) => Promise<`0x${string}`>;
}) {
  console.log('Getting nonce for delete with scope: avatar');
  const { nonce } = await getNonce(address, 'avatar');
  console.log('Received delete nonce:', nonce);
  const siweMessage = buildSiweMessage({ address, chainId, nonce });
  const siweSignature = await signMessageAsync({ message: siweMessage });

  const res = await fetch(`${baseUrl}/profile/${network}/${subname}/avatar`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ siweMessage, siweSignature, address }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Delete failed');
  }
  return res.json() as Promise<{
    subname: string;
    network: string;
    message: string;
    deletedAt: string;
  }>;
}

export function useUploadAvatar() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, subname, network }: UploadParams) => {
      if (!address) throw new Error('Connect wallet');
      if (!chainId) throw new Error('Missing chainId');
      return uploadAvatarDirect({
        file,
        subname,
        network,
        address,
        chainId,
        signMessageAsync,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ subname, network }: { subname: string; network: Network }) => {
      if (!address) throw new Error('Connect wallet');
      if (!chainId) throw new Error('Missing chainId');
      return deleteAvatarDirect({
        subname,
        network,
        address,
        chainId,
        signMessageAsync,
      });
    },
  });

  return {
    uploadAvatar: uploadMutation.mutateAsync,
    deleteAvatar: deleteMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    data: uploadMutation.data,
    error: uploadMutation.error,
  };
}

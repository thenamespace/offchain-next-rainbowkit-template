# Namespace Offchain Subnames + RainbowKit Starter Kit

A Next.js starter kit demonstrating the integration of [Namespace Offchain Manager SDK](https://docs.namespace.ninja/developer-guide/sdks/offchain-manager) with [RainbowKit](https://rainbowkit.com) for creating and managing Offchain ENS subnames.

**🔗 Repository:** [https://github.com/thenamespace/offchain-next-rainbowkit-template](https://github.com/thenamespace/offchain-next-rainbowkit-template)

## Prerequisites

- Node.js (v18 or later)
- An ENS name (e.g., `offchainsub.eth`)
- Namespace API key from the [Dev Portal](https://dev.namespace.ninja)

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/thenamespace/offchain-next-rainbowkit-template.git
cd offchain-next-rainbowkit-template
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Your ENS name (eg. offchainsub.eth)
NEXT_PUBLIC_ENS_NAME=yourname

# Your Namespace API key (keep this secret!)
NAMESPACE_API_KEY=your_api_key_here
```

### 3. Configure Your ENS Name

1. Visit the [Namespace Dev Portal](https://dev.namespace.ninja)
2. Change the resolver for your ENS name to Namespace's resolver
3. Generate and copy your API key
4. Add both to your `.env.local` file

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Features

This starter kit provides a complete implementation with:

### 🔗 RainbowKit Integration
- Custom connect button with Namespace subname support
- Account modal with subname creation functionality
- Automatic primary name resolution

### 🏗️ Architecture
- **Server-side Namespace client** (`/src/lib/namespace.ts`) - Uses API key securely for write operations
- **Client-side Namespace client** (`/src/lib/namespace-client.ts`) - For read-only operations without API key exposure
- **API route** (`/src/app/api/subname/create/route.ts`) - Server-side subname creation endpoint

### 🪝 Custom Hooks
- **`useSubnames`** - Fetch subnames for an address
- **`useFirstSubname`** - Get the primary subname for an address  
- **`usePreferredIdentity`** - Intelligent name resolution (subname → ENS → truncated address)
- **`useCreateSubname`** - Create new subnames with validation
- **`useSubnameAvailability`** - Check if a subname is available

### 📡 API Endpoints
- **`POST /api/subname/create`** - Create subnames with custom address and text records

### ⚙️ Subname Configuration
- Custom Ethereum addresses
- Avatar/PFP support via text records
- Display name customization
- Metadata tracking (sender address)

## Components

### CustomConnectButton
A replacement for RainbowKit's default ConnectButton that:
- Shows subnames instead of truncated addresses
- Displays custom avatars from subname text records
- Provides seamless wallet connection experience

### AccountModal
A comprehensive account management interface that:
- Shows current subname and balance
- Allows creation of new subnames
- Validates subname availability in real-time
- Supports custom avatars and display names

## Security & Limitations

### ⚠️ Important Security Notes

- **Never expose your Namespace API key to the client side**
- API key is only used in server-side code (`/src/lib/namespace.ts` and API routes)
- Client-side operations use the public client without API key

### 📊 Rate Limits

- **2,000 subnames** can be created per API key to prevent abuse
- Need more? Contact us on [Builders Group](https://t.me/+5FAwyiKOTeswNTIy)

## File Structure

```
src/
├── app/
│   ├── api/subname/create/route.ts    # Server-side subname creation
│   ├── page.tsx                       # Main demo page
│   └── providers.tsx                  # RainbowKit & Wagmi setup
├── components/
│   └── kit/
│       ├── AccountModal.tsx           # Account management modal
│       └── CustomConnectButton.tsx    # Custom connect button
├── hooks/
│   ├── use-subnames.ts               # Subname fetching hooks
│   └── use-subname-creation.ts       # Subname creation hooks
└── lib/
    ├── namespace.ts                   # Server-side client (with API key)
    └── namespace-client.ts            # Client-side client (read-only)
```

## References

- **GitHub Repository**: [https://github.com/thenamespace/offchain-next-rainbowkit-template](https://github.com/thenamespace/offchain-next-rainbowkit-template)
- **Documentation**: [https://docs.namespace.ninja/](https://docs.namespace.ninja/)
- **SDK Reference**: [Offchain Manager SDK](https://docs.namespace.ninja/developer-guide/sdks/offchain-manager)
- **Builders Group**: [https://t.me/+5FAwyiKOTeswNTIy](https://t.me/+5FAwyiKOTeswNTIy)
- **RainbowKit Docs**: [https://rainbowkit.com/docs/introduction](https://rainbowkit.com/docs/introduction)

## Contributing

This is a starter kit template. Feel free to customize and extend it for your specific use case. For questions or support, join our [Builders Group on Telegram](https://t.me/+5FAwyiKOTeswNTIy).

## License

This project is open source and available under the MIT License.

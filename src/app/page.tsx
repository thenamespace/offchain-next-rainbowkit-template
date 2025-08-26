import { CustomConnectButton } from "@/components/kit/CustomConnectButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Namespace" width={32} height={32} />
          </div>
          <CustomConnectButton/>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 lg:py-12">
        {/* Hero Section */}
        <section className="text-center mb-12 lg:mb-16">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              🚀 Ready-to-use Starter Kit
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Build with 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> ENS Subnames</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Complete Next.js starter kit with RainbowKit integration for creating and managing Offchain ENS subnames using Namespace SDK.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Link href="https://docs.namespace.ninja" target="_blank" className="group">
                <div className="bg-card border rounded-lg p-6 h-full flex flex-col justify-between hover:border-foreground/20 transition-colors">
                  <h3 className="font-semibold mb-2 group-hover:text-foreground">Namespace Docs</h3>
                  <p className="text-sm text-muted-foreground">Learn how to use the Namespace SDK</p>
                </div>
              </Link>
              
              <Link href="https://dev.namespace.ninja" target="_blank" className="group">
                <div className="bg-card border rounded-lg p-6 h-full flex flex-col justify-between hover:border-foreground/20 transition-colors">
                  <h3 className="font-semibold mb-2 group-hover:text-foreground">Dev Portal</h3>
                  <p className="text-sm text-muted-foreground">Get your API key and manage domains</p>
                </div>
              </Link>
              
              <Link href="https://github.com/namespace-labs/starter-kit" target="_blank" className="group">
                <div className="bg-card border rounded-lg p-6 h-full flex flex-col justify-between hover:border-foreground/20 transition-colors">
                  <h3 className="font-semibold mb-2 group-hover:text-foreground">GitHub Repo</h3>
                  <p className="text-sm text-muted-foreground">View source code and contribute</p>
                </div>
              </Link>
              
              <Link href="https://www.rainbowkit.com" target="_blank" className="group">
                <div className="bg-card border rounded-lg p-6 h-full flex flex-col justify-between hover:border-foreground/20 transition-colors">
                  <h3 className="font-semibold mb-2 group-hover:text-foreground">RainbowKit Docs</h3>
                  <p className="text-sm text-muted-foreground">Learn about wallet connections</p>
                </div>
              </Link>
            </div>
          </div>
        </section>





        {/* What's Included */}
        <section className="mb-12 lg:mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What&apos;s Included</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-blue-600">🔗</span>
                  Wallet Integration
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Custom RainbowKit connect button</li>
                  <li>• Account modal with subname creation</li>
                  <li>• Automatic ENS name resolution</li>
                  <li>• Mobile-responsive design</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-green-600">🪝</span>
                  React Hooks
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• useSubnames - Fetch user subnames</li>
                  <li>• useSubnameCreation - Create new subnames</li>
                  <li>• Built-in loading and error states</li>
                  <li>• TypeScript support included</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-purple-600">🛡️</span>
                  Secure Architecture
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Server-side API key protection</li>
                  <li>• Client-side read-only operations</li>
                  <li>• Built-in validation and error handling</li>
                  <li>• Production-ready configuration</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-orange-600">⚡</span>
                  Modern Stack
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Next.js 14 with App Router</li>
                  <li>• Tailwind CSS + shadcn/ui</li>
                  <li>• TypeScript throughout</li>
                  <li>• ESLint and Prettier configured</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Get API Key CTA */}
        <section className="text-center mb-12">
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-8 border">
            <h2 className="text-2xl font-bold mb-4">Need an API Key?</h2>
            <p className="text-muted-foreground mb-6">
              Get your free Namespace API key to start creating subnames for your ENS domain
            </p>
            <Button size="lg" asChild>
              <Link href="https://dev.namespace.ninja" target="_blank">
                Get Free API Key
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <div>Built with Namespace SDK • Open source under MIT</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="https://docs.namespace.ninja" target="_blank" className="hover:text-foreground">
              Docs
            </Link>
            <Link href="https://github.com/namespace-labs" target="_blank" className="hover:text-foreground">
              GitHub
            </Link>
            <Link href="https://t.me/+5FAwyiKOTeswNTIy" target="_blank" className="hover:text-foreground">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { PackFeed } from "@/components/pack-feed";
import { packService } from "@/services/packService";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Leaf, Package2, ShieldCheck } from "lucide-react";

export default async function Home() {
  const packs = await packService.getPacks();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-20 px-4 md:px-6 overflow-hidden">
        {/* Abstract shapes/bg pattern could go here */}
        <div className="container relative z-10 mx-auto flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl">
            Give goods a second life. <br className="hidden md:inline" /> Share <span className="text-teal-200">Packs</span> with neighbors.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
            Pack2Pack connects you with people nearby to buy and sell bundles of items.
            Reduce waste, save money, and discover hidden gems.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button size="lg" variant="secondary" className="font-semibold text-primary" asChild>
              <Link href="#feed">Explore Packs</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/create">Start Selling</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Values */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4 text-green-600 dark:text-green-400">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Eco-Friendly</h3>
            <p className="text-muted-foreground text-sm">Save items from the landfill by passing them on to someone who needs them.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 text-blue-600 dark:text-blue-400">
              <Package2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Curated Packs</h3>
            <p className="text-muted-foreground text-sm">Bundle items together for better value and easier decluttering.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mb-4 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Verified Community</h3>
            <p className="text-muted-foreground text-sm">Connect with real people in your neighborhood securely.</p>
          </div>
        </div>
      </section>

      {/* Feed Section */}
      <section id="feed" className="container mx-auto py-12 px-4 md:px-6 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Nearby Packs</h2>
          <Button variant="link" asChild>
            <Link href="/search" className="flex items-center">View all <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>

        <PackFeed initialPacks={packs} />
      </section>
    </div>
  );
}

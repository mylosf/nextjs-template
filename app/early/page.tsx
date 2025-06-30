import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Gem } from "lucide-react";
import { Emerald3D } from "@/components/ui/Emerald3D";

export default function EarlyAccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <a href="/" className="absolute top-8 left-8 text-sm text-gray-400 hover:text-white transition-colors">
        <span className="underline">← back</span>
      </a>
      <h1 className="text-3xl md:text-4xl mb-14 tracking-tight">Be part of something monumental</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl">
        {/* Tier 1: Free */}
        <div className="bg-[#181e29] rounded-lg border border-white/5 p-8 flex flex-col items-center gap-6 flex-1">
          <div className="text-3xl font-bold mb-1 tracking-tight">Free</div>
          <div className="mb-2 text-xs text-muted-foreground text-center">For individuals, engineers, and everyone who is excited about aura.</div>
          <ul className="flex flex-col gap-2 mb-4 w-full max-w-xs">
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-gray-400" />
              get free access before launch
            </li>
          </ul>
          <div className="mt-auto w-full">
            <Input placeholder="Your email" className="mb-3 bg-black/30 border-white/10 text-white text-sm" />
            <Button className="w-full text-sm font-medium">Be one of the first</Button>
          </div>
        </div>
        {/* Tier 2: $250,000 */}
        <div className="bg-[#181e29] rounded-lg border border-white/5 p-8 flex flex-col items-center gap-6 flex-1">
          <div className="text-3xl font-bold mb-1 tracking-tight">$250,000</div>
          <div className="mb-2 text-xs text-muted-foreground text-center">For consulting companies
          </div>
          <ul className="flex flex-col gap-2 mb-4 w-full max-w-xs">
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-gray-400" />
              get free access before launch
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-gray-400" />
              get access to our vision
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-gray-400" />
              get access to our manifesto
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-gray-400" />
              get early access to our partner network
            </li>
          </ul>
          <div className="mt-auto w-full">
            <Input placeholder="Your email" className="mb-3 bg-black/30 border-white/10 text-white text-sm" />
            <Button className="w-full text-sm font-medium">We'll email you</Button>
          </div>
        </div>
        {/* Tier 3: $2,500,000 */}
        <div className="bg-[#181e29] rounded-lg border border-white/5 p-8 flex flex-col items-center gap-6 flex-1">
          <div className="text-3xl font-bold mb-1 tracking-tight">$2,500,000</div>
          <div className="mb-2 text-xs text-muted-foreground text-center">For system integrators and enterprises.</div>
          <ul className="flex flex-col gap-2 mb-4 w-full max-w-xs">
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-gray-400" />
              get free access before launch
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-gray-400" />
              get access to our vision
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-gray-400" />
              get access to our manifesto
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-gray-400" />
              API access
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-gray-400" />
              custom launch video
            </li>
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-gray-400 mr-2" />
              <span>
                become a ruby partner
                <span className="inline-block align-middle mx-2" style={{ width: 24, height: 36 }}>
                  <Emerald3D />
                </span>
                
              </span>
            </li>
          </ul>
          <div className="mt-auto w-full">
            <Input placeholder="Your email" className="mb-4 bg-black/30 border-white/10 text-white text-sm" />
            <Button variant="outline" className="w-full border-red-400 text-red-400 hover:bg-red-400 hover:text-black text-sm font-medium">We'll email you</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
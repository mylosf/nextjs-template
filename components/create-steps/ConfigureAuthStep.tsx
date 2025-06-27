import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";

const AUTH_PROVIDERS = [
  { label: "Password", value: "password" },
  { label: "Google", value: "google" },
  { label: "Amazon", value: "amazon" },
  { label: "Apple", value: "apple" },
];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function ConfigureAuthStep({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<string[]>(["password"]);

  const handleToggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // Example variants for the auth card
  const cardVariants = [
    // Variant 1: Default layout
    (
      <Card className="w-full max-w-sm" key="variant-1">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            {selected.includes("password") && (
              <>
                <Input
                  type="email"
                  placeholder="Email"
                  className="w-full"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  className="w-full"
                />
                <div className="flex justify-between text-xs mt-1">
                  <button type="button" className="underline text-gray-400 hover:text-primary">Sign up</button>
                  <button type="button" className="underline text-gray-400 hover:text-primary">Forgot password?</button>
                </div>
              </>
            )}
            {selected.includes("google") && (
              <Button variant="outline" className="w-full">
                Sign in with Google
              </Button>
            )}
            {selected.includes("amazon") && (
              <Button variant="outline" className="w-full">
                Sign in with Amazon
              </Button>
            )}
            {selected.includes("apple") && (
              <Button variant="outline" className="w-full">
                Sign in with Apple
              </Button>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </CardFooter>
      </Card>
    ),
    // Variant 2: Social buttons on top, password below, Sign up as a full-width button
    (
      <Card className="w-full max-w-sm" key="variant-2">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            {selected.includes("google") && (
              <Button variant="outline" className="w-full">
                Sign in with Google
              </Button>
            )}
            {selected.includes("amazon") && (
              <Button variant="outline" className="w-full">
                Sign in with Amazon
              </Button>
            )}
            {selected.includes("apple") && (
              <Button variant="outline" className="w-full">
                Sign in with Apple
              </Button>
            )}
            {selected.includes("password") && (
              <>
                <Input
                  type="email"
                  placeholder="Email"
                  className="w-full"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  className="w-full"
                />
                <div className="flex justify-end text-xs mt-1">
                  <button type="button" className="underline text-gray-400 hover:text-primary">Forgot password?</button>
                </div>
              </>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" type="submit">
            Sign In
          </Button>
          <Button className="w-full" type="button" variant="secondary">
            Sign Up
          </Button>
        </CardFooter>
      </Card>
    ),
    // Variant 3: Only social buttons (if selected)
    (
      <Card className="w-full max-w-sm" key="variant-3">
        <CardHeader>
          <CardTitle>Sign in with a provider</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            {selected.includes("google") && (
              <Button variant="outline" className="w-full">
                Sign in with Google
              </Button>
            )}
            {selected.includes("amazon") && (
              <Button variant="outline" className="w-full">
                Sign in with Amazon
              </Button>
            )}
            {selected.includes("apple") && (
              <Button variant="outline" className="w-full">
                Sign in with Apple
              </Button>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </CardFooter>
      </Card>
    ),
  ];

  return (
    <div className="flex gap-8 w-full max-w-4xl mx-auto">
      {/* Left: MultiSelect, always vertically centered */}
      <div className="w-1/3 flex flex-col justify-center min-h-[500px]">
        <div>
          <h3 className="font-semibold mb-4">Authentication Providers</h3>
          <div className="flex flex-col gap-3 mb-6">
            {AUTH_PROVIDERS.map((provider) => (
              <label key={provider.value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selected.includes(provider.value)}
                  onCheckedChange={() => handleToggle(provider.value)}
                />
                <span>{provider.label}</span>
              </label>
            ))}
          </div>
          <Button onClick={onNext} className="w-full mt-2" size="lg">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Right: Auth Card Carousel */}
      <div className="flex-1 flex items-center justify-center">
        <Carousel className="w-full max-w-sm">
          <CarouselContent>
            {cardVariants.map((variant, idx) => (
              <CarouselItem key={idx}>
                <div className="p-1">{variant}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
} 
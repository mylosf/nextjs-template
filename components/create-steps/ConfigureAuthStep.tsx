import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  onBack?: () => void;
  setData?: (data: any) => void;
}

export default function ConfigureAuthStep({ onNext, onBack, setData }: Props) {
  const [selected, setSelected] = useState<string[]>(["password"]);
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot">("signin");
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 10,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
  });

  const handleToggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // Example variants for the auth card
  const getCardVariants = (type: "signin" | "signup" | "forgot") => {
    if (type === "signin") {
      return [
        // Sign In Variant 1: Default layout
        (
          <Card className="w-full max-w-sm" key="signin-variant-1">
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
        // Sign In Variant 2: Social buttons on top
        (
          <Card className="w-full max-w-sm" key="signin-variant-2">
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
      ];
    } else if (type === "signup") {
      return [
        // Sign Up Variant 1: Default layout
        (
          <Card className="w-full max-w-sm" key="signup-variant-1">
            <CardHeader>
              <CardTitle>Create your account</CardTitle>
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
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      className="w-full"
                    />
                    <div className="flex justify-start text-xs mt-1">
                      <button type="button" className="underline text-gray-400 hover:text-primary">Already have an account? Sign in</button>
                    </div>
                  </>
                )}
                {selected.includes("google") && (
                  <Button variant="outline" className="w-full">
                    Sign up with Google
                  </Button>
                )}
                {selected.includes("amazon") && (
                  <Button variant="outline" className="w-full">
                    Sign up with Amazon
                  </Button>
                )}
                {selected.includes("apple") && (
                  <Button variant="outline" className="w-full">
                    Sign up with Apple
                  </Button>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit">
                Sign Up
              </Button>
            </CardFooter>
          </Card>
        ),
        // Sign Up Variant 2: Social first
        (
          <Card className="w-full max-w-sm" key="signup-variant-2">
            <CardHeader>
              <CardTitle>Create your account</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4">
                {selected.includes("google") && (
                  <Button variant="outline" className="w-full">
                    Sign up with Google
                  </Button>
                )}
                {selected.includes("amazon") && (
                  <Button variant="outline" className="w-full">
                    Sign up with Amazon
                  </Button>
                )}
                {selected.includes("apple") && (
                  <Button variant="outline" className="w-full">
                    Sign up with Apple
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
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      className="w-full"
                    />
                  </>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" type="submit">
                Sign Up
              </Button>
              <Button className="w-full" type="button" variant="secondary">
                Sign In
              </Button>
            </CardFooter>
          </Card>
        ),
      ];
    } else { // forgot password
      return [
        // Forgot Password Variant 1
        (
          <Card className="w-full max-w-sm" key="forgot-variant-1">
            <CardHeader>
              <CardTitle>Reset your password</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full"
                />
                <div className="flex justify-start text-xs mt-1">
                  <button type="button" className="underline text-gray-400 hover:text-primary">← Back to sign in</button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit">
                Send Reset Code
              </Button>
            </CardFooter>
          </Card>
        ),
        // Forgot Password Variant 2: With description
        (
          <Card className="w-full max-w-sm" key="forgot-variant-2">
            <CardHeader>
              <CardTitle>Forgot your password?</CardTitle>
              <p className="text-sm text-gray-400">Enter your email and we'll send you a reset link</p>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="w-full"
                />
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" type="submit">
                Reset Password
              </Button>
              <Button className="w-full" type="button" variant="outline">
                Back to Sign In
              </Button>
            </CardFooter>
          </Card>
        ),
      ];
    }
  };

  function handleNext() {
    setData?.({ 
      providers: selected,
      passwordPolicy: passwordPolicy
    });
    onNext();
  }

  return (
    <div className="flex gap-8 w-full max-w-4xl mx-auto">
      {/* Left: MultiSelect, always vertically centered */}
      <div className="w-1/3 flex flex-col justify-center min-h-[500px]">
        <div>
          <h3 className="font-semibold mb-4">Authentication Methods</h3>
          <div className="flex flex-col gap-3 mb-6">
            {AUTH_PROVIDERS.map((provider) => (
              <label key={provider.value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selected.includes(provider.value)}
                  onCheckedChange={() => handleToggle(provider.value)}
                />
                <span className="text-sm text-gray-400">{provider.label}</span>
              </label>
            ))}
          </div>
          
          {/* Password Policy Section */}
          <div className="mt-8">
            <h3 className="font-semibold mb-4">Password Policy</h3>
            <div className="space-y-4">
              {/* Min Length Slider */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Min Length: {passwordPolicy.minLength}</div>
                <Slider
                  id="minLength"
                  min={6}
                  max={20}
                  step={1}
                  value={[passwordPolicy.minLength]}
                  onValueChange={(value) => setPasswordPolicy(prev => ({ ...prev, minLength: value[0] }))}
                  className="w-full [&>*:first-child]:bg-gray-400/20 [&>*:first-child>*]:bg-gray-400 [&>*:last-child]:border-gray-400/50"
                />
              </div>
              
              {/* Require Lowercase Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Require lowercase</span>
                <Switch
                  id="requireLowercase"
                  checked={passwordPolicy.requireLowercase}
                  onCheckedChange={(checked) => setPasswordPolicy(prev => ({ ...prev, requireLowercase: checked }))}
                  className="data-[state=checked]:bg-gray-400 data-[state=unchecked]:bg-gray-400/20"
                />
              </div>
              
              {/* Require Uppercase Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Require uppercase</span>
                <Switch
                  id="requireUppercase"
                  checked={passwordPolicy.requireUppercase}
                  onCheckedChange={(checked) => setPasswordPolicy(prev => ({ ...prev, requireUppercase: checked }))}
                  className="data-[state=checked]:bg-gray-400 data-[state=unchecked]:bg-gray-400/20"
                />
              </div>
              
              {/* Require Numbers Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Require numbers</span>
                <Switch
                  id="requireNumbers"
                  checked={passwordPolicy.requireNumbers}
                  onCheckedChange={(checked) => setPasswordPolicy(prev => ({ ...prev, requireNumbers: checked }))}
                  className="data-[state=checked]:bg-gray-400 data-[state=unchecked]:bg-gray-400/20"
                />
              </div>
              
              {/* Require Symbols Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Require symbols</span>
                <Switch
                  id="requireSymbols"
                  checked={passwordPolicy.requireSymbols}
                  onCheckedChange={(checked) => setPasswordPolicy(prev => ({ ...prev, requireSymbols: checked }))}
                  className="data-[state=checked]:bg-gray-400 data-[state=unchecked]:bg-gray-400/20"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            {onBack && <Button variant="ghost" onClick={onBack}>Back</Button>}
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Right: Auth Card Carousel */}
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-6">
          <div className="space-y-4 flex flex-col items-center">
            <h3 className="text-lg font-semibold">Preview</h3>
            
            {/* Tab Toggle */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup" | "forgot")}>
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="forgot">Forgot Password</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Preview Carousel */}
            <Carousel className="w-full max-w-sm">
              <CarouselContent>
                {getCardVariants(activeTab).map((variant, idx) => (
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
      </div>
    </div>
  );
} 
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight, CreditCard, Tag, CreditCard as Paypal, Send } from "lucide-react";

const PAYMENT_METHODS = [
  { label: "Credit Card", value: "credit_card", icon: CreditCard },
  { label: "Coupon Code", value: "coupon", icon: Tag },
  { label: "PayPal", value: "paypal", icon: Paypal },
];

interface Props {
  onNext: () => void;
  onBack: () => void;
  setData?: (data: any) => void;
}

export default function AddPaymentsStep({ onNext, onBack, setData }: Props) {
  const [selected, setSelected] = useState<string[]>(["credit_card"]);

  const handleToggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleContinue = () => {
    setData?.(selected)
    onNext()
  }

  // Example variants for the checkout card
  const cardVariants = [
    // Variant 1: Default layout
    (
      <Card className="w-full max-w-md" key="variant-1">
        <CardHeader>
          <CardTitle>Complete your purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Order Summary</Label>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between">
                  <span>Pro Plan</span>
                  <span>$29/month</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Billed monthly</span>
                </div>
              </div>
            </div>
            
            {selected.includes("coupon") && (
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <div className="flex gap-2">
                  <Input placeholder="Enter coupon code" className="flex-1" />
                  <Button variant="outline" size="sm">Apply</Button>
                </div>
              </div>
            )}

            {selected.includes("credit_card") && (
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="space-y-3">
                  <Input placeholder="Card number" />
                  <div className="flex gap-2">
                    <Input placeholder="MM/YY" />
                    <Input placeholder="CVC" />
                  </div>
                  <Input placeholder="Name on card" />
                </div>
              </div>
            )}

            {selected.includes("paypal") && (
              <Button variant="outline" className="w-full">
                <Paypal className="mr-2 h-4 w-4" />
                Pay with PayPal
              </Button>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit">
            Pay $29.00
          </Button>
        </CardFooter>
      </Card>
    ),
    // Variant 2: PayPal first, then credit card
    (
      <Card className="w-full max-w-md" key="variant-2">
        <CardHeader>
          <CardTitle>Complete your purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Order Summary</Label>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between">
                  <span>Pro Plan</span>
                  <span>$29/month</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Billed monthly</span>
                </div>
              </div>
            </div>

            {selected.includes("paypal") && (
              <Button variant="outline" className="w-full">
                <Paypal className="mr-2 h-4 w-4" />
                Pay with PayPal
              </Button>
            )}

            {selected.includes("coupon") && (
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <div className="flex gap-2">
                  <Input placeholder="Enter coupon code" className="flex-1" />
                  <Button variant="outline" size="sm">Apply</Button>
                </div>
              </div>
            )}

            {selected.includes("credit_card") && (
              <div className="space-y-2">
                <Label>Or pay with card</Label>
                <div className="space-y-3">
                  <Input placeholder="Card number" />
                  <div className="flex gap-2">
                    <Input placeholder="MM/YY" />
                    <Input placeholder="CVC" />
                  </div>
                  <Input placeholder="Name on card" />
                </div>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit">
            Pay $29.00
          </Button>
        </CardFooter>
      </Card>
    ),
    // Variant 3: Minimal layout
    (
      <Card className="w-full max-w-md" key="variant-3">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">$29.00</div>
              <div className="text-sm text-muted-foreground">Pro Plan - Monthly</div>
            </div>

            {selected.includes("coupon") && (
              <Input placeholder="Coupon code (optional)" />
            )}

            {selected.includes("credit_card") && (
              <div className="space-y-3">
                <Input placeholder="Card number" />
                <div className="flex gap-2">
                  <Input placeholder="MM/YY" />
                  <Input placeholder="CVC" />
                </div>
              </div>
            )}

            {selected.includes("paypal") && (
              <Button variant="outline" className="w-full">
                <Paypal className="mr-2 h-4 w-4" />
                PayPal
              </Button>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit">
            Complete Purchase
          </Button>
        </CardFooter>
      </Card>
    ),
  ];

  return (
    <div className="flex gap-8 w-full max-w-4xl mx-auto">
      {/* Left: Payment Method Selection, always vertically centered */}
      <div className="w-1/3 flex flex-col justify-center min-h-[500px]">
        <div>
          <h3 className="font-semibold mb-4">Payment Methods</h3>
          <div className="flex flex-col gap-3 mb-6">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <label key={method.value} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-muted">
                  <Checkbox
                    checked={selected.includes(method.value)}
                    onCheckedChange={() => handleToggle(method.value)}
                  />
                  <Icon className="h-4 w-4" />
                  <span>{method.label}</span>
                </label>
              );
            })}
          </div>
          <Button onClick={handleContinue} className="w-full mt-2" size="lg">
            <Send className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>
      {/* Right: Checkout Card Carousel */}
      <div className="flex-1 flex items-center justify-center">
        <Carousel className="w-full max-w-md">
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
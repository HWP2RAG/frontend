import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PricingPlan } from "@/lib/pricing-data";

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <Card
      className={`relative flex flex-col ${
        plan.highlighted
          ? "border-primary shadow-lg ring-1 ring-primary"
          : ""
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-white">{plan.badge}</Badge>
        </div>
      )}
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        <p className="text-sm text-muted">{plan.description}</p>
        <div className="mt-3">
          <span className="text-3xl font-bold">{plan.price}</span>
          {plan.period && (
            <span className="text-sm text-muted">{plan.period}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-4">
        <ul className="flex flex-col gap-2 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <Button
          asChild
          className={
            plan.highlighted
              ? "w-full bg-primary hover:bg-primary-dark text-white"
              : "w-full"
          }
          variant={plan.highlighted ? "default" : "outline"}
        >
          <Link href={plan.ctaHref}>{plan.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

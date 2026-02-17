"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/pricing-data";

interface PricingFaqProps {
  faqs: FaqItem[];
}

export function PricingFaq({ faqs }: PricingFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-border rounded-lg">
          <button
            className="flex w-full items-center justify-between p-4 text-left text-sm font-medium hover:bg-primary-50/50 transition-colors"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {faq.question}
            <svg
              className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                openIndex === i ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4 text-sm text-muted">{faq.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}

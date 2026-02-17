import { PricingCard } from "@/components/pricing-card";
import { PricingFaq } from "@/components/pricing-faq";
import { pricingPlans, pricingFaqs } from "@/lib/pricing-data";

export default function PricingPage() {
  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-6xl flex flex-col gap-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            투명한 요금제
          </h1>
          <p className="text-muted">
            프로젝트 규모에 맞는 플랜을 선택하세요
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto w-full">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-center">
            자주 묻는 질문
          </h2>
          <PricingFaq faqs={pricingFaqs} />
        </div>
      </div>
    </main>
  );
}

import { PricingCard } from "@/components/pricing-card";
import { PricingFaq } from "@/components/pricing-faq";
import { pricingTracks, pricingFaqs } from "@/lib/pricing-data";

export default function PricingPage() {
  return (
    <main className="flex flex-col items-center p-8 flex-1">
      <div className="w-full max-w-6xl flex flex-col gap-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            투명한 요금제
          </h1>
          <p className="text-muted">
            프로젝트 규모와 요구사항에 맞는 트랙을 선택하세요
          </p>
        </div>

        {/* 3-Track Sections */}
        {pricingTracks.map((track) => (
          <section key={track.track} className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                {track.track}
              </h2>
              <p className="text-muted mt-1 max-w-2xl mx-auto">
                {track.description}
              </p>
            </div>

            <div
              className={`grid gap-6 ${
                track.plans.length >= 3
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : track.plans.length === 2
                    ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
                    : "grid-cols-1 max-w-md mx-auto"
              }`}
            >
              {track.plans.map((plan) => (
                <PricingCard key={plan.name} plan={plan} />
              ))}
            </div>
          </section>
        ))}

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

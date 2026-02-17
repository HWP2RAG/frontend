import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import { FeatureSection } from "@/components/feature-section";
import { BeforeAfterSection } from "@/components/before-after-section";

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      <HeroSection />
      <FeatureSection />
      <BeforeAfterSection />

      {/* Social Proof */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">10,000+</div>
            <div className="text-sm text-muted mt-1">문서 변환 완료</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted mt-1">서비스 가동률</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">&lt;3초</div>
            <div className="text-sm text-muted mt-1">평균 변환 속도</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-primary-50/30 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-3">
          지금 무료로 시작하기
        </h2>
        <p className="text-muted mb-6 max-w-md mx-auto">
          회원가입 없이, 하루 5회까지 무료로 HWP 문서를 변환하세요.
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-white shadow-md">
          <Link href="/convert">변환하기</Link>
        </Button>
      </section>
    </main>
  );
}

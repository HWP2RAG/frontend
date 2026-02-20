import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "3가지 출력 포맷",
    description:
      "Markdown, JSON, RAG-JSON 등 AI 파이프라인에 최적화된 포맷으로 변환합니다.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
    ),
  },
  {
    title: "구조 보존",
    description:
      "표, 이미지, 수식 등 복잡한 HWP 문서 구조를 정보 손실 없이 보존합니다.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /></svg>
    ),
  },
  {
    title: "SDK & API",
    description:
      "Python SDK와 REST API로 기존 워크플로우에 쉽게 통합할 수 있습니다.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    ),
  },
  {
    title: "대용량 처리",
    description:
      "최대 100MB 파일, 청크 업로드로 대규모 문서도 안정적으로 변환합니다.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    ),
  },
];

const targets = [
  {
    title: "대학원생",
    description: "논문, 보고서 등 학술 문서를 AI 분석에 활용",
    stat: "40%",
    statLabel: "학술 문서",
  },
  {
    title: "리걸테크",
    description: "법률 문서의 체계적 디지털 변환 및 검색",
    stat: "25%",
    statLabel: "법률 문서",
  },
  {
    title: "AI 스타트업",
    description: "한국어 HWP 데이터를 LLM 학습/RAG에 활용",
    stat: "20%",
    statLabel: "AI 데이터",
  },
  {
    title: "공공기관",
    description: "전자 문서 아카이브의 AI 친화적 변환",
    stat: "15%",
    statLabel: "공공 문서",
  },
];

const methodology = [
  { step: "목표 기반 계획", description: "Goal-backward planning", num: "01" },
  { step: "구조화된 실행", description: "Phase-based delivery", num: "02" },
  { step: "원자적 커밋", description: "Atomic commits", num: "03" },
  { step: "자동 검증", description: "Automated verification", num: "04" },
  { step: "지속적 통합", description: "Continuous integration", num: "05" },
];

const team = [
  {
    name: "ahwlsqja",
    role: "코어 엔진 & 백엔드",
    description: "HWP 바이너리 파서, NestJS 서버 개발",
    github: "https://github.com/ahwlsqja",
    tags: ["HWP Parser", "NestJS", "TypeScript"],
  },
  {
    name: "HoonilP",
    role: "프론트엔드",
    description: "Next.js 웹앱, UI/UX 설계 및 개발",
    github: "https://github.com/HoonilP",
    tags: ["Next.js", "React", "UI/UX"],
  },
];

const globalMarkets = [
  { region: "한국", description: "HWP 네이티브 시장 — 공공기관, 교육, 법률 분야 집중 공략", status: "Active" },
  { region: "일본", description: "일본 관공서의 HWP 호환 문서 처리 수요 대응", status: "Planning" },
  { region: "동남아시아", description: "한국 기업 진출 지역의 HWP 문서 변환 니즈 확보", status: "Planning" },
  { region: "글로벌", description: "다국어 문서 포맷 변환으로 서비스 확장", status: "Roadmap" },
];

export default function AboutPage() {
  return (
    <main className="flex flex-col flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden py-28 px-4 bg-primary-50/30">
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="text-sm px-4 py-1 mb-6">
            About Us
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="text-primary">HWPtoRAG</span> 소개
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            한국의 문서를 세계의 AI로 연결합니다.
            <br className="hidden md:block" />
            HWP 문서를 AI/RAG 파이프라인에 최적화된 형태로 변환하는 서비스입니다.
          </p>
        </div>
      </section>

      {/* Mission — Large statement */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-4">
            Our Mission
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug mb-6">
            HWP는 한국에서 가장 많이 사용되는 문서 형식이지만,{" "}
            <span className="text-muted">
              AI/LLM 파이프라인에서 직접 처리할 수 없습니다.
            </span>
          </h2>
          <p className="text-muted leading-relaxed max-w-3xl">
            HWPtoRAG는 이 갭을 메웁니다. HWP 바이너리를 직접 파싱하여
            Markdown, JSON, RAG-JSON으로 변환하고, 표/이미지/수식 구조를
            보존합니다. 웹 기반 변환기와 Python SDK, 두 가지 제품을 제공하여
            누구나 쉽게 HWP 데이터를 AI에 활용할 수 있습니다.
          </p>
        </div>
      </section>

      {/* Problem & Solution — Side-by-side */}
      <section className="py-24 px-4 bg-primary-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">
              Problem & Solution
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              문제를 정의하고, 해결합니다
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-border bg-surface p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                </div>
                <h3 className="text-lg font-bold">문제</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-red-400 shrink-0">—</span>
                  HWP 파일은 AI/LLM 파이프라인에서 직접 처리 불가
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 shrink-0">—</span>
                  기존 변환 도구의 서식 손실 및 구조 파괴
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 shrink-0">—</span>
                  표, 이미지, 수식 등 복합 레이아웃 미지원
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 shrink-0">—</span>
                  개발자 친화적 API/SDK 부재
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-surface p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <h3 className="text-lg font-bold">해결</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">—</span>
                  HWP 바이너리 직접 파싱으로 정확한 변환
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">—</span>
                  Markdown, JSON, RAG-JSON 출력 지원
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">—</span>
                  표, 이미지, 수식 구조 완벽 보존
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">—</span>
                  Python SDK + REST API 즉시 연동
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features — Grid with icons */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">
              Features
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              주요 기능
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 bg-surface hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center mb-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Market — Cards with stats */}
      <section className="py-24 px-4 bg-primary-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">
              Market
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              타겟 고객
            </h2>
            <p className="text-muted mt-3">
              다양한 산업 분야에서 HWPtoRAG를 활용합니다
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {targets.map((target) => (
              <Card key={target.title} className="bg-surface border-border/50 hover:border-primary/30 transition-colors overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="text-3xl font-bold text-primary mb-1">{target.stat}</div>
                  <p className="text-xs text-muted">{target.statLabel}</p>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-2">{target.title}</CardTitle>
                  <p className="text-sm text-muted leading-relaxed">{target.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Expansion */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">
              Global
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              글로벌 확장
            </h2>
            <p className="text-muted mt-3 max-w-2xl mx-auto">
              한국에서 시작하여 아시아, 그리고 글로벌로 — HWP 문서 변환의 표준을 만들어갑니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {globalMarkets.map((market) => (
              <div key={market.region} className="group flex gap-5 rounded-2xl border border-border/50 bg-surface p-6 hover:border-primary/30 transition-colors">
                <div className="shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold">{market.region}</h3>
                    <Badge
                      variant={market.status === "Active" ? "default" : "secondary"}
                      className="text-[10px] px-2 py-0"
                    >
                      {market.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{market.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology — Numbered steps */}
      <section className="py-24 px-4 bg-primary-50/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">
              How We Work
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              개발 방법론
            </h2>
            <p className="text-muted mt-3">
              GSD (Goal &rarr; Structure &rarr; Deliver) 프레임워크
            </p>
          </div>
          <div className="space-y-0 max-w-2xl mx-auto">
            {methodology.map((item) => (
              <div key={item.step} className="group flex gap-6 py-5 border-b border-border/50 last:border-0">
                <span className="text-3xl font-bold text-primary/30 group-hover:text-primary transition-colors tabular-nums">
                  {item.num}
                </span>
                <div className="pt-1">
                  <div className="font-semibold mb-0.5">{item.step}</div>
                  <div className="text-sm text-muted">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">
              Team
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              팀 소개
            </h2>
            <p className="text-muted mt-3">HWPtoRAG를 만드는 사람들</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="rounded-2xl border border-border/50 bg-surface p-8 hover:border-primary/30 transition-colors">
                <Link href={member.github} target="_blank" rel="noopener noreferrer" className="text-lg font-bold hover:text-primary transition-colors">
                  @{member.name}
                </Link>
                <p className="text-sm text-primary font-medium mt-1 mb-3">{member.role}</p>
                <p className="text-sm text-muted leading-relaxed mb-4">{member.description}</p>
                <div className="flex flex-wrap gap-2">
                  {member.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-primary-50/30 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            지금 시작하세요
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto leading-relaxed">
            HWP 문서를 변환하거나, GitHub에서 프로젝트에 기여하세요.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary-dark text-white shadow-md"
            >
              <Link href="/convert">변환하기</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link
                href="https://github.com/HWP2RAG"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

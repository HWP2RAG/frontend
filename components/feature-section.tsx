import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "다양한 출력 형식",
    description: "Markdown, JSON, Plain Text, RAG-JSON 등 AI 파이프라인에 적합한 포맷으로 변환합니다.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
    ),
  },
  {
    title: "표 & 이미지 인식",
    description: "HWP의 복잡한 표, 수식, 이미지를 구조적으로 파싱하여 정보 손실 없이 변환합니다.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /></svg>
    ),
  },
  {
    title: "빠른 API 연동",
    description: "Python SDK와 REST API로 기존 워크플로우에 쉽게 통합할 수 있습니다.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    ),
  },
  {
    title: "대용량 처리",
    description: "최대 100MB 파일, 청크 업로드, 배치 처리로 대규모 문서도 안정적으로 변환합니다.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    ),
  },
];

export function FeatureSection() {
  return (
    <section className="py-16 px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          왜 HWPtoRAG인가요?
        </h2>
        <p className="text-muted">
          HWP 문서 처리에 최적화된 기능을 제공합니다
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {features.map((feature) => (
          <Card key={feature.title} className="text-center">
            <CardHeader className="pb-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary mb-2">
                {feature.icon}
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
  ctaHref: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Community",
    price: "무료",
    description: "개인 사용자를 위한 기본 플랜",
    features: [
      "하루 5회 변환",
      "기본 Markdown 출력",
      "최대 10MB 파일",
      "웹 변환기 이용",
    ],
    cta: "무료로 시작",
    ctaHref: "/convert",
  },
  {
    name: "Pro",
    price: "$14.99",
    period: "/월",
    description: "전문가를 위한 고급 변환",
    features: [
      "무제한 웹 변환",
      "표 심화 인식",
      "4개 출력 포맷",
      "최대 50MB 파일",
      "우선 처리",
    ],
    highlighted: true,
    badge: "추천",
    cta: "Pro 시작하기",
    ctaHref: "/convert",
  },
  {
    name: "Developer",
    price: "$29",
    period: "/월",
    description: "개발자를 위한 API 접근",
    features: [
      "5,000 pages/월",
      "Python SDK",
      "API Key 발급",
      "최대 100MB 파일",
      "웹훅 지원",
    ],
    cta: "Developer 시작",
    ctaHref: "/docs/getting-started",
  },
  {
    name: "Business",
    price: "$199",
    period: "/월",
    description: "팀과 기업을 위한 대량 처리",
    features: [
      "50,000 pages/월",
      "배치 처리",
      "팀 관리",
      "SLA 99.9%",
      "전담 지원",
    ],
    cta: "Business 시작",
    ctaHref: "/convert",
  },
  {
    name: "Enterprise",
    price: "문의",
    description: "맞춤형 온프레미스 솔루션",
    features: [
      "무제한 처리",
      "온프레미스 배포",
      "데이터 비식별화",
      "전용 인프라",
      "맞춤 SLA",
    ],
    cta: "영업팀 문의",
    ctaHref: "mailto:sales@hwptorag.com",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const pricingFaqs: FaqItem[] = [
  {
    question: "무료 플랜의 사용 제한은 어떻게 되나요?",
    answer: "Community 플랜은 하루 5회까지 무료로 변환할 수 있습니다. 매일 자정(KST)에 사용량이 초기화됩니다.",
  },
  {
    question: "결제 수단은 무엇을 지원하나요?",
    answer: "신용카드(Visa, Mastercard, AMEX)와 계좌이체를 지원합니다. Enterprise 플랜은 청구서 결제도 가능합니다.",
  },
  {
    question: "플랜을 변경하거나 취소할 수 있나요?",
    answer: "언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 취소 시 현재 결제 주기가 끝날 때까지 서비스를 이용할 수 있습니다.",
  },
  {
    question: "환불 정책은 어떻게 되나요?",
    answer: "결제 후 7일 이내에 환불을 요청할 수 있습니다. 부분 환불은 지원하지 않습니다.",
  },
];

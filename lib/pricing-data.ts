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

export interface PricingTrack {
  track: string;
  description: string;
  plans: PricingPlan[];
}

export const pricingTracks: PricingTrack[] = [
  {
    track: "SaaS API",
    description:
      "클라우드 기반 API로 즉시 시작하세요. 규모에 맞는 플랜을 선택할 수 있습니다.",
    plans: [
      {
        name: "Free",
        price: "무료",
        description: "개인 사용자 및 프로토타이핑",
        features: [
          "500 pages/월",
          "기본 Markdown 출력",
          "웹 변환기 이용",
          "커뮤니티 지원",
        ],
        cta: "무료로 시작",
        ctaHref: "/convert",
      },
      {
        name: "Pro",
        price: "$29",
        period: "/월",
        description: "전문가를 위한 고급 변환 API",
        features: [
          "10,000 pages/월",
          "Python SDK + REST API",
          "표 심화 인식 (rowspan/colspan)",
          "4개 출력 포맷",
          "우선 처리 큐",
          "이메일 지원",
        ],
        highlighted: true,
        badge: "추천",
        cta: "Pro 시작하기",
        ctaHref: "/docs/getting-started",
      },
      {
        name: "Business",
        price: "$199",
        period: "/월",
        description: "팀과 기업을 위한 대량 처리",
        features: [
          "100,000 pages/월",
          "배치 처리 API",
          "팀 관리 (5 시트 포함)",
          "멀티 벡터DB 지원",
          "SLA 99.9%",
          "전담 슬랙 지원",
        ],
        cta: "Business 시작",
        ctaHref: "/docs/getting-started",
      },
    ],
  },
  {
    track: "Enterprise License",
    description:
      "온프레미스 배포가 필요한 기업을 위한 라이선스. 데이터가 외부로 나가지 않습니다.",
    plans: [
      {
        name: "Enterprise",
        price: "문의",
        description: "맞춤형 온프레미스 솔루션",
        features: [
          "무제한 처리량",
          "온프레미스 / VPC 배포",
          "데이터 비식별화 파이프라인",
          "전용 인프라 + GPU 지원",
          "맞춤 SLA + 전담 엔지니어",
          "소스코드 에스크로 가능",
        ],
        cta: "영업팀 문의",
        ctaHref: "mailto:contact@hwptorag.com",
      },
    ],
  },
  {
    track: "Public Projects",
    description:
      "오픈소스 및 학술 프로젝트를 위한 특별 지원. 한국어 NLP 연구를 응원합니다.",
    plans: [
      {
        name: "Academic",
        price: "무료/할인",
        description: "오픈소스 및 학술 연구",
        features: [
          "오픈소스 프로젝트 무료",
          "학술 연구 50% 할인",
          ".ac.kr / .edu 이메일 인증",
          "논문 인용 시 추가 혜택",
          "연구 데이터셋 제공",
          "기술 자문 지원",
        ],
        cta: "신청하기",
        ctaHref: "mailto:academic@hwptorag.com",
      },
    ],
  },
];

// Backward compat: flat list of all plans across tracks
export const pricingPlans: PricingPlan[] = pricingTracks.flatMap(
  (t) => t.plans
);

export interface FaqItem {
  question: string;
  answer: string;
}

export const pricingFaqs: FaqItem[] = [
  {
    question: "무료 플랜의 사용 제한은 어떻게 되나요?",
    answer:
      "Free 플랜은 월 500페이지까지 무료로 변환할 수 있습니다. 매월 1일에 사용량이 초기화됩니다.",
  },
  {
    question: "결제 수단은 무엇을 지원하나요?",
    answer:
      "신용카드(Visa, Mastercard, AMEX)와 계좌이체를 지원합니다. Enterprise 플랜은 청구서 결제도 가능합니다.",
  },
  {
    question: "플랜을 변경하거나 취소할 수 있나요?",
    answer:
      "언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 취소 시 현재 결제 주기가 끝날 때까지 서비스를 이용할 수 있습니다.",
  },
  {
    question: "Enterprise 라이선스와 SaaS API의 차이는 무엇인가요?",
    answer:
      "SaaS API는 클라우드에서 바로 사용하는 방식이고, Enterprise License는 고객사 서버에 직접 설치하는 방식입니다. 데이터 보안이 중요한 기관에 Enterprise를 권장합니다.",
  },
  {
    question: "Academic 플랜 신청 조건은 무엇인가요?",
    answer:
      "ac.kr 또는 .edu 이메일로 인증된 연구자, 또는 GitHub에 공개된 오픈소스 프로젝트에 적용됩니다. 신청 후 1-2일 내 승인됩니다.",
  },
];

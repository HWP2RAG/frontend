const API_BASE_URLS = {
  mock: "http://localhost:3000",
  real: process.env.NEXT_PUBLIC_API_URL || "https://api.hwptorag.com",
} as const;

type ApiMode = keyof typeof API_BASE_URLS;

const mode = (process.env.NEXT_PUBLIC_API_MODE || "mock") as ApiMode;

export const API_BASE_URL = API_BASE_URLS[mode];

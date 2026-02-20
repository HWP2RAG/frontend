import Link from "next/link";
import Image from "next/image";

type FooterLink = { href: string; label: string };

const footerLinks: Record<string, FooterLink[]> = {
  service: [
    { href: "/convert", label: "변환하기" },
    // MVP hidden: { href: "/pricing", label: "가격" },
  ],
  developer: [
    // MVP hidden: { href: "/docs/getting-started", label: "시작 가이드" },
    // MVP hidden: { href: "/docs/api", label: "API 레퍼런스" },
  ],
  company: [
    { href: "https://github.com/HWP2RAG", label: "GitHub" },
    { href: "mailto:support@hwptorag.com", label: "문의하기" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/logo.png" alt="HWPtoRAG" width={28} height={28} />
              <span className="text-sm font-bold">
                HWPto<span className="text-primary">RAG</span>
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              HWP 문서를 AI/RAG 파이프라인에
              <br />
              적합한 형태로 변환합니다.
            </p>
          </div>

          {/* Service */}
          <div>
            <h4 className="text-sm font-semibold mb-3">서비스</h4>
            <ul className="space-y-2">
              {footerLinks.service.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer */}
          {footerLinks.developer.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">개발자</h4>
              <ul className="space-y-2">
                {footerLinks.developer.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-3">회사</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>&copy; 2025 HWPtoRAG. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

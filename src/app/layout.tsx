import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Parisienne } from "next/font/google";
import { weddingConfig } from "@/config/wedding";
import "./globals.css";
import "./hero-scroll.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const parisienne = Parisienne({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-parisienne",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: weddingConfig.metadata.title,
    template: `%s — ${weddingConfig.couple.displayName}`,
  },
  description: weddingConfig.metadata.description,
  openGraph: {
    title: weddingConfig.metadata.title,
    description: weddingConfig.metadata.description,
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: weddingConfig.metadata.ogImage,
        width: 1200,
        height: 630,
        alt: weddingConfig.couple.displayName,
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F3EA",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${cormorant.variable} ${parisienne.variable} h-full`}
    >
      <body className="min-h-full bg-ivory text-ink antialiased">
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}

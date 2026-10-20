import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Outfit, Source_Serif_4 } from "next/font/google";
import { AppProviders } from "@/context/app-context";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sponsorsnap.app"),
  title: {
    default: "SponsorSnap — Your creator profile. Ready for brands.",
    template: "%s · SponsorSnap",
  },
  description:
    "Create a professional media kit in the browser. Add your stats, packages and rates, preview instantly, and export a PDF. Data stays on your device.",
  keywords: ["media kit", "creator", "influencer", "sponsorship", "PDF", "privacy"],
  authors: [{ name: "SponsorSnap" }],
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  openGraph: {
    title: "SponsorSnap",
    description: "Your creator profile. Ready for brands.",
    type: "website",
    images: [{ url: "/og.jpg", width: 1376, height: 768, alt: "SponsorSnap media kit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SponsorSnap",
    description: "Your creator profile. Ready for brands.",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

const themeScript = `try{var s=JSON.parse(localStorage.getItem("sponsorsnap.settings")||"{}");var t=s.theme||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");if(s.language)document.documentElement.lang=s.language;}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <AppProviders>
          <noscript>
            <p className="p-4 text-center">SponsorSnap needs JavaScript to edit media kits in your browser.</p>
          </noscript>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

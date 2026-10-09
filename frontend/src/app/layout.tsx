import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import Script from "next/script";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  // Marked as a clone so the public demo is never mistaken for duolingo.com.
  title: "Duolingo Clone",
  description: "Learn Spanish with bite-sized lessons, streaks, XP and hearts.",
};

export const viewport: Viewport = {
  themeColor: "#58cc02",
  width: "device-width",
  initialScale: 1,
};

// Applies the saved theme before first paint to avoid a light/dark flash.
// Like Duolingo, the default follows the operating system theme.
const themeScript = `try{var t=localStorage.getItem("theme")||"system";if(t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Fetch the loading-screen Duo immediately so it shows on the first paint. */}
        <link rel="preload" href="/duo-cdn/lottie/pathCharacters/9eaf4990aaf1c6a96ea3960cf159c787.json" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full">
        {/* Inline + beforeInteractive: runs before hydration without React's "script tag in component" warning. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

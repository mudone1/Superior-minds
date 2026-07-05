import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// iOS only shows a splash screen when the image's pixel dimensions exactly
// match the device's (CSS px * DPR). Each entry below targets one device
// class in portrait orientation.
const APPLE_SPLASH_SCREENS: Array<{ url: string; media: string }> = [
  {
    url: "/splash/iphone-se.png",
    media:
      "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    url: "/splash/iphone-xr-11.png",
    media:
      "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    url: "/splash/iphone-x-11pro.png",
    media:
      "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    url: "/splash/iphone-xsmax-11promax.png",
    media:
      "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    url: "/splash/iphone-12-14.png",
    media:
      "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    url: "/splash/iphone-12-13-promax-14plus.png",
    media:
      "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    url: "/splash/iphone-14pro-15-16.png",
    media:
      "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    url: "/splash/iphone-14-15-16-promax.png",
    media:
      "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    url: "/splash/ipad-9.7.png",
    media:
      "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    url: "/splash/ipad-10.2.png",
    media:
      "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    url: "/splash/ipad-pro-11.png",
    media:
      "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    url: "/splash/ipad-pro-12.9.png",
    media:
      "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
];

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://superior-minds.vercel.app"),
  title: "Superior Minds Academy — Minna, Nigeria",
  description:
    "Superior Minds Academy is a premier nursery and primary school in Minna, Nigeria, combining academic excellence, character development and modern teaching methods to prepare every child for lifelong success.",
  keywords: [
    "Superior Minds Academy",
    "Minna school",
    "Nigeria primary school",
    "Nigeria nursery school",
    "best private school Minna",
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "Superior Minds Academy — Minna, Nigeria",
    description:
      "Where excellence begins, character grows, and every child is inspired to achieve greatness.",
    url: "https://superior-minds.vercel.app",
    siteName: "Superior Minds Academy",
    images: [{ url: "/images/marketing/hero-future-doctor.jpg", width: 1280, height: 720 }],
    locale: "en_NG",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icons/apple-touch-icon-152.png", sizes: "152x152" },
      { url: "/icons/apple-touch-icon-167.png", sizes: "167x167" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Superior Minds",
    statusBarStyle: "black-translucent",
    startupImage: APPLE_SPLASH_SCREENS,
  },
  // `appleWebApp.capable` only emits the modern `mobile-web-app-capable`
  // meta tag. Safari on iOS still relies on the legacy Apple-prefixed tag
  // to treat the site as a standalone app (without it, splash screens and
  // standalone launch can silently stop working), so it's added explicitly.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A5F",
  width: "device-width",
  initialScale: 1,
  // Lets content extend into the safe areas on notched iPhones/iPads when
  // launched from the home screen, instead of leaving black bars.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} ${jakarta.variable}`}>
      <body className="font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

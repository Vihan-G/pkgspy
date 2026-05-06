import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "pkgspy — visualize any npm package's dependency tree",
  description:
    "Type any npm package name. See its full dependency tree as an interactive force graph. Bundle sizes, transitive deps, all of it — drill down infinitely.",
  metadataBase: new URL("https://pkgspy.vercel.app"),
  openGraph: {
    title: "pkgspy — npm dependency visualizer",
    description:
      "Visualize any npm package's full dependency tree as an interactive force graph.",
    url: "https://pkgspy.vercel.app",
    siteName: "pkgspy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "pkgspy — npm dependency visualizer",
    description:
      "Visualize any npm package's full dependency tree as an interactive force graph.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#fafafa]">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Krisandi Dashboard Apps",
  description: "App launcher portal for web and local apps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background">
          <Header />
          <main className="flex-1 container py-6">{children}</main>
          <footer className="border-t py-4">
            <div className="container text-center text-sm text-muted-foreground">
              Krisandi Dashboard Apps — Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">n</kbd> to add,{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">/</kbd> to search
            </div>
          </footer>
        </div>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}

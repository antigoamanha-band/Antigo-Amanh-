import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Antigo Amanhã",
  description: "Site oficial da banda Antigo Amanhã.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

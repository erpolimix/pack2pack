import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Pack2Pack - Marketplace P2P de Productos Entre Vecinos",
  description: "Compra y vende packs de productos excedentes en tu comunidad. Alimentos, ropa, libros, juguetes y más. Ahorra dinero y ayuda al planeta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(plusJakartaSans.variable, "min-h-screen bg-background font-sans antialiased flex flex-col")} suppressHydrationWarning>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}

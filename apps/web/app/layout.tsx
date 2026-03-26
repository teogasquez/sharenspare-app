import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/lib/toast-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { NotificationPoller } from "@/components/notification-poller";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShareNSpare - Location de materiel evenementiel",
  description: "Plateforme de location et de partage de materiel evenementiel en Suisse",
  icons: { icon: "/mascotte.webp" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} antialiased font-sans`}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Navbar />
              <NotificationPoller />
              <main className="pt-16">{children}</main>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

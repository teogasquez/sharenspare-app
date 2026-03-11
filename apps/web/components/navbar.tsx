"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, useRef } from "react";
import { LogOut, User, Menu, X } from "lucide-react";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handler = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      setVisible(currentY <= 20 || currentY < lastScrollY.current);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (path: string) => pathname === path;

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        isActive(href) ? "text-orange-accent font-bold" : "text-gray-700 hover:text-green-primary"
      }`}
      onClick={() => setMobileOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <header className={`fixed left-0 w-full z-50 px-5 transition-all duration-300 ${visible ? "top-5 opacity-100" : "-top-20 opacity-0"}`}>
      <div className={`mx-auto max-w-7xl rounded-full transition-all duration-300 backdrop-blur-sm shadow-lg ${scrolled ? "bg-white/90 py-2" : "bg-white/80 py-3"}`}>
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image src="/mascotte.webp" alt="ShareNSpare" width={40} height={40} className="h-10 w-auto" />
              <div className="flex flex-col">
                <div className="flex">
                  <span className="text-xl font-bold text-green-primary">Share</span>
                  <span className="text-xl font-bold text-orange-accent">N</span>
                  <span className="text-xl font-bold text-green-primary">Spare</span>
                </div>
                <span className="text-[10px] text-orange-accent/70 -mt-1">Do more with less</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {user && user.role !== "Admin" && navLink("/catalogue", "Catalogue")}
              {user && navLink("/dashboard", "Dashboard")}
              {user && user.role !== "Admin" && navLink("/equipments", "Mes équipements")}
              {user && user.role !== "Admin" && navLink("/reservations", "Réservations")}
              {user?.role === "Admin" && navLink("/admin", "Admin")}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {loading ? null : user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard" className="flex items-center gap-2 bg-[rgba(0,97,58,0.08)] text-green-primary hover:bg-[rgba(0,97,58,0.15)] py-2 px-4 rounded-full text-sm font-semibold transition-colors">
                    <User className="w-4 h-4" />{user.firstName}
                  </Link>
                  <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors p-2" title="Déconnexion">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-green-primary hover:text-green-darker text-sm font-semibold transition-colors">
                    Connexion
                  </Link>
                  <Link href="/demande-acces" className="bg-green-primary text-white hover:bg-green-darker py-2 px-5 rounded-full text-sm font-semibold transition-colors">
                    Demander un accès
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm shadow-lg mt-2 rounded-xl mx-0 absolute w-full left-0 px-5">
          <div className="px-4 py-4 space-y-3">
            {user && user.role !== "Admin" && navLink("/catalogue", "Catalogue")}
            {user && user.role !== "Admin" && navLink("/equipments", "Mes équipements")}
            {user && user.role !== "Admin" && navLink("/reservations", "Réservations")}
            {user && user.role !== "Admin" && navLink("/dashboard", "Dashboard")}
            {user?.role === "Admin" && navLink("/admin", "Admin")}
            <hr className="my-2" />
            {user ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-red-500 text-sm font-medium">
                Déconnexion
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-green-primary text-sm font-semibold">Connexion</Link>
                <Link href="/demande-acces" onClick={() => setMobileOpen(false)} className="bg-green-primary text-white py-2 px-5 rounded-full text-sm font-semibold text-center">Demander un accès</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

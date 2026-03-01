"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, User, LayoutDashboard, Package, CalendarCheck, ShieldCheck } from "lucide-react";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (path: string) => pathname === path;

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        isActive(href) ? "text-[#00613a] font-bold" : "text-gray-700 hover:text-[#00613a]"
      }`}
      onClick={() => setMobileOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className={`${scrolled ? "bg-white shadow-lg" : "bg-white"} transition-all`}>
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-[#00613a]">
            Share<span className="text-[#D17034]">N</span>Spare
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
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-[rgba(0,97,58,0.08)] text-[#00613a] hover:bg-[rgba(0,97,58,0.15)] py-2 px-4 rounded-full text-sm font-semibold transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user.firstName}
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-500 transition-colors p-2"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#00613a] hover:text-[#005131] text-sm font-semibold transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-[#00613a] text-white hover:bg-[#005131] py-2 px-5 rounded-full text-sm font-semibold transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 space-y-3">
            {user && user.role !== "Admin" && navLink("/catalogue", "Catalogue")}
            {user && navLink("/dashboard", "Dashboard")}
            {user && user.role !== "Admin" && navLink("/equipments", "Mes équipements")}
            {user && user.role !== "Admin" && navLink("/reservations", "Réservations")}
            {user?.role === "Admin" && navLink("/admin", "Admin")}
            <hr className="my-2" />
            {user ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-red-500 text-sm font-medium">
                Déconnexion
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-[#00613a] text-sm font-semibold">Connexion</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="bg-[#00613a] text-white py-2 px-5 rounded-full text-sm font-semibold text-center">Inscription</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

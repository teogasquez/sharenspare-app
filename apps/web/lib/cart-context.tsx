"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface CartItem {
  equipmentId: string;
  name: string;
  primaryPhotoUrl?: string;
  dailyPrice: number;
  startDate: string;
  endDate: string;
  quantity: number;
  maxQuantity: number;
  days: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (equipmentId: string) => void;
  clear: () => void;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "sns_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addItem = (item: CartItem) => {
    persist([...items.filter(i => i.equipmentId !== item.equipmentId), item]);
  };

  const removeItem = (equipmentId: string) => {
    persist(items.filter(i => i.equipmentId !== equipmentId));
  };

  const clear = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

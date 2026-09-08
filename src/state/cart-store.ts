import { create } from 'zustand';

export type CartItem = {
  itemCode: string;
  itemName: string;
  itemImage?: string;
  rate: number;
  quantity: number;
  comment: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'comment'> & { quantity?: number; comment?: string }) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const comment = item.comment ?? '';
      const quantity = item.quantity ?? 1;
      const existingIndex = state.items.findIndex(
        (i) => i.itemCode === item.itemCode && i.comment === comment
      );
      if (existingIndex >= 0) {
        const items = [...state.items];
        items[existingIndex] = {
          ...items[existingIndex],
          quantity: items[existingIndex].quantity + quantity,
        };
        return { items };
      }
      return { items: [...state.items, { ...item, comment, quantity }] };
    }),
  clearCart: () => set({ items: [] }),
}));

export function cartGrandTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.rate * item.quantity, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

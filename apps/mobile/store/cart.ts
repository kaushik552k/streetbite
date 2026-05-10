import { create } from 'zustand'

export interface CartItem {
  id: string
  truckId: string
  truckName: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
  truckId: string | null
  truckName: string | null
  addItem: (item: CartItem) => void
  removeItem: (menuItemId: string) => void
  updateQty: (menuItemId: string, qty: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  truckId: null,
  truckName: null,

  addItem: (item) => {
    const { items, truckId } = get()

    // If adding from a different truck, clear cart first
    if (truckId && truckId !== item.truckId) {
      set({ items: [{ ...item, quantity: 1 }], truckId: item.truckId, truckName: item.truckName })
      return
    }

    const existing = items.find((i) => i.menuItemId === item.menuItemId)
    if (existing) {
      set({
        items: items.map((i) =>
          i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({ items: [...items, { ...item, quantity: 1 }], truckId: item.truckId, truckName: item.truckName })
    }
  },

  removeItem: (menuItemId) => {
    const { items } = get()
    const updated = items.filter((i) => i.menuItemId !== menuItemId)
    set({ items: updated, truckId: updated.length ? get().truckId : null, truckName: updated.length ? get().truckName : null })
  },

  updateQty: (menuItemId, qty) => {
    const { items } = get()
    if (qty <= 0) {
      get().removeItem(menuItemId)
      return
    }
    set({ items: items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: qty } : i)) })
  },

  clearCart: () => set({ items: [], truckId: null, truckName: null }),

  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))

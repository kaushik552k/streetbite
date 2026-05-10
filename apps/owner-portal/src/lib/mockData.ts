export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED'

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  options?: string
}

export interface Order {
  id: string
  customerName: string
  status: OrderStatus
  total: number
  items: OrderItem[]
  createdAt: string
  note?: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
  image?: string
}

export const mockOrders: Order[] = [
  {
    id: 'ORD-1029',
    customerName: 'Alex Johnson',
    status: 'PENDING',
    total: 24.50,
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    items: [
      { id: '1', name: 'Classic Smash Burger', quantity: 2, price: 9.50 },
      { id: '2', name: 'Truffle Fries', quantity: 1, price: 5.50 }
    ],
    note: 'No pickles please'
  },
  {
    id: 'ORD-1030',
    customerName: 'Maria Garcia',
    status: 'PREPARING',
    total: 15.00,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    items: [
      { id: '3', name: 'Spicy Chicken Sandwich', quantity: 1, price: 11.00 },
      { id: '4', name: 'Cola', quantity: 2, price: 2.00 }
    ]
  },
  {
    id: 'ORD-1031',
    customerName: 'David Kim',
    status: 'READY',
    total: 32.00,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    items: [
      { id: '1', name: 'Classic Smash Burger', quantity: 3, price: 9.50 },
      { id: '5', name: 'Onion Rings', quantity: 1, price: 3.50 }
    ]
  }
]

export const mockMenu: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Smash Burger',
    description: 'Two beef patties, american cheese, house sauce, pickles.',
    price: 9.50,
    category: 'Burgers',
    isAvailable: true
  },
  {
    id: '3',
    name: 'Spicy Chicken Sandwich',
    description: 'Crispy fried chicken breast, spicy mayo, slaw.',
    price: 11.00,
    category: 'Sandwiches',
    isAvailable: true
  },
  {
    id: '2',
    name: 'Truffle Fries',
    description: 'Crispy shoestring fries tossed in truffle oil and parmesan.',
    price: 5.50,
    category: 'Sides',
    isAvailable: true
  },
  {
    id: '4',
    name: 'Cola',
    description: 'Ice-cold cola.',
    price: 2.00,
    category: 'Drinks',
    isAvailable: true
  },
  {
    id: '5',
    name: 'Onion Rings',
    description: 'Golden crispy onion rings.',
    price: 3.50,
    category: 'Sides',
    isAvailable: true
  },
  {
    id: '6',
    name: 'Vanilla Shake',
    description: 'Hand-spun vanilla bean ice cream.',
    price: 6.00,
    category: 'Drinks',
    isAvailable: false
  }
]

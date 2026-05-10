// Mock data for development — replace with real API calls later

export const MOCK_TRUCKS = [
  {
    id: '1',
    name: 'The Burger Lab',
    description: 'Craft burgers with locally sourced ingredients and house-made sauces.',
    cuisine: ['Burgers', 'American'],
    logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    rating: 4.8,
    reviewCount: 284,
    distance: 0.3,
    estimatedMins: 15,
    isActive: true,
    address: '5th Ave & 23rd St',
    lat: 40.7425,
    lng: -73.9878,
  },
  {
    id: '2',
    name: 'Taco Loco',
    description: 'Authentic Mexican street tacos, burritos and fresh salsas.',
    cuisine: ['Mexican', 'Tacos'],
    logo: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    rating: 4.6,
    reviewCount: 192,
    distance: 0.7,
    estimatedMins: 10,
    isActive: true,
    address: 'Broadway & 34th St',
    lat: 40.7489,
    lng: -73.9880,
  },
  {
    id: '3',
    name: 'Pizza on Wheels',
    description: 'Wood-fired Neapolitan pizza made fresh to order.',
    cuisine: ['Pizza', 'Italian'],
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    rating: 4.7,
    reviewCount: 341,
    distance: 1.1,
    estimatedMins: 20,
    isActive: true,
    address: 'Madison & 42nd St',
    lat: 40.7527,
    lng: -73.9772,
  },
  {
    id: '4',
    name: 'Spice Route',
    description: 'Bold Indian street food — chaat, wraps, and curries.',
    cuisine: ['Indian', 'Street Food'],
    logo: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
    rating: 4.5,
    reviewCount: 156,
    distance: 1.4,
    estimatedMins: 12,
    isActive: false,
    address: 'Park Ave & 51st St',
    lat: 40.7580,
    lng: -73.9750,
  },
]

export const MOCK_MENU = {
  '1': [
    {
      id: 'cat-1',
      name: 'Signature Burgers',
      items: [
        { id: 'item-1', name: 'Classic Smash Burger', description: 'Double smash patty, american cheese, pickles, special sauce', price: 12.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', isVeg: false, isAvailable: true },
        { id: 'item-2', name: 'Mushroom Swiss', description: 'Beef patty, sautéed mushrooms, swiss cheese, garlic aioli', price: 14.99, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', isVeg: false, isAvailable: true },
        { id: 'item-3', name: 'Veggie Black Bean', description: 'Black bean patty, avocado, roasted peppers, chipotle mayo', price: 11.99, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80', isVeg: true, isAvailable: true },
      ],
    },
    {
      id: 'cat-2',
      name: 'Sides',
      items: [
        { id: 'item-4', name: 'Crispy Fries', description: 'Double-fried golden fries with seasoning', price: 4.99, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80', isVeg: true, isAvailable: true },
        { id: 'item-5', name: 'Onion Rings', description: 'Beer-battered with chipotle dipping sauce', price: 5.99, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80', isVeg: true, isAvailable: true },
      ],
    },
    {
      id: 'cat-3',
      name: 'Drinks',
      items: [
        { id: 'item-6', name: 'Craft Lemonade', description: 'Fresh-squeezed with a hint of mint', price: 3.99, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80', isVeg: true, isAvailable: true },
        { id: 'item-7', name: 'Vanilla Milkshake', description: 'Thick and creamy with real ice cream', price: 6.99, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80', isVeg: true, isAvailable: true },
      ],
    },
  ],
}

export const MOCK_ORDERS = [
  {
    id: 'order-1',
    truckName: 'The Burger Lab',
    truckLogo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&q=80',
    status: 'READY',
    total: 28.97,
    itemCount: 3,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'order-2',
    truckName: 'Taco Loco',
    truckLogo: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200&q=80',
    status: 'COMPLETED',
    total: 19.50,
    itemCount: 2,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order-3',
    truckName: 'Pizza on Wheels',
    truckLogo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80',
    status: 'COMPLETED',
    total: 24.99,
    itemCount: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const CUISINE_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'burgers', label: 'Burgers', emoji: '🍔' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'indian', label: 'Indian', emoji: '🍛' },
  { id: 'chinese', label: 'Chinese', emoji: '🥡' },
  { id: 'bbq', label: 'BBQ', emoji: '🔥' },
  { id: 'vegan', label: 'Vegan', emoji: '🥗' },
]

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create an Admin
  await prisma.user.upsert({
    where: { email: 'admin@streetbite.com' },
    update: {},
    create: {
      clerkId: 'mock_admin_clerk_id',
      email: 'admin@streetbite.com',
      name: 'Super Admin',
      role: 'ADMIN',
    },
  })

  // 2. Create an Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@theburgerlab.com' },
    update: {},
    create: {
      clerkId: 'mock_owner_clerk_id',
      email: 'owner@theburgerlab.com',
      name: 'Alex Johnson',
      role: 'OWNER',
    },
  })

  // 2. Create a Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      clerkId: 'mock_customer_clerk_id',
      email: 'customer@test.com',
      name: 'Maria Garcia',
      role: 'CUSTOMER',
    },
  })

  // 3. Create a Food Truck
  const truck = await prisma.foodTruck.create({
    data: {
      ownerId: owner.id,
      name: 'The Burger Lab',
      description: 'Gourmet smash burgers made with 100% Angus beef.',
      cuisine: ['American', 'Burgers'],
      isApproved: true,
      isActive: true,
      address: '123 Food Truck Plaza',
    },
  })

  // 4. Create Menu Categories
  const categoryBurgers = await prisma.menuCategory.create({
    data: { truckId: truck.id, name: 'Burgers', sortOrder: 1 },
  })
  
  const categorySides = await prisma.menuCategory.create({
    data: { truckId: truck.id, name: 'Sides', sortOrder: 2 },
  })

  // 5. Create Menu Items
  const burger1 = await prisma.menuItem.create({
    data: {
      truckId: truck.id,
      categoryId: categoryBurgers.id,
      name: 'Classic Smash Burger',
      description: 'Two beef patties, american cheese, house sauce.',
      price: 9.50,
      isAvailable: true,
    },
  })

  const fries = await prisma.menuItem.create({
    data: {
      truckId: truck.id,
      categoryId: categorySides.id,
      name: 'Truffle Fries',
      description: 'Crispy fries with truffle oil.',
      price: 5.50,
      isAvailable: true,
      isVeg: true,
    },
  })

  // 6. Create an Order
  await prisma.order.create({
    data: {
      customerId: customer.id,
      truckId: truck.id,
      subtotal: 15.00,
      commission: 1.50,
      total: 15.00,
      status: 'PENDING',
      paymentStatus: 'PAID',
      items: {
        create: [
          { menuItemId: burger1.id, quantity: 1, unitPrice: 9.50 },
          { menuItemId: fries.id, quantity: 1, unitPrice: 5.50 },
        ],
      },
    },
  })

  console.log('Seeding finished successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { prismaClient } from "./prism";

const app = new Hono()
const prisma = prismaClient

// Create Customer
app.post('/customers', async (c) => {
  const data = await c.req.json()
  const customer = await prisma.customer.create({ data })
  return c.json(customer)
})
app.get('/customers', async (c) => {
  const customers = await prisma.customer.findMany();
  return c.json(customers);
});
// Retrieve Customer Details
app.get('/customers/:id', async (c) => {
  const id = c.req.param('id')
  const customer = await prisma.customer.findUnique({ where: { id } })
  return c.json(customer)
})
app.get('/customers/:id/orders', async (c) => {
  const id = c.req.param('id');
  const orders = await prisma.order.findMany({
    where: { customerId: id }
  });

  return c.json(orders);
});

// Register Restaurant
app.post('/restaurants', async (c) => {
  const data = await c.req.json()
  const restaurant = await prisma.restaurant.create({ data })
  return c.json(restaurant)
})

// Get Menu of a Restaurant
app.get('/restaurants/:id/menu', async (c) => {
  const id = c.req.param('id')
  const menu = await prisma.menuItem.findMany({ where: { restaurantId: id } })
  return c.json(menu)
})

// Add Menu Item
app.post('/restaurants/:id/menu', async (c) => {
  const restaurantId = c.req.param('id')
  const data = await c.req.json()
  const menuItem = await prisma.menuItem.create({
    data: { ...data, restaurantId },
  })
  return c.json(menuItem)
})

app.patch('/menu/:id', async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json(); // { price: 10.99 } or { available: false }

  const menuItem = await prisma.menuItem.update({
    where: { id },
    data
  });

  return c.json(menuItem);
});


// Place Order
app.post('/orders', async (c) => {
  const data = await c.req.json();

  const order = await prisma.order.create({
    data: {
      customerId: data.customerId,
      restaurantId: data.restaurantId,
      totalPrice: data.totalPrice,
      status: "Placed",
      orderItems: {
        create: data.orderItems.map((item: { menuItemId: string, quantity: number }) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity
        }))
      }
    },
    include: {
      orderItems: true // To include created orderItems in response
    }
  });

  return c.json(order);
});
// Get Order Details
app.get('/orders/:id', async (c) => {
  const id = c.req.param('id')
  const order = await prisma.order.findUnique({ where: { id }, include: { orderItems: true } })
  return c.json(order)
})
// Update Order Status
app.patch('/orders/:id/status', async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json()
  const order = await prisma.order.update({ where: { id }, data: { status } })
  return c.json(order)
})
// Get Revenue of a Restaurant
app.get('/restaurants/:id/revenue', async (c) => {
  const id = c.req.param('id')
  const revenue = await prisma.order.aggregate({
    where: { restaurantId: id },
    _sum: { totalPrice: true },
  })
  return c.json({ revenue: revenue._sum.totalPrice || 0 })
})
app.get('/menu/top-items', async (c) => {
  const topItems = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 1, // Get the top ordered item
  });

  if (topItems.length === 0) {
    return c.json({ message: 'No menu items ordered yet' });
  }

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: topItems[0].menuItemId },
    select: { id: true, name: true, price: true },
  });

  return c.json({
    menuItem,
    totalOrders: topItems[0]._sum.quantity,
  });
});
// Get Top 5 Customers by Orders
app.get('/customers/top', async (c) => {
  const topCustomers = await prisma.order.groupBy({
    by: ['customerId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5, // Get top 5 customers
  });

  if (topCustomers.length === 0) {
    return c.json({ message: 'No customers found' });
  }

  const customers = await prisma.customer.findMany({
    where: {
      id: {
        in: topCustomers.map((customer) => customer.customerId),
      },
    },
  });

  return c.json(customers);
});
// Start Server
serve(app)
console.log('Server running on http://localhost:3000')
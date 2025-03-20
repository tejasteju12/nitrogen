-- Create Customers Table
CREATE TABLE "Customer" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phoneNumber" TEXT NOT NULL UNIQUE,
    "address" TEXT NOT NULL
);

-- Create Restaurants Table
CREATE TABLE "Restaurant" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "location" TEXT NOT NULL
);

-- Create Menu Items Table
CREATE TABLE "MenuItem" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "restaurantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "isAvailable" BOOLEAN DEFAULT TRUE,
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE
);

-- Create Orders Table
CREATE TABLE "Order" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "customerId" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "status" TEXT CHECK ("status" IN ('Placed', 'Preparing', 'Completed', 'Cancelled')) DEFAULT 'Placed',
    "totalPrice" DECIMAL NOT NULL,
    "orderTime" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE,
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE
);

-- Create Order Items Table (Join Table)
CREATE TABLE "OrderItem" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "orderId" UUID NOT NULL,
    "menuItemId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
    FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE
);

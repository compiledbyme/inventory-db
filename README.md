# Inventory Database Assignment

This project fulfills the inventory database assignment using PostgreSQL, Prisma ORM, Next.js route handlers, and TypeScript.

## Requirements Coverage

- `POST /supplier` creates a supplier
- `POST /inventory` creates an inventory item
- `GET /inventory` returns all inventory grouped by supplier and sorted by total inventory value
- `GET /api/supplier` returns suppliers with their inventory items
- `GET /api/inventory` returns raw inventory records and supports optional `supplierId` and `productName` filters
- inventory validation ensures:
  - the supplier exists
  - `quantity >= 0`
  - `price > 0`

## Database Schema Explanation

The application uses two SQL tables with a one-to-many relationship.

### Suppliers

- `id`: unique supplier identifier
- `name`: supplier name
- `city`: supplier city

### Inventory

- `id`: unique inventory identifier
- `supplierId`: foreign key referencing the supplier
- `productName`: product name
- `quantity`: available stock quantity
- `price`: unit price

### Relationship

One supplier can have many inventory items. Every inventory item belongs to exactly one supplier.

## Why SQL Was Chosen

SQL is the right choice for this assignment because the data is structured and relational:

- suppliers and inventory have a clear one-to-many relationship
- inventory must belong to a valid supplier, which is enforced with a foreign key
- the required grouped query relies on aggregation and sorting, which SQL databases handle efficiently
- PostgreSQL provides strong consistency for inventory data and predictable query behavior

## API Endpoints

### `POST /supplier`

Creates a supplier.

Example body:

```json
{
  "name": "Bharat Tech Distributors",
  "city": "Bengaluru"
}
```

### `POST /inventory`

Creates an inventory item for an existing supplier.

Example body:

```json
{
  "supplierId": "supplier_id_here",
  "productName": "Wireless Mouse",
  "quantity": 180,
  "price": 799
}
```

### `GET /inventory`

Returns all inventory grouped by supplier and sorted by total inventory value in descending order.

`totalValue = sum(quantity * price)` for each supplier

Example response:

```json
[
  {
    "supplierId": "supplier_id_here",
    "supplierName": "Bharat Tech Distributors",
    "city": "Bengaluru",
    "inventory": [
      {
        "productName": "Wireless Mouse",
        "quantity": 180,
        "price": 799,
        "value": 143820
      }
    ],
    "totalValue": 143820
  }
]
```

## One Indexing / Optimization Suggestion

A useful optimization is to keep an index on `Inventory.supplierId`, because supplier-based lookups and grouped reporting depend on that column. If the dataset grows much larger, a next improvement would be caching or precomputing supplier totals so the grouped inventory report does not recalculate every total on each request.

## Local Setup

```bash
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Create a local `.env` file first:

```bash
cp .env.example .env
```

Required env vars:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma and the app

Keep the real `.env` file private and only commit `.env.example` with placeholder values.

## Tech Stack

- PostgreSQL
- Prisma ORM
- Next.js
- TypeScript

# Services Directory

This directory contains business logic services that handle data manipulation and business rules.

## Structure

Services should be organized by domain/feature:

```
services/
├── auth.service.ts       # Authentication business logic
├── customer.service.ts   # Customer-related business logic
├── inventory.service.ts  # Inventory calculations and logic
└── order.service.ts      # Order processing logic
```

## Purpose

- Separate business logic from components
- Reusable business logic across the application
- Easier to test business rules in isolation
- Keep components focused on presentation

## Example

```typescript
// services/inventory.service.ts
export class InventoryService {
  static calculateStockValue(items: InventoryItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price)
    }, 0)
  }

  static isLowStock(item: InventoryItem, threshold: number = 10): boolean {
    return item.quantity <= threshold
  }
}
```

# Validators Directory

This directory contains form validation schemas using Zod or Yup.

## Structure

Organize validators by feature/form:

```
validators/
├── auth.schema.ts        # Login, registration validation
├── customer.schema.ts    # Customer form validation
├── product.schema.ts     # Product form validation
└── order.schema.ts       # Order form validation
```

## Purpose

- Centralized validation logic
- Type-safe validation schemas
- Reusable across forms
- Consistent validation rules

## Example using Zod

```typescript
// validators/customer.schema.ts
import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10,}$/, 'Invalid phone number'),
  address: z.string().optional(),
})

export type CustomerFormData = z.infer<typeof customerSchema>
```

## Usage in Components

```typescript
import { customerSchema } from '@/validators/customer.schema'

const form = useForm({
  resolver: zodResolver(customerSchema),
})
```

# Schema Evolution Examples

## Adding a New Feature: Transaction Categories

### With Prisma (Schema-First)
```prisma
// 1. Add new field to existing model
model Transaction {
  // ... existing fields
  category     String?  // Just add this line!
  subcategory  String?  // And this one!
}

// 2. Run migration
// $ npx prisma migrate dev --name add_transaction_categories
```

**Result:** Prisma automatically generates:
- ALTER TABLE statements
- Migration file with rollback capability  
- Updated TypeScript types
- Updated client methods

### With Static Migrations
```sql
-- migration_005_add_transaction_categories.sql
ALTER TABLE transactions ADD COLUMN category VARCHAR(255);
ALTER TABLE transactions ADD COLUMN subcategory VARCHAR(255);

-- migration_005_rollback.sql (you have to write this too!)
ALTER TABLE transactions DROP COLUMN subcategory;
ALTER TABLE transactions DROP COLUMN category;
```

**You must manually:**
- Write the SQL
- Write the rollback SQL
- Update your ORM/query builder
- Update TypeScript types
- Test on multiple environments

## Adding a Complex Relationship

### With Prisma
```prisma
// Add a new model with relationships
model TransactionApproval {
  id            String   @id @default(cuid())
  transactionId String
  approvedBy    String  
  approvedAt    DateTime
  notes         String?
  
  transaction   Transaction @relation(fields: [transactionId], references: [id])
  approver      User        @relation(fields: [approvedBy], references: [id])
}

model Transaction {
  // ... existing fields
  approvals     TransactionApproval[]  // Just add this!
}
```

### With Static Migrations
```sql
-- Create table
CREATE TABLE transaction_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  approved_by UUID NOT NULL,
  approved_at TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign keys  
ALTER TABLE transaction_approvals 
  ADD CONSTRAINT fk_transaction 
  FOREIGN KEY (transaction_id) REFERENCES transactions(id);

ALTER TABLE transaction_approvals 
  ADD CONSTRAINT fk_approver 
  FOREIGN KEY (approved_by) REFERENCES users(id);

-- Add indexes
CREATE INDEX idx_transaction_approvals_transaction_id 
  ON transaction_approvals(transaction_id);
CREATE INDEX idx_transaction_approvals_approved_by 
  ON transaction_approvals(approved_by);
```

## Migration History Tracking

### Prisma Migration Files
```
prisma/migrations/
├── 20240630120000_initial_schema/
│   └── migration.sql
├── 20240701140000_add_transaction_categories/  
│   └── migration.sql
├── 20240702160000_add_approval_workflow/
│   └── migration.sql
└── migration_lock.toml
```

**Benefits:**
- ✅ Automatic timestamps
- ✅ Descriptive names  
- ✅ Version control friendly
- ✅ Rollback capability
- ✅ Environment sync

### Static Migrations
```
migrations/
├── 001_initial.sql
├── 001_rollback.sql
├── 002_categories.sql  
├── 002_rollback.sql
├── 003_approvals.sql
├── 003_rollback.sql
└── applied_migrations.txt (you maintain this)
```

**You manage:**
- ❌ Numbering system
- ❌ Rollback scripts
- ❌ Applied migration tracking
- ❌ Environment synchronization 
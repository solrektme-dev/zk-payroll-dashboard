# Migration Guide: Transaction Detail Feature

## Overview

This guide helps developers integrate and customize the new Transaction Detail feature.

## What Changed

### New Files Added

```text
components/
├── ui/
│   ├── badge.tsx              # Status indicator component
│   ├── sheet.tsx              # Drawer/dialog component
│   └── scroll-area.tsx        # Scrollable area component
└── features/
    └── transactions/
        └── TransactionDetailDrawer.tsx  # Main detail view component

docs/
├── TRANSACTION_DETAIL_FEATURE.md
├── TRANSACTION_DETAIL_USAGE.md
└── MIGRATION_GUIDE.md

__tests__/
└── transaction-detail.test.tsx

CHANGELOG.md
```

### Modified Files

- `components/features/transactions/TransactionHistory.tsx`
  - Added state management for selected transaction
  - Added drawer open/close state
  - Added click handlers
  - Added hover effects on rows
  - Added Actions column with Details button
  - Integrated TransactionDetailDrawer component

- `README.md`
  - Added Transaction Detail View to features list
  - Updated usage guide
  - Updated project structure

## Installation

### 1. Ensure Dependencies

The following packages should already be installed:

```bash
npm list @radix-ui/react-dialog @radix-ui/react-scroll-area
```

If not installed:

```bash
npm install @radix-ui/react-dialog@^1.1.17 @radix-ui/react-scroll-area@^1.2.12
```

### 2. Copy UI Components

Copy the following components to your `components/ui/` directory:

- `sheet.tsx`
- `badge.tsx`
- `scroll-area.tsx`

These are standard shadcn/ui style components.

### 3. Copy Feature Component

Copy `TransactionDetailDrawer.tsx` to:

```text
components/features/transactions/TransactionDetailDrawer.tsx
```

### 4. Update TransactionHistory

Apply changes to `TransactionHistory.tsx` to integrate the detail drawer:

**Add imports:**

```typescript
import { Eye } from "lucide-react";
import TransactionDetailDrawer from "./TransactionDetailDrawer";
```

**Add state:**

```typescript
const [selectedTransaction, setSelectedTransaction] = 
  useState<PayrollTransaction | null>(null);
const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

const handleViewDetails = (transaction: PayrollTransaction) => {
  setSelectedTransaction(transaction);
  setDetailDrawerOpen(true);
};
```

**Add Actions column header:**

```tsx
<th scope="col" className="...">
  <span className="sr-only">Actions</span>
</th>
```

**Update empty state colspan:**
Change from `5` to `6`

**Add row click handler:**

```tsx
<tr
  key={tx.id}
  className="hover:bg-gray-50 transition-colors cursor-pointer"
  onClick={() => handleViewDetails(tx)}
>
```

**Add Details button cell:**

```tsx
<td className="px-6 py-4">
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      handleViewDetails(tx);
    }}
    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
    aria-label={`View details for transaction ${tx.id}`}
  >
    <Eye className="w-3.5 h-3.5" />
    Details
  </button>
</td>
```

**Add drawer at end of component:**

```tsx
<TransactionDetailDrawer
  transaction={selectedTransaction}
  open={detailDrawerOpen}
  onOpenChange={setDetailDrawerOpen}
/>
```

## Customization

### Styling

All styling uses Tailwind CSS. To customize:

**Colors:**

- Verified status: `bg-green-100 text-green-800`
- Pending status: `bg-yellow-100 text-yellow-800`
- Failed status: `bg-red-100 text-red-800`
- Primary actions: `text-indigo-700 bg-indigo-50`

**Drawer width:**

```tsx
// In sheet.tsx, right variant
"... sm:max-w-xl"  // Change xl to 2xl, 3xl, etc.
```

**Section spacing:**

```tsx
<div className="space-y-6 py-6">  // Adjust spacing
```

### Adding New Sections

To add a new section to the drawer:

```tsx
<section>
  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <YourIcon className="w-4 h-4" />
    Section Title
  </h4>
  <div className="space-y-3">
    {/* Section content */}
  </div>
</section>
```

### Customizing Data Display

**Add new transaction fields:**

1. Update `PayrollTransaction` type in `types/models.ts`:

```typescript
export interface PayrollTransaction {
  // existing fields...
  yourNewField: string;
}
```

1. Add display in drawer:

```tsx
<div className="p-3 border border-gray-200 rounded-lg">
  <div className="text-xs text-gray-500 mb-1">Your Field</div>
  <div className="text-sm font-medium text-gray-900">
    {transaction.yourNewField}
  </div>
</div>
```

### Custom Status Types

To add new status types:

1. Update type:

```typescript
status: "pending" | "verified" | "failed" | "your-status";
```

1. Add to status handlers in TransactionDetailDrawer:

```typescript
const getStatusIcon = () => {
  switch (transaction.status) {
    // existing cases...
    case "your-status":
      return <YourIcon className="w-5 h-5 text-blue-600" />;
  }
};

const getStatusBadge = () => {
  switch (transaction.status) {
    // existing cases...
    case "your-status":
      return <Badge variant="info">Your Status</Badge>;
  }
};
```

1. Add description in verification section.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run only transaction detail tests
npm test transaction-detail

# Watch mode
npm run test:watch
```

### Adding Custom Tests

Create tests in `__tests__/transaction-detail.test.tsx`:

```typescript
it("displays your custom field", () => {
  const onOpenChange = vi.fn();
  const customTx = { 
    ...mockTransaction, 
    yourField: "test value" 
  };
  
  render(
    <TransactionDetailDrawer
      transaction={customTx}
      open={true}
      onOpenChange={onOpenChange}
    />
  );

  expect(screen.getByText("test value")).toBeInTheDocument();
});
```

## API Integration

### Fetching Detailed Data

When integrating with a real API:

```typescript
// In TransactionDetailDrawer.tsx
import { useEffect } from "react";

function TransactionDetailDrawer({ transaction, open, onOpenChange }) {
  const [detailedData, setDetailedData] = useState(null);
  
  useEffect(() => {
    if (open && transaction) {
      // Fetch additional details
      fetch(`/api/transactions/${transaction.id}/details`)
        .then(res => res.json())
        .then(data => setDetailedData(data));
    }
  }, [open, transaction]);
  
  // Use detailedData in render...
}
```

### Real-time Updates

For live status updates:

```typescript
useEffect(() => {
  if (open && transaction && transaction.status === "pending") {
    const interval = setInterval(() => {
      // Poll for status updates
      checkTransactionStatus(transaction.id);
    }, 5000);
    
    return () => clearInterval(interval);
  }
}, [open, transaction]);
```

## Accessibility Checklist

✅ ARIA labels on all interactive elements
✅ Keyboard navigation supported
✅ Focus management handled by Radix UI
✅ Screen reader announcements
✅ Semantic HTML structure
✅ Color contrast meets WCAG AA
✅ Skip links where appropriate

To test accessibility:

1. Navigate using only keyboard
2. Use screen reader (NVDA/JAWS/VoiceOver)
3. Check color contrast ratios
4. Verify ARIA attributes

## Performance Optimization

### Lazy Loading

If drawer content is heavy:

```typescript
const TransactionDetailDrawer = lazy(() => 
  import("./TransactionDetailDrawer")
);

// In parent component
<Suspense fallback={<LoadingSpinner />}>
  <TransactionDetailDrawer {...props} />
</Suspense>
```

### Memoization

For expensive computations:

```typescript
const formattedDate = useMemo(
  () => formatDate(transaction.createdAt),
  [transaction.createdAt]
);
```

## Common Issues

### Issue: Drawer not closing on overlay click

**Solution:** Ensure SheetOverlay is rendered in SheetContent:

```tsx
<SheetPortal>
  <SheetOverlay />  {/* Must be here */}
  <SheetPrimitive.Content>
```

### Issue: Copy to clipboard not working

**Solution:** Requires HTTPS or localhost:

```typescript
// Fallback for non-HTTPS
if (!navigator.clipboard) {
  // Use textarea fallback method
}
```

### Issue: Animations not working

**Solution:** Ensure `tailwindcss-animate` is installed:

```bash
npm install tailwindcss-animate
```

And added to `tailwind.config.ts`:

```typescript
plugins: [require("tailwindcss-animate")]
```

## Rollback Procedure

If you need to revert this feature:

1. **Remove state from TransactionHistory:**

```typescript
// Remove these lines
const [selectedTransaction, setSelectedTransaction] = useState(null);
const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
```

1. **Remove Actions column:**

- Remove `<th>` for Actions in thead
- Remove `<td>` with Details button in tbody
- Change empty state colspan back to `5`

1. **Remove hover effects:**

```typescript
// Change back to:
<tr key={tx.id}>
```

1. **Remove drawer render:**

```typescript
// Remove:
<TransactionDetailDrawer ... />
```

1. **Remove import:**

```typescript
// Remove:
import TransactionDetailDrawer from "./TransactionDetailDrawer";
import { Eye } from "lucide-react";
```

1. **Remove new files:**

```bash
rm components/features/transactions/TransactionDetailDrawer.tsx
rm components/ui/sheet.tsx
rm components/ui/badge.tsx
rm components/ui/scroll-area.tsx
rm __tests__/transaction-detail.test.tsx
```

## Support

For issues or questions:

- Check existing tests for examples
- Review the comprehensive documentation
- Open an issue on GitHub
- Contact the development team

## Next Steps

Recommended enhancements:

1. Add PDF export functionality
2. Implement email sharing
3. Add audit trail section
4. Create comparison view
5. Add notes/comments feature
6. Implement real-time status polling
7. Add more transaction metadata fields

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for complete change history.

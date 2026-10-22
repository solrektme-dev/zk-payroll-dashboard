# Transaction Detail View - Quick Reference

## 🚀 Quick Start

### Open Detail View

```typescript
// Click table row or Details button - it just works!
```

### Component Usage

```tsx
import TransactionDetailDrawer from "@/components/features/transactions/TransactionDetailDrawer";

<TransactionDetailDrawer
  transaction={selectedTransaction}
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

## 📁 Files

### New Components

```text
components/features/transactions/TransactionDetailDrawer.tsx
components/ui/sheet.tsx
components/ui/badge.tsx
components/ui/scroll-area.tsx
```

### Modified

```text
components/features/transactions/TransactionHistory.tsx
README.md
```

### Documentation

```text
docs/TRANSACTION_DETAIL_FEATURE.md
docs/TRANSACTION_DETAIL_USAGE.md
docs/MIGRATION_GUIDE.md
docs/ARCHITECTURE.md
docs/IMPLEMENTATION_SUMMARY.md
docs/QUICK_REFERENCE.md (this file)
CHANGELOG.md
```

### Tests

```text
__tests__/transaction-detail.test.tsx
```

## 🎨 Key Features

| Feature | Implementation |
| --------- | --------------- |
| **View Details** | Click row or Details button |
| **Privacy** | ZK proofs masked by default |
| **Copy** | One-click copy with feedback |
| **Explorer** | Direct link to Stellar Expert |
| **Status** | Visual badges and descriptions |
| **Timeline** | Creation & verification dates |
| **Responsive** | Mobile and desktop support |
| **Accessible** | WCAG AA compliant |

## 💻 Common Code Patterns

### Add New Section

```tsx
<section>
  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <YourIcon className="w-4 h-4" />
    Section Title
  </h4>
  <div className="space-y-3">
    {/* Content */}
  </div>
</section>
```

### Add Info Box

```tsx
<div className="p-4 border border-gray-200 rounded-lg">
  <div className="text-xs text-gray-500 mb-1">Label</div>
  <div className="text-sm font-medium text-gray-900">
    {transaction.field}
  </div>
</div>
```

### Add Copy Button

```tsx
<button
  type="button"
  onClick={() => copyToClipboard(value, "fieldName")}
  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
>
  <Copy className="w-3 h-3" />
  {copiedField === "fieldName" ? "Copied!" : "Copy"}
</button>
```

## 🎯 Status Badges

### Usage

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success">Verified</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="info">Info</Badge>
```

### Variants

- `success` - Green (verified)
- `warning` - Yellow (pending)
- `destructive` - Red (failed)
- `info` - Blue
- `default` - Gray
- `outline` - Border only

## 🔒 Privacy Functions

### Mask Value

```typescript
const maskValue = (value: string, visibleChars = 8) => {
  if (value.length <= visibleChars * 2) return value;
  return `${value.slice(0, visibleChars)}...${value.slice(-visibleChars)}`;
};

// Usage
maskValue(transaction.proof, 12)
// "0xzkproof_abc...xyz234"
```

### Toggle Visibility

```typescript
const [showProof, setShowProof] = useState(false);

<button onClick={() => setShowProof(!showProof)}>
  {showProof ? "Hide" : "Show"}
</button>

{showProof ? fullProof : maskValue(fullProof)}
```

## 📋 Data Types

### PayrollTransaction

```typescript
interface PayrollTransaction {
  id: string;              // "tx_001"
  companyId: string;       // "company_001"
  timestamp: string;       // ISO 8601
  createdAt: string;       // ISO 8601
  totalAmount: number;     // 9500
  employeeCount: number;   // 2
  proof: string;           // "0xzkproof..."
  status: "verified" | "pending" | "failed";
  txHash?: string;         // Optional blockchain hash
}
```

## 🎨 Styling Reference

### Color Classes

```css
/* Status Colors */
bg-green-100 text-green-800  /* Verified */
bg-yellow-100 text-yellow-800 /* Pending */
bg-red-100 text-red-800      /* Failed */

/* Actions */
text-indigo-700 bg-indigo-50 hover:bg-indigo-100  /* Primary */
text-gray-700 bg-gray-100 hover:bg-gray-200      /* Secondary */

/* Containers */
border border-gray-200 rounded-lg  /* Bordered box */
bg-gray-50                         /* Light background */
```

### Spacing

```css
space-y-6    /* Section spacing */
space-y-3    /* Item spacing */
gap-2        /* Icon/text gap */
px-6 py-4    /* Standard padding */
p-3          /* Compact padding */
mb-4         /* Header margin */
```

### Typography

```css
text-2xl font-semibold          /* Page title */
text-lg font-semibold           /* Section heading */
text-sm font-semibold           /* Subsection */
text-sm text-gray-900           /* Body text */
text-xs text-gray-500           /* Label */
font-mono text-sm               /* Code/hash */
```

## 🧪 Testing

### Run Tests

```bash
npm test transaction-detail
npm run test:watch
npm run test:coverage
```

### Test Example

```typescript
it("displays transaction details", () => {
  render(
    <TransactionDetailDrawer
      transaction={mockTransaction}
      open={true}
      onOpenChange={vi.fn()}
    />
  );
  
  expect(screen.getByText("Transaction Details")).toBeInTheDocument();
});
```

## 🔧 Troubleshooting

| Issue | Solution |
| ------- | ---------- |
| Drawer not opening | Check state and click handlers |
| Copy not working | Requires HTTPS or localhost |
| Styles not applied | Check Tailwind config |
| Types errors | Install dependencies: `npm install` |
| Tests failing | Check mock data matches interface |

## ⌨️ Keyboard Shortcuts

| Key | Action |
| ----- | -------- |
| `Tab` | Navigate elements |
| `Shift + Tab` | Navigate backwards |
| `Enter` / `Space` | Activate button |
| `Escape` | Close drawer |

## 🔗 Quick Links

### Documentation

- [Full Feature Docs](./TRANSACTION_DETAIL_FEATURE.md)
- [User Guide](./TRANSACTION_DETAIL_USAGE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Architecture](./ARCHITECTURE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

### Related Components

- `TransactionHistory`: Main table component
- `Sheet`: Drawer base component
- `Badge`: Status indicators
- `ScrollArea`: Scrollable content

## 📊 Metrics to Track

```typescript
// Recommended analytics events
analytics.track("transaction_detail_viewed");
analytics.track("transaction_hash_copied");
analytics.track("blockchain_explorer_opened");
analytics.track("zk_proof_revealed");
```

## 🎯 Best Practices

### Do ✅

- Keep proofs masked by default
- Use status badges consistently
- Provide copy functionality
- Show privacy notices
- Format dates properly
- Use proper ARIA labels

### Don't ❌

- Expose individual salaries
- Show unmasked data by default
- Hardcode external URLs
- Skip null checks
- Forget accessibility
- Remove privacy notices

## 🚀 Performance Tips

```typescript
// Memoize expensive operations
const formattedDate = useMemo(
  () => formatDate(transaction.createdAt),
  [transaction.createdAt]
);

// Conditional rendering
{transaction.txHash && <BlockchainSection />}

// Lazy loading (future)
const TransactionDetailDrawer = lazy(() => 
  import("./TransactionDetailDrawer")
);
```

## 🎨 Customization Examples

### Add New Status

```typescript
// 1. Update type
type Status = "verified" | "pending" | "failed" | "archived";

// 2. Add icon
case "archived":
  return <Archive className="w-5 h-5 text-gray-600" />;

// 3. Add badge
case "archived":
  return <Badge variant="secondary">Archived</Badge>;
```

### Change Drawer Side

```tsx
<SheetContent side="left">  {/* or "top" | "bottom" */}
```

### Custom Privacy Message

```tsx
<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <div className="text-xs text-blue-900">
    Your custom privacy message here
  </div>
</div>
```

## 📱 Mobile Considerations

- Drawer width: 75% on mobile, max 576px desktop
- Touch-friendly button sizes (min 44x44px)
- Swipe to close supported
- All features work on mobile
- Responsive text sizes

## ♿ Accessibility Checklist

- [ ] All buttons have aria-labels
- [ ] Headings use proper hierarchy
- [ ] Focus visible on interactive elements
- [ ] Screen reader tested
- [ ] Keyboard navigation works
- [ ] Color contrast > 4.5:1
- [ ] Error messages clear

## 🔐 Security Checklist

- [ ] No PII exposed
- [ ] Sensitive data masked
- [ ] External links secure (noopener)
- [ ] Input validated
- [ ] XSS prevented
- [ ] Clipboard secure

## 📦 Dependencies

```json
{
  "@radix-ui/react-dialog": "^1.1.17",
  "@radix-ui/react-scroll-area": "^1.2.12",
  "lucide-react": "^0.330.0",
  "class-variance-authority": "^0.7.1",
  "tailwind-merge": "^3.5.0",
  "clsx": "^2.1.1"
}
```

## 🎓 Learning Path

1. **Read**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
2. **Understand**: [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Use**: [TRANSACTION_DETAIL_USAGE.md](./TRANSACTION_DETAIL_USAGE.md)
4. **Integrate**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
5. **Deep Dive**: [TRANSACTION_DETAIL_FEATURE.md](./TRANSACTION_DETAIL_FEATURE.md)

## 💡 Pro Tips

1. **Copy Pattern**: Use the `copyToClipboard` function for consistency
2. **Status Icons**: Keep icon size at `w-4 h-4` or `w-5 h-5`
3. **Sections**: Use `space-y-6` for section spacing
4. **Labels**: Always use `text-xs text-gray-500` for labels
5. **Values**: Use `text-sm text-gray-900` for values
6. **Monospace**: Use `font-mono` for hashes/proofs
7. **Actions**: Use `inline-flex items-center gap-1` for buttons
8. **Hover**: Add `transition-colors` for smooth effects

## 📞 Need Help?

1. Check [TRANSACTION_DETAIL_USAGE.md](./TRANSACTION_DETAIL_USAGE.md) troubleshooting
2. Review test cases for examples
3. Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) common issues
4. Contact development team

---

**Quick Ref Version**: 1.0  
**Last Updated**: 2026-06-27  
**Status**: ✅ Ready to Use

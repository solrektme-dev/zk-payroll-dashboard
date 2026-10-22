# Transaction Detail View - User Guide

## Quick Start

### Accessing Transaction Details

There are two ways to view transaction details:

1. **Click anywhere on a transaction row** in the history table
2. **Click the "Details" button** in the Actions column

The transaction detail drawer will slide in from the right side of your screen.

## What You'll See

### Header Section

At the top of the drawer, you'll see:

- **Transaction Details** title
- **Status indicator** (Verified/Pending/Failed) with colored badge
- **Transaction ID** for reference
- **Close button** (X) in the top-right corner

### Transaction Summary

A quick overview of the payment:

- **Total Amount**: The total paid in this transaction (e.g., $9,500)
- **Employees Paid**: Number of employees who received payment (e.g., 2)

### Timeline

Key dates and times:

- **Created**: When the payroll transaction was initiated
  - Shows both date (e.g., "February 28, 2025") and time
- **Verified/Processed**: When the transaction completed
  - Only shown for completed transactions

### Verification Section

Details about the transaction's security:

#### Status

- Shows current verification state
- Includes explanation of what the status means:
  - **Verified**: ✅ Cryptographically verified and immutable
  - **Pending**: ⏳ Awaiting verification processing
  - **Failed**: ❌ Verification unsuccessful

#### ZK Proof

- **Hidden by default** for security
- Shows masked version: `0xzkproof_abc...xyz234`
- Click **"Show"** to reveal full proof
- Click **"Copy proof"** button when visible to copy to clipboard
- Click **"Hide"** to mask again

### Blockchain Details

Only visible for verified transactions:

- **Transaction Hash**: Unique blockchain identifier
- **Copy button**: Quickly copy the hash
- **View on Explorer**: Opens Stellar Expert in a new tab to verify on-chain

### Organization

- **Company ID**: The organization associated with this payroll run

### Privacy Notice

Always displayed at the bottom:

- 🛡️ Explains that individual salaries remain encrypted
- Confirms only aggregate totals are visible
- Reassures about privacy protection

## Common Actions

### Copying Information

**To copy a transaction hash:**

1. Locate the "Blockchain Details" section
2. Click the **"Copy"** button
3. Button text changes to "Copied!" to confirm
4. Paste into your document or tool

**To copy a ZK proof:**

1. Click **"Show"** in the ZK Proof section
2. Click **"Copy proof"** button
3. Paste into your verification tool

### Verifying on Blockchain

**To verify a transaction on-chain:**

1. Open the transaction details
2. Scroll to "Blockchain Details"
3. Click **"View on Explorer"**
4. Stellar Expert opens in a new tab
5. Review the on-chain transaction data

### Closing the Drawer

You can close the drawer in three ways:

1. Click the **X button** in the top-right corner
2. Click the **dark overlay** outside the drawer
3. Press the **Escape key** on your keyboard

## Use Cases

### For Payroll Operators

**Daily Verification:**

1. Open History page
2. Click today's payroll transaction
3. Verify status shows "Verified"
4. Check employee count matches expectation
5. Confirm total amount is correct

**Troubleshooting Failed Payment:**

1. Filter history to show "Failed" transactions
2. Click the failed transaction
3. Review the error description
4. Note the transaction ID for support
5. Contact support with the ID

### For Auditors

**Monthly Audit:**

1. Filter transactions for the audit period
2. Open each transaction to review:
   - Verification status (should all be "Verified")
   - ZK proof is present
   - Total amounts match payroll records
   - Employee counts are reasonable
3. Verify a sample on blockchain:
   - Click "View on Explorer"
   - Confirm transaction on Stellar network
   - Cross-reference amounts

**Compliance Check:**

1. Review Privacy Notice is displayed
2. Confirm no individual salaries visible
3. Verify only aggregate data shown
4. Check that ZK proofs are masked by default
5. Document privacy protections in audit report

### For Finance Team

**Reconciliation:**

1. Export CSV from history page
2. Open each transaction in detail view
3. Copy transaction hash
4. Match hash with bank records
5. Verify amounts match financial system

**Reporting:**

1. Open transaction for reporting period
2. Note total amount and employee count
3. Copy transaction ID for report reference
4. Include verification status in report
5. Link to blockchain explorer for transparency

## Understanding Status Indicators

### ✅ Verified (Green)

- Transaction is complete and secure
- Cryptographically proven correct
- Immutably recorded on blockchain
- Safe to consider as final

### ⏳ Pending (Yellow)

- Transaction is processing
- Zero-knowledge proof being generated
- Not yet confirmed on blockchain
- Check back later for final status

### ❌ Failed (Red)

- Transaction did not complete successfully
- May need to be retried
- Contact support if unexpected
- Do not rely on this payment

## Privacy & Security

### What You Can See

✅ Total amount paid
✅ Number of employees
✅ Verification status
✅ Transaction timestamps
✅ Blockchain transaction hash
✅ ZK proof (when shown)

### What Stays Private

🔒 Individual employee salaries
🔒 Employee personal information
🔒 Specific payment amounts per person
🔒 Employee identities
🔒 Detailed salary breakdown

### Why This Matters

- **Compliance**: Meets privacy regulations
- **Transparency**: Auditable without exposing sensitive data
- **Security**: Zero-knowledge proofs validate correctness
- **Trust**: Blockchain provides immutable record

## Tips & Best Practices

### For Operators

- ✅ Check transaction status daily
- ✅ Verify employee counts match roster
- ✅ Keep transaction IDs for records
- ✅ Use blockchain explorer for final verification
- ✅ Document any failed transactions

### For Auditors

- ✅ Sample-test blockchain verification
- ✅ Confirm all transactions show "Verified"
- ✅ Validate privacy protections are in place
- ✅ Check ZK proofs are present
- ✅ Cross-reference with financial records

### For Everyone

- ✅ Don't share ZK proofs publicly
- ✅ Verify transaction hashes match external records
- ✅ Report any suspicious failed transactions
- ✅ Keep transaction IDs for support requests
- ✅ Use copy buttons instead of manual copying

## Keyboard Shortcuts

- **Escape**: Close the drawer
- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons when focused
- **Shift + Tab**: Navigate backwards

## Mobile Usage

The drawer is fully responsive on mobile devices:

- Swipe right or tap overlay to close
- Scroll vertically to see all details
- Tap buttons to copy or navigate
- All features available on smaller screens

## Troubleshooting

### "Details button not working"

- **Check**: Ensure JavaScript is enabled
- **Try**: Refresh the page
- **Alternative**: Click the table row instead

### "Can't copy transaction hash"

- **Check**: Browser supports clipboard API
- **Check**: You're using HTTPS (not HTTP)
- **Try**: Manually select and copy text

### "Explorer link shows 404"

- **Check**: Transaction is verified (has hash)
- **Check**: Network connection is stable
- **Try**: Copy hash and search manually on Stellar Expert

### "Drawer won't close"

- **Try**: Click the X button
- **Try**: Press Escape key
- **Try**: Click the dark overlay
- **Last resort**: Refresh the page

## Support

If you encounter issues:

1. Note the **Transaction ID**
2. Take a **screenshot** of the error
3. Document **steps to reproduce**
4. Contact support with this information

## Related Documentation

- [Transaction History Guide](./TRANSACTION_HISTORY.md)
- [Zero-Knowledge Proofs Explained](./ZK_PROOFS.md)
- [Blockchain Verification](./BLOCKCHAIN_VERIFICATION.md)
- [Privacy & Compliance](./PRIVACY_COMPLIANCE.md)

# Accessibility Audit — Keyboard Navigation & Focus States

**Issue:** #59  
**Branch:** fix/accessibility-keyboard-navigation-59  
**Status:** In Progress

---

## Flows Audited

| Flow | Keyboard Operable | Focus Visible | Focus Order | Notes |
| ------ | :-----------------: | :-------------: | :-----------: | ------- |
| Onboarding / Wallet Connect | ⬜ | ⬜ | ⬜ | |
| Payroll Batch Submission | ⬜ | ⬜ | ⬜ | |
| Transaction History | ⬜ | ⬜ | ⬜ | |
| Compliance / View-key | ⬜ | ⬜ | ⬜ | |
| Employee Management | ⬜ | ⬜ | ⬜ | |
| Modals / Dialogs | ⬜ | ⬜ | ⬜ | |
| Navigation / Sidebar | ⬜ | ⬜ | ⬜ | |

Legend: ✅ Pass · ❌ Fail · ⬜ Not yet tested

---

## Known Issues

| # | Component | Issue | Severity | Status |
| --- | ----------- | ------- | ---------- | -------- |
| 1 | Global | Missing `:focus-visible` styles | High | Fixed ✅ |
| 2 | Modals | No focus trap | High | Fixed ✅ |
| 3 | Menus/Lists | No arrow-key navigation | Medium | Fixed ✅ |
| 4 | Layout | No skip-to-content link | Medium | Pending |

---

## Changes Made

### `app/globals.css`

- Added `:focus-visible` ring styles for all interactive elements
- Added `.skip-to-content` utility class
- Removed `outline: none` on `:focus` (now only suppressed for mouse users via `:focus:not(:focus-visible)`)

### `hooks/useFocusTrap.ts` _(new)_

- Traps Tab/Shift+Tab inside modals when active
- Auto-focuses first focusable element on open
- Dispatches `modal:close` on Escape for parent handlers

### `hooks/useKeyboardNav.ts` _(new)_

- Arrow Up/Down (or Left/Right) navigation for lists and menus
- Home/End jump to first/last item
- Enter/Space fires `onSelect` callback
- Roving `tabIndex` pattern (WCAG 2.1 compliant)

---

## Acceptance Criteria Checklist

- [ ] Critical flows are keyboard operable
- [ ] Focus states are visible and consistent
- [ ] Accessibility issues found during the audit are tracked or fixed

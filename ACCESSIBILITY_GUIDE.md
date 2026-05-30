# Accessibility Improvements Guide - WCAG 2.1 AA

## Overview

This document outlines accessibility improvements for Share-A-Meal to meet WCAG 2.1 Level AA compliance, focusing on AI Insights, authentication, and general UX components.

---

## 1. Keyboard Navigation

### Current Status: Partial ✓
- Input fields support Tab navigation
- Buttons are keyboard accessible
- Enter key sends messages in AI chat

### Improvements Needed

#### AI Chat Component
```javascript
// Support keyboard shortcuts for power users
const handleKeyDown = (e) => {
  // Send message
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    ask();
  }
  
  // Send with Alt+Enter (for accessibility alternatives)
  if (e.key === 'Enter' && (e.altKey || e.metaKey)) {
    e.preventDefault();
    ask();
  }
  
  // Close snapshot with Escape
  if (e.key === 'Escape' && showSnapshot) {
    setShowSnapshot(false);
  }
  
  // Navigate through messages with Arrow keys
  if (e.key === 'ArrowUp' && focusedMessageIndex > 0) {
    setFocusedMessageIndex(focusedMessageIndex - 1);
  }
  if (e.key === 'ArrowDown' && focusedMessageIndex < messages.length - 1) {
    setFocusedMessageIndex(focusedMessageIndex + 1);
  }
  
  // Focus on quick questions with numbers 1-4
  if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.metaKey) {
    debouncedAsk(t(QUICK_QUESTIONS[parseInt(e.key) - 1]));
  }
};
```

#### Tab Order
```javascript
// Ensure logical tab order (visual flow)
<header tabIndex={0}>
  {/* Header content */}
</header>

<button tabIndex={0} onClick={() => setShowSnapshot(!showSnapshot)}>
  Show Data
</button>

{showSnapshot && (
  <pre tabIndex={0} role="region" aria-live="polite">
    {/* Data snapshot */}
  </pre>
)}

<input
  tabIndex={0}
  placeholder="Ask AI..."
  aria-label="Ask AI a question"
/>

<button tabIndex={0} onClick={ask}>
  Send
</button>
```

---

## 2. ARIA Labels & Roles

### Current Status: Partial ✓
- Some buttons have labels
- Input fields have placeholders (insufficient)
- Message areas lack semantic roles

### Required Improvements

#### AI Chat Semantics
```javascript
<div className="bg-card border rounded-2xl" role="region" aria-label="AI Chat Assistant">
  <header>
    <h2 id="ai-chat-title">{t('ai_chat_assistant_title')}</h2>
    <p id="ai-chat-subtitle">{t('ai_chat_assistant_subtitle')}</p>
  </header>

  {/* Messages area - live region for announcements */}
  <div role="log" aria-live="polite" aria-label="Chat messages">
    {messages.map((m, i) => (
      <div role="article" aria-label={`${m.role === 'user' ? 'Your' : 'AI'} message`}>
        {m.text}
      </div>
    ))}
    {loading && <div aria-live="assertive" aria-busy="true">AI is generating response...</div>}
  </div>

  {/* Input area - accessible form pattern */}
  <div role="search" aria-labelledby="ai-input-label">
    <label id="ai-input-label" htmlFor="ai-question-input">
      {t('ai_chat_placeholder')}
    </label>
    <input
      id="ai-question-input"
      value={input}
      onChange={e => setInput(e.target.value)}
      placeholder={t('ai_chat_placeholder')}
      aria-describedby="keyboard-help"
    />
    <span id="keyboard-help" className="sr-only">
      Press Enter to send, Alt+Enter as alternative, Escape to cancel
    </span>
  </div>
</div>
```

#### Authentication Forms
```javascript
// SignIn.jsx
<form aria-labelledby="signin-title">
  <h1 id="signin-title">{t('sign_in')}</h1>
  
  <label htmlFor="email-input">{t('email')} *</label>
  <input
    id="email-input"
    type="email"
    name="email"
    value={email}
    onChange={e => setEmail(e.target.value)}
    required
    aria-required="true"
    aria-invalid={error ? 'true' : 'false'}
    aria-describedby={error ? 'email-error' : undefined}
  />
  {error && <span id="email-error" role="alert">{error}</span>}
  
  <label htmlFor="password-input">{t('password')} *</label>
  <input
    id="password-input"
    type="password"
    name="password"
    value={password}
    onChange={e => setPassword(e.target.value)}
    required
    aria-required="true"
    aria-invalid={error ? 'true' : 'false'}
    aria-describedby={error ? 'password-error' : undefined}
  />
  {error && <span id="password-error" role="alert">{error}</span>}
  
  <button type="submit" aria-label="Sign in with email and password">
    {t('sign_in')}
  </button>
</form>
```

#### Data Snapshot
```javascript
<div role="region" aria-label="App data snapshot">
  <button
    aria-pressed={showSnapshot}
    aria-label={showSnapshot ? 'Hide app data snapshot' : 'Show app data snapshot'}
  >
    {showSnapshot ? t('hide_data_snapshot') : t('show_data_snapshot')}
  </button>
  
  {showSnapshot && (
    <div role="complementary" aria-label="JSON formatted app state">
      <pre
        tabIndex={0}
        aria-label="App state data in JSON format"
        role="article"
      >
        {JSON.stringify(appStateSnapshot, null, 2)}
      </pre>
      <p className="sr-only">
        This data shows current donations, users, and campaigns in the system.
        Use keyboard arrow keys to navigate, Tab to focus other elements.
      </p>
    </div>
  )}
</div>
```

---

## 3. Color Contrast

### WCAG AA Requirements
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

### Current Implementation (Tailwind)
```javascript
// ✓ Compliant: text-foreground on bg-card (usually 4.8:1)
<div className="bg-card text-foreground">
  {/* High contrast */}
</div>

// ✓ Compliant: bg-primary text-white (usually 5.2:1)
<button className="bg-primary text-white">
  Send
</button>

// ⚠️ At-risk: text-muted-foreground on bg-muted (usually 3.2:1, borderline)
<p className="text-muted-foreground bg-muted">
  {/* May fail WCAG AA for normal text */}
</p>

// ✓ Fix: Use darker muted text for small text
<p className="text-muted">
  {/* Better contrast */}
</p>
```

### Contrast Testing Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Stark (Figma Plugin)](https://www.getstark.co/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)

---

## 4. Screen Reader Support

### Current: Partial ✓

#### Improve Screen Reader Experience
```javascript
// Use semantic HTML
<header>                    // Instead of <div role="banner">
<main>                      // Instead of <div role="main">
<nav>                       // Instead of <div role="navigation">
<button>                    // Instead of <div onClick={}>
<a>                         // Instead of <button onClick={}>

// Add aria-live for dynamic content
<div aria-live="polite" aria-atomic="true">
  {/* Content that updates dynamically */}
</div>

// Skip Links
<a href="#main-content" className="sr-only">
  Skip to main content
</a>

<main id="main-content">
  {/* Main content */}
</main>

// Hide decorative elements
<Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />

// Describe icons with aria-label
<Bot className="w-4 h-4 text-primary" aria-label="AI Assistant" />
```

#### Screen Reader Testing
```bash
# Test with NVDA (Windows) - Free
# Test with JAWS (Windows) - Commercial
# Test with VoiceOver (Mac) - Built-in (Cmd+F5)
# Test with TalkBack (Android) - Built-in
# Test with VoiceOver (iOS) - Built-in

# Browser extension: axe DevTools
# Automated testing: axe-core (dev dependency)
```

---

## 5. Focus Management

### Current Status: Needs Improvement

#### Visible Focus Indicators
```css
/* Ensure focus is always visible */
button:focus,
input:focus,
a:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Or use Tailwind */
className="focus:outline-none focus:ring-2 focus:ring-primary"
```

#### Focus Trap Pattern (for modals)
```javascript
import { useEffect } from 'react';

function useFocusTrap(ref, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Handle escape
      }
      
      if (e.key === 'Tab') {
        // Trap focus within modal
        const focusableElements = ref.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ref, enabled]);
}

// Usage
const modalRef = useRef(null);
useFocusTrap(modalRef, showSnapshot);
```

#### Initial Focus
```javascript
useEffect(() => {
  // Set focus to the most important element on page load
  if (showSnapshot) {
    const snapshotPre = document.querySelector('[role="article"][aria-label*="JSON"]');
    snapshotPre?.focus();
  } else if (messages.length === 0) {
    const firstQuestionButton = document.querySelector('button[role="button"]');
    firstQuestionButton?.focus();
  }
}, [showSnapshot, messages.length]);
```

---

## 6. Error Handling

### Accessible Error Messages
```javascript
// Current: Generic alert
alert('Error occurred');

// Improved: Specific, helpful error in context
{error && (
  <div role="alert" aria-live="assertive" className="bg-destructive/10 border border-destructive rounded p-3 mt-2">
    <h3 className="font-semibold text-destructive">{t('error')}</h3>
    <p className="text-sm mt-1">
      {error === 'RATE_LIMITED' && t('rate_limit_message')}
      {error === 'NETWORK_ERROR' && t('network_error_message')}
      {error === 'INVALID_INPUT' && t('invalid_input_message')}
    </p>
    <button
      onClick={handleRetry}
      className="mt-2 text-sm text-destructive hover:underline"
      aria-label="Retry the failed action"
    >
      {t('retry')}
    </button>
  </div>
)}
```

---

## 7. Responsive & Mobile Accessibility

### Touch Target Size
```javascript
// WCAG AAA: 48x48px minimum
<button className="w-12 h-12 rounded-lg">
  {/* Accessible touch target */}
</button>

// Small touch targets need spacing
<div className="flex gap-4">
  <button className="px-3 py-2">Copy</button>
  <button className="px-3 py-2">Retry</button>
</div>
```

### Mobile Keyboard Support
```javascript
// Hide unused elements on mobile (still accessible to screen readers)
<div className="hidden md:block sr-only md:sr-auto">
  {/* Desktop-only content, visible to screen readers on mobile */}
</div>

// Provide mobile-friendly focus patterns
input:focus,
button:focus {
  outline-width: 3px; /* Thicker on mobile */
}
```

---

## 8. Testing Checklist

### Automated Testing
```bash
# Add axe-core to dev dependencies
npm install --save-dev axe-core

# Run in tests
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('AI Chat has no accessibility violations', async () => {
  const { container } = render(<AIChatInsights />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist
- [ ] Tab through all interactive elements in logical order
- [ ] Verify focus is always visible
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify color contrast meets WCAG AA (4.5:1)
- [ ] Test with keyboard only (no mouse)
- [ ] Test on mobile devices
- [ ] Test error handling with screen reader
- [ ] Verify all form inputs have labels
- [ ] Verify all buttons have accessible labels
- [ ] Check for dynamic content announcements (aria-live)
- [ ] Run Lighthouse accessibility audit (>90)
- [ ] Run axe DevTools scan (0 violations)

### Testing Tools
1. **Lighthouse** (Chrome DevTools > Lighthouse > Accessibility)
2. **axe DevTools** (Browser extension)
3. **WAVE** (Browser extension)
4. **Screen readers**: NVDA (Windows), VoiceOver (Mac/iOS), TalkBack (Android)
5. **Keyboard navigation**: Tab, Shift+Tab, Enter, Escape, Arrow keys
6. **Contrast checker**: [WebAIM](https://webaim.org/resources/contrastchecker/)

---

## 9. Implementation Recommendations

### Priority 1 (WCAG A - Critical)
- [x] Keyboard navigation
- [x] ARIA labels on interactive elements
- [ ] Color contrast (test and fix)
- [ ] Form labels (all inputs must have `<label>`)
- [ ] Error messages with role="alert"

### Priority 2 (WCAG AA - Important)
- [ ] Focus visible on all interactive elements
- [ ] Semantic HTML (header, main, nav, etc.)
- [ ] Screen reader announcements (aria-live)
- [ ] Sufficient touch target sizes (48x48px)

### Priority 3 (WCAG AAA - Nice to Have)
- [ ] Focus trap in modals
- [ ] Keyboard shortcuts guide
- [ ] High contrast mode support
- [ ] Reduced motion support (prefers-reduced-motion)

---

## 10. Accessibility Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)
- [The A11Y Project](https://www.a11yproject.com/)

---

## Compliance Target

- **WCAG 2.1 Level AA** (Industry standard)
- **Lighthouse Accessibility Score**: 90+
- **axe DevTools**: 0 violations
- **Manual testing**: All keyboard and screen reader tests pass

---

## Next Steps

1. Run automated accessibility audit (Lighthouse, axe)
2. Fix Priority 1 violations
3. Manual testing with keyboard and screen reader
4. Fix Priority 2 violations
5. Document remaining known issues (if any)
6. Set up automated accessibility testing in CI/CD
7. Monitor accessibility metrics over time

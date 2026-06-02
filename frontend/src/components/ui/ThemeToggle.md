# ThemeToggle Component

A toggle button component that switches between light and dark themes with localStorage persistence.

## Features

- **Theme Switching**: Toggle between light and dark modes with a single click
- **localStorage Persistence**: User preference is saved and restored on subsequent visits
- **System Preference Detection**: Respects user's system color scheme preference on first visit
- **Smooth Transitions**: Animated icon transitions for a polished user experience
- **Accessible**: Proper ARIA labels for screen readers
- **Error Handling**: Gracefully handles localStorage errors with fallback behavior

## Usage

### Basic Usage

```jsx
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

### With Navigation

```jsx
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function Navigation() {
  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Logo />
        <NavLinks />
      </div>
      <ThemeToggle />
    </nav>
  );
}
```

## How It Works

### Theme Application

The component toggles the `dark` class on `document.documentElement`:

```javascript
// Light mode: <html class="">
// Dark mode: <html class="dark">
```

This works with Tailwind CSS's dark mode configuration:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class", // Enable class-based dark mode
  // ...
};
```

### localStorage Persistence

Theme preference is stored in localStorage:

```javascript
localStorage.setItem("theme", "dark"); // or 'light'
```

On component mount, it checks for a stored preference:

1. If theme exists in localStorage → use it
2. If no stored theme → check system preference
3. If localStorage fails → fallback to light mode

### System Preference Detection

If no theme is stored, the component checks the user's system preference:

```javascript
window.matchMedia("(prefers-color-scheme: dark)").matches;
```

## Styling

The component uses the shadcn/ui Button component with these props:

- `variant="ghost"` - Transparent background
- `size="icon"` - Square icon button (40x40px)
- Custom transition classes for smooth animations

### Icons

- **Light Mode**: Shows Moon icon (clicking switches to dark)
- **Dark Mode**: Shows Sun icon (clicking switches to light)

Icons are from `lucide-react` with smooth transitions:

```jsx
<Moon className="h-5 w-5 transition-all duration-300" />
<Sun className="h-5 w-5 transition-all duration-300" />
```

## Accessibility

### ARIA Labels

The button includes descriptive ARIA labels:

```jsx
aria-label="Switch to dark mode"  // In light mode
aria-label="Switch to light mode"  // In dark mode
```

### Keyboard Navigation

- Fully keyboard accessible (Tab to focus, Enter/Space to activate)
- Visible focus ring from shadcn/ui Button component
- No focus traps or accessibility barriers

## Error Handling

### localStorage Errors

If localStorage is unavailable (quota exceeded, disabled, etc.):

```javascript
try {
  localStorage.setItem("theme", newTheme);
} catch (error) {
  console.warn("Failed to save theme preference:", error);
  // Theme still works, just won't persist
}
```

### Hydration Mismatch Prevention

The component prevents hydration mismatches in SSR environments:

```jsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  // Initialize theme
}, []);

if (!mounted) {
  return <Button disabled>...</Button>;
}
```

## Testing

The component includes comprehensive tests:

- [x] Renders correctly
- [x] Initializes with correct theme
- [x] Loads theme from localStorage
- [x] Toggles between light and dark
- [x] Persists preference to localStorage
- [x] Applies dark class to document
- [x] Handles localStorage errors
- [x] Respects system preference
- [x] Displays correct icons
- [x] Has proper accessibility attributes

Run tests:

```bash
npm test -- ThemeToggle.test.js
```

## Requirements Satisfied

This component satisfies the following requirements from the mobile-first-shadcn-redesign spec:

- **Requirement 11.2**: Persist user's dark mode preference in localStorage
- **Requirement 11.3**: Provide a toggle control for switching between light and dark modes

## Example

See `ThemeToggle.example.js` for a complete working example with demo content.

## Dependencies

- `react` - Component framework
- `lucide-react` - Icon library (Moon, Sun icons)
- `@/components/ui/button` - shadcn/ui Button component

## Browser Support

Works in all modern browsers that support:

- localStorage API
- CSS classes
- matchMedia API (for system preference detection)

Gracefully degrades if localStorage is unavailable.

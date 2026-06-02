# Design Document: Dribbble DeFi UI Redesign

## Overview

This design transforms LinkGuard from a functional security tool into a premium, data-driven security analysis platform with sophisticated visual design inspired by modern DeFi dashboards. The redesign prioritizes a dark, professional aesthetic with glassmorphism effects, prominent data visualizations, and elegant typography while maintaining mobile-first responsive design and WCAG AA accessibility compliance.

### Design Philosophy

**Premium Security Experience**: The interface conveys trust and sophistication through visual design quality, not just functional capability. Every interaction should feel polished and intentional.

**Data-Driven Transparency**: Security analysis is presented through clear visualizations, metrics dashboards, and transparent explanations. Users understand not just the results, but the process.

**Mobile-First Sophistication**: Complex data visualizations and premium aesthetics work seamlessly across devices, with touch-optimized interactions and responsive layouts that adapt intelligently.

**Accessible by Design**: Glassmorphism and dark themes are implemented with strict contrast requirements, keyboard navigation, and screen reader support built into every component.

### Technology Stack

- **Framework**: React 19.2.3 with React Router for navigation
- **Styling**: Tailwind CSS 3.4.1 with custom dark theme configuration
- **Component Library**: shadcn/ui with Radix UI primitives
- **Icons**: lucide-react for professional SVG icons
- **Charts**: recharts for data visualization
- **Maps**: react-map-gl with MapLibre GL for geographic visualization
- **Build Tool**: Create React App with code splitting and lazy loading

### Key Design Decisions

1. **Dark Theme as Default**: Deep dark backgrounds (neutral-950, neutral-900) create a premium feel and reduce eye strain during extended security analysis sessions.

2. **Glassmorphism for Hierarchy**: Frosted glass effects with backdrop-blur create visual depth and organize information without heavy borders or shadows.

3. **shadcn/ui Foundation**: Using shadcn/ui provides accessible, customizable primitives that can be enhanced with glassmorphism and dark theme styling while maintaining WCAG compliance.

4. **Data Visualization Priority**: Security metrics are presented as dashboard-style insights with charts, progress indicators, and trend visualizations rather than plain text.

5. **Professional Iconography**: Replacing emojis with lucide-react icons creates a credible, modern interface appropriate for security professionals.


## Architecture

### Component Architecture

The application follows a layered component architecture with clear separation of concerns:

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives with custom styling
│   │   ├── button.jsx         # Base shadcn button
│   │   ├── Button.js          # Enhanced wrapper with loading/icons
│   │   ├── card.jsx           # Base shadcn card
│   │   ├── Card.js            # Glassmorphism-enhanced card
│   │   ├── input.jsx          # Base shadcn input
│   │   ├── badge.jsx          # Base shadcn badge
│   │   ├── dialog.jsx         # Modal dialogs
│   │   ├── dropdown-menu.jsx  # Dropdown menus
│   │   ├── tooltip.jsx        # Tooltips
│   │   ├── separator.jsx      # Visual separators
│   │   ├── skeleton.jsx       # Loading skeletons
│   │   ├── progress.jsx       # Progress bars
│   │   ├── tabs.jsx           # Tab navigation
│   │   └── sheet.jsx          # Mobile drawer
│   ├── layout/                # Layout components
│   │   ├── Header.js          # Navigation header with mobile menu
│   │   ├── Footer.js          # Footer with links
│   │   └── Container.js       # Content container with max-width
│   ├── analysis/              # Analysis-specific components
│   │   ├── AnalysisForm.js    # URL input form with validation
│   │   ├── RiskDisplay.js     # Risk score visualization
│   │   ├── RiskFactors.js     # Risk factor list
│   │   └── AnalysisResult.js  # Complete result display
│   ├── insights/              # Dashboard insights components
│   │   ├── InsightsPanel.js   # Container for insights
│   │   ├── MetricCard.js      # Individual metric display
│   │   ├── RiskChart.js       # Risk distribution chart
│   │   └── TrendIndicator.js  # Trend visualization
│   ├── geographic/            # Geographic visualization
│   │   ├── GeoMap.js          # Interactive map
│   │   ├── StaticMap.js       # Fallback static map
│   │   └── NetworkInfo.js     # Network intelligence display
│   ├── history/               # History components
│   │   ├── HistoryDashboard.js # History overview
│   │   ├── HistoryItem.js     # Individual history entry
│   │   └── HistoryFilters.js  # Filtering controls
│   └── common/                # Shared components
│       ├── LoadingState.js    # Loading indicators
│       ├── ErrorDisplay.js    # Error messages
│       └── EmptyState.js      # Empty state illustrations
├── pages/                     # Route pages
│   ├── Home.js                # Landing page with insights
│   ├── Analyze.js             # Analysis page
│   ├── History.js             # History dashboard
│   └── About.js               # About/documentation
├── lib/                       # Utilities
│   ├── utils.js               # cn() helper, formatters
│   └── api.js                 # API client
└── styles/                    # Global styles
    └── globals.css            # Tailwind imports, custom CSS
```


### State Management

The application uses React's built-in state management:

- **Local Component State**: useState for component-specific UI state (form inputs, modals, dropdowns)
- **Context API**: For theme preferences and user authentication state
- **React Router**: For navigation state and route parameters
- **API State**: Managed through async/await with loading/error states in components

No external state management library is needed for this application's complexity level.

### Routing Architecture

```javascript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/analyze" element={<Analyze />} />
    <Route path="/history" element={<History />} />
    <Route path="/about" element={<About />} />
  </Routes>
</BrowserRouter>
```

### Responsive Breakpoint Strategy

```javascript
// Tailwind breakpoints
const breakpoints = {
  mobile: '< 640px',    // Base styles, single column
  tablet: '640px',      // sm: prefix, two columns
  desktop: '1024px',    // lg: prefix, multi-column
  wide: '1280px'        // xl: prefix, max content width
};
```

**Mobile-First Approach**: All base styles target mobile. Progressive enhancement adds complexity at larger breakpoints using min-width media queries.


## Components and Interfaces

### Design System Tokens

#### Color Palette

```javascript
// Dark theme colors (Tailwind config)
colors: {
  // Deep dark backgrounds
  background: {
    primary: 'neutral-950',    // #030712 - Main background
    secondary: 'neutral-900',  // #111827 - Card backgrounds
    tertiary: 'neutral-800',   // #1f2937 - Elevated surfaces
  },
  
  // Brand colors (cyan/blue for security theme)
  brand: {
    50: '#f0f9ff',
    400: '#38bdf8',  // Primary accent
    500: '#0ea5e9',  // Hover states
    600: '#0284c7',  // Active states
  },
  
  // Risk semantic colors
  risk: {
    safe: '#10b981',        // Green
    caution: '#f59e0b',     // Amber
    danger: '#ef4444',      // Red
  },
  
  // Text colors
  text: {
    primary: 'neutral-50',    // #f9fafb - Headings
    secondary: 'neutral-300', // #d1d5db - Body text
    tertiary: 'neutral-400',  // #9ca3af - Muted text
  },
  
  // Border colors
  border: {
    subtle: 'neutral-800',    // Subtle dividers
    default: 'neutral-700',   // Default borders
    emphasis: 'neutral-600',  // Emphasized borders
  }
}
```

#### Typography Scale

```javascript
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px - Captions
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px - Small text
  'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px - Body
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px - Large body
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - Subheadings
  '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px - Headings
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - Large headings
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px - Hero headings
  '5xl': ['3rem', { lineHeight: '1' }],           // 48px - Display text
  '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px - Hero display
}

fontWeight: {
  light: 300,      // Subtle text
  normal: 400,     // Body text
  medium: 500,     // Labels, emphasis
  semibold: 600,   // Subheadings
  bold: 700,       // Headings
  extrabold: 800,  // Hero text
}
```


#### Spacing System

```javascript
spacing: {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
}
```

#### Glassmorphism Effects

```css
/* Base glassmorphism card */
.glass-card {
  background: rgba(17, 24, 39, 0.7);  /* neutral-900 with 70% opacity */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

/* Elevated glassmorphism (more prominent) */
.glass-elevated {
  background: rgba(31, 41, 55, 0.8);  /* neutral-800 with 80% opacity */
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
}

/* Subtle glassmorphism (less prominent) */
.glass-subtle {
  background: rgba(17, 24, 39, 0.5);  /* neutral-900 with 50% opacity */
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### Core UI Components

#### Button Component

**Interface:**
```javascript
<Button
  variant="primary|secondary|danger|ghost|outline|link"
  size="sm|md|lg|icon"
  loading={boolean}
  disabled={boolean}
  icon={ReactNode}
  iconPosition="left|right"
  className={string}
  onClick={function}
>
  {children}
</Button>
```

**Variants:**
- `primary`: Brand color background, white text (default)
- `secondary`: Neutral background, white text
- `danger`: Red background, white text
- `ghost`: Transparent background, hover effect
- `outline`: Border only, transparent background
- `link`: Text-only, underline on hover

**Accessibility:**
- Minimum 44x44px touch target
- Visible focus ring (2px brand-400 outline)
- ARIA labels for icon-only buttons
- Disabled state with reduced opacity and cursor-not-allowed


#### Card Component

**Interface:**
```javascript
<Card
  variant="default|elevated|subtle"
  padding="none|sm|md|lg"
  className={string}
>
  {children}
</Card>
```

**Variants:**
- `default`: Standard glassmorphism effect
- `elevated`: Enhanced glassmorphism for emphasis
- `subtle`: Minimal glassmorphism for backgrounds

**Implementation:**
```javascript
// Card.js
const Card = ({ variant = 'default', padding = 'md', className, children }) => {
  const variants = {
    default: 'bg-neutral-900/70 backdrop-blur-xl border border-white/10',
    elevated: 'bg-neutral-800/80 backdrop-blur-2xl border border-white/15 shadow-2xl',
    subtle: 'bg-neutral-900/50 backdrop-blur-lg border border-white/5',
  };
  
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div className={cn(
      'rounded-xl',
      variants[variant],
      paddings[padding],
      'transition-all duration-300',
      'hover:border-white/20',
      className
    )}>
      {children}
    </div>
  );
};
```

#### Input Component

**Interface:**
```javascript
<Input
  type="text|email|url|password"
  placeholder={string}
  value={string}
  onChange={function}
  error={string}
  icon={ReactNode}
  disabled={boolean}
  className={string}
/>
```

**Features:**
- Dark background with glassmorphism
- Minimum 44px height for touch targets
- Enhanced focus state with glow effect
- Inline error display with icon
- Optional leading icon
- Appropriate mobile keyboard types

**Implementation:**
```javascript
const Input = ({ error, icon, className, ...props }) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'w-full h-11 px-4 rounded-lg',
          'bg-neutral-900/70 backdrop-blur-xl',
          'border border-neutral-700',
          'text-neutral-50 placeholder:text-neutral-500',
          'focus:outline-none focus:ring-2 focus:ring-brand-400/50',
          'focus:border-brand-400',
          'transition-all duration-200',
          icon && 'pl-10',
          error && 'border-red-500 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};
```


#### Badge Component

**Interface:**
```javascript
<Badge
  variant="safe|caution|danger|info|default"
  size="sm|md|lg"
  className={string}
>
  {children}
</Badge>
```

**Risk Variants:**
- `safe`: Green background for low risk
- `caution`: Amber background for medium risk
- `danger`: Red background for high risk
- `info`: Blue background for informational
- `default`: Neutral background

**Implementation:**
```javascript
const Badge = ({ variant = 'default', size = 'md', className, children }) => {
  const variants = {
    safe: 'bg-green-500/20 text-green-400 border-green-500/30',
    caution: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
    default: 'bg-neutral-700/50 text-neutral-300 border-neutral-600/30',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border font-medium',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
};
```

### Feature Components

#### RiskDisplay Component

**Purpose**: Display security risk assessment with visual prominence and supporting data.

**Interface:**
```javascript
<RiskDisplay
  score={number}        // 0-100 risk score
  level={string}        // 'safe' | 'caution' | 'danger'
  factors={array}       // Array of risk factors
  confidence={number}   // 0-100 confidence level
/>
```

**Layout:**
```
┌─────────────────────────────────────┐
│  Risk Score: 85                     │
│  ████████████████░░░░ 85/100        │
│                                     │
│  Level: High Risk                   │
│  Confidence: 92%                    │
│                                     │
│  Risk Factors:                      │
│  ⚠ Suspicious domain age            │
│  ⚠ Unusual hosting location         │
│  ⚠ No HTTPS certificate             │
└─────────────────────────────────────┘
```

**Implementation Details:**
- Large risk score (text-5xl font) with color-coded background
- Progress bar or radial chart showing score out of 100
- Risk level badge (safe/caution/danger)
- Supporting metrics in grid layout
- Risk factors list with icons and severity indicators
- Glassmorphism card container


#### InsightsPanel Component

**Purpose**: Dashboard-style panel displaying key security metrics and trends.

**Interface:**
```javascript
<InsightsPanel
  title={string}
  metrics={array}       // Array of metric objects
  chart={ReactNode}     // Optional chart component
  trend={object}        // Trend data with direction and percentage
/>
```

**Metric Object Structure:**
```javascript
{
  label: 'Total Analyses',
  value: 247,
  icon: <Activity />,
  change: '+12%',
  changeType: 'positive'
}
```

**Layout Example:**
```
┌─────────────────────────────────────┐
│  Recent Analysis Summary            │
│                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │ 247  │  │ 89%  │  │ 23   │     │
│  │Total │  │Safe  │  │Today │     │
│  └──────┘  └──────┘  └──────┘     │
│                                     │
│  [Bar Chart: Risk Distribution]    │
└─────────────────────────────────────┘
```

#### MetricCard Component

**Purpose**: Individual metric display with icon, value, and trend.

**Interface:**
```javascript
<MetricCard
  label={string}
  value={string|number}
  icon={ReactNode}
  trend={object}        // { direction: 'up'|'down', value: '12%' }
  variant="default|success|warning|danger"
/>
```

**Implementation:**
```javascript
const MetricCard = ({ label, value, icon, trend, variant = 'default' }) => {
  return (
    <Card variant="subtle" padding="md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-neutral-50">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className="text-sm text-neutral-400">{trend.value}</span>
            </div>
          )}
        </div>
        <div className="text-brand-400">
          {icon}
        </div>
      </div>
    </Card>
  );
};
```


#### RiskChart Component

**Purpose**: Visualize risk distribution across analysis history.

**Interface:**
```javascript
<RiskChart
  data={array}          // Array of { date, safe, caution, danger }
  type="bar|line|pie"
  height={number}
/>
```

**Implementation with recharts:**
```javascript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const RiskChart = ({ data, type = 'bar', height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <XAxis 
          dataKey="date" 
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            backdropFilter: 'blur(12px)',
          }}
          labelStyle={{ color: '#f9fafb' }}
        />
        <Bar dataKey="safe" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="caution" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="danger" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

**Dark Theme Styling:**
- Chart background: transparent
- Grid lines: neutral-800
- Axis labels: neutral-400
- Tooltip: glassmorphism card
- Colors: semantic risk colors (green, amber, red)

#### GeoMap Component Enhancement

**Current Implementation**: Already uses MapLibre GL with custom markers.

**Enhancements Needed:**
1. Dark theme map style (CARTO Dark Matter or custom)
2. Glassmorphism info overlay for coordinates
3. Custom marker with brand colors and glow effect
4. Enhanced popup styling with dark theme
5. Loading skeleton with glassmorphism

**Updated Map Style:**
```javascript
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
```

**Enhanced Marker:**
```javascript
<Marker longitude={lon} latitude={lat}>
  <div className="relative">
    {/* Pulsing glow effect */}
    <div className="absolute inset-0 w-10 h-10 bg-brand-400/30 rounded-full animate-ping" />
    
    {/* Main marker */}
    <div className="relative w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full border-2 border-white shadow-glow-brand flex items-center justify-center">
      <div className="w-2.5 h-2.5 bg-white rounded-full" />
    </div>
  </div>
</Marker>
```


#### LoadingState Component

**Purpose**: Elegant loading states with skeleton screens and glassmorphism.

**Interface:**
```javascript
<LoadingState
  type="skeleton|spinner|progress"
  message={string}
  progress={number}     // 0-100 for progress type
/>
```

**Skeleton Implementation:**
```javascript
import { Skeleton } from './ui/skeleton';

const AnalysisResultSkeleton = () => {
  return (
    <Card variant="default" padding="lg">
      <div className="space-y-4">
        {/* Risk score skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        
        {/* Metrics skeleton */}
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        
        {/* Chart skeleton */}
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </Card>
  );
};
```

**Skeleton Styling:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(31, 41, 55, 0.5) 0%,
    rgba(55, 65, 81, 0.5) 50%,
    rgba(31, 41, 55, 0.5) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### ErrorDisplay Component

**Purpose**: User-friendly error messages with glassmorphism styling.

**Interface:**
```javascript
<ErrorDisplay
  title={string}
  message={string}
  action={object}       // { label, onClick }
  variant="error|warning|info"
/>
```

**Implementation:**
```javascript
const ErrorDisplay = ({ title, message, action, variant = 'error' }) => {
  const icons = {
    error: <AlertCircle className="h-6 w-6" />,
    warning: <AlertTriangle className="h-6 w-6" />,
    info: <Info className="h-6 w-6" />,
  };
  
  const colors = {
    error: 'text-red-400 border-red-500/30 bg-red-500/10',
    warning: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    info: 'text-brand-400 border-brand-500/30 bg-brand-500/10',
  };
  
  return (
    <Card variant="subtle" className={cn('border-l-4', colors[variant])}>
      <div className="flex gap-4">
        <div className={colors[variant]}>
          {icons[variant]}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-50 mb-1">
            {title}
          </h3>
          <p className="text-neutral-300 mb-4">
            {message}
          </p>
          {action && (
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
```


### Layout Components

#### Header Component

**Purpose**: Navigation header with mobile menu and glassmorphism styling.

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────┐
│  🛡 LinkGuard    Home  Analyze  History  About     │
└─────────────────────────────────────────────────────┘
```

**Mobile Layout:**
```
┌─────────────────────────────────────────┐
│  🛡 LinkGuard              ☰            │
└─────────────────────────────────────────┘
```

**Implementation:**
```javascript
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/10">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-400" />
            <span className="text-xl font-bold text-neutral-50">LinkGuard</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/analyze">Analyze</NavLink>
            <NavLink to="/history">History</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 text-neutral-300 hover:text-neutral-50"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </Container>
      
      {/* Mobile Menu Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="bg-neutral-900/95 backdrop-blur-xl">
          <nav className="flex flex-col gap-4 mt-8">
            <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </MobileNavLink>
            <MobileNavLink to="/analyze" onClick={() => setMobileMenuOpen(false)}>
              Analyze
            </MobileNavLink>
            <MobileNavLink to="/history" onClick={() => setMobileMenuOpen(false)}>
              History
            </MobileNavLink>
            <MobileNavLink to="/about" onClick={() => setMobileMenuOpen(false)}>
              About
            </MobileNavLink>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};
```

**NavLink Styling:**
```javascript
const NavLink = ({ to, children }) => {
  return (
    <Link
      to={to}
      className="text-neutral-300 hover:text-neutral-50 transition-colors duration-200 font-medium"
    >
      {children}
    </Link>
  );
};
```


## Data Models

### Analysis Result Model

```typescript
interface AnalysisResult {
  id: string;
  url: string;
  timestamp: string;
  riskScore: number;           // 0-100
  riskLevel: 'safe' | 'caution' | 'danger';
  confidence: number;          // 0-100
  
  // Risk factors
  factors: RiskFactor[];
  
  // Domain information
  domain: {
    name: string;
    age: number;              // days
    registrar: string;
    ssl: boolean;
  };
  
  // Geographic data
  geographic: {
    ip: string;
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    countryCode: string;
  };
  
  // Network intelligence
  network: {
    isp: string;
    asn: string;
    organization: string;
    isProxy: boolean;
    isHosting: boolean;
    isMobile: boolean;
    isVPN: boolean;
  };
}

interface RiskFactor {
  id: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  description: string;
  icon: string;              // lucide-react icon name
}
```

### Insights Data Model

```typescript
interface InsightsData {
  summary: {
    totalAnalyses: number;
    safeCount: number;
    cautionCount: number;
    dangerCount: number;
    todayCount: number;
  };
  
  trends: {
    period: 'day' | 'week' | 'month';
    data: TrendDataPoint[];
  };
  
  riskDistribution: {
    safe: number;            // percentage
    caution: number;         // percentage
    danger: number;          // percentage
  };
  
  recentActivity: AnalysisResult[];
}

interface TrendDataPoint {
  date: string;
  safe: number;
  caution: number;
  danger: number;
}
```

### History Filter Model

```typescript
interface HistoryFilters {
  riskLevel: 'all' | 'safe' | 'caution' | 'danger';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchQuery: string;
  sortBy: 'date' | 'risk' | 'domain';
  sortOrder: 'asc' | 'desc';
}
```


## Error Handling

### Error Categories

1. **Network Errors**: API unavailable, timeout, connection issues
2. **Validation Errors**: Invalid URL format, empty input
3. **Analysis Errors**: Unable to resolve domain, geographic lookup failed
4. **Authentication Errors**: Session expired, unauthorized access
5. **Rate Limiting**: Too many requests

### Error Handling Strategy

#### User-Facing Error Messages

**Principle**: Use clear, non-technical language that explains what happened and what the user can do.

**Examples:**

```javascript
const errorMessages = {
  // Network errors
  'NETWORK_ERROR': {
    title: 'Connection Issue',
    message: 'We couldn\'t reach our servers. Please check your internet connection and try again.',
    action: { label: 'Retry', onClick: retryAnalysis }
  },
  
  // Validation errors
  'INVALID_URL': {
    title: 'Invalid URL',
    message: 'Please enter a valid URL starting with http:// or https://',
    variant: 'warning'
  },
  
  // Analysis errors
  'DOMAIN_NOT_FOUND': {
    title: 'Domain Not Found',
    message: 'We couldn\'t find information about this domain. It may not exist or be unreachable.',
    variant: 'warning'
  },
  
  // Rate limiting
  'RATE_LIMIT': {
    title: 'Too Many Requests',
    message: 'You\'ve reached the analysis limit. Please wait a moment before trying again.',
    variant: 'warning'
  }
};
```

#### Error Boundary Implementation

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service (e.g., Sentry)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
          <Card variant="elevated" className="max-w-md">
            <ErrorDisplay
              title="Something Went Wrong"
              message="We encountered an unexpected error. Please refresh the page to continue."
              action={{
                label: 'Refresh Page',
                onClick: () => window.location.reload()
              }}
              variant="error"
            />
          </Card>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

#### API Error Handling

```javascript
// api.js
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return { type: 'VALIDATION_ERROR', message: data.message };
      case 401:
        return { type: 'AUTH_ERROR', message: 'Please log in to continue' };
      case 429:
        return { type: 'RATE_LIMIT', message: 'Too many requests' };
      case 500:
        return { type: 'SERVER_ERROR', message: 'Server error occurred' };
      default:
        return { type: 'UNKNOWN_ERROR', message: 'An error occurred' };
    }
  } else if (error.request) {
    // Request made but no response
    return { type: 'NETWORK_ERROR', message: 'Network connection failed' };
  } else {
    // Error setting up request
    return { type: 'CLIENT_ERROR', message: error.message };
  }
};
```


### Form Validation

**Real-time Validation Strategy:**

```javascript
const validateUrl = (url) => {
  if (!url || url.trim() === '') {
    return { valid: false, error: 'URL is required' };
  }
  
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must start with http:// or https://' };
    }
    return { valid: true, error: null };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
};

// Usage in component
const [url, setUrl] = useState('');
const [error, setError] = useState(null);

const handleUrlChange = (e) => {
  const value = e.target.value;
  setUrl(value);
  
  // Clear error on input
  if (error) setError(null);
};

const handleSubmit = (e) => {
  e.preventDefault();
  
  const validation = validateUrl(url);
  if (!validation.valid) {
    setError(validation.error);
    return;
  }
  
  // Proceed with analysis
  analyzeUrl(url);
};
```

### Graceful Degradation

**Glassmorphism Fallback:**

```css
/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(12px)) {
  .glass-card {
    background: rgba(17, 24, 39, 0.95);  /* Higher opacity */
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
}
```

**Map Fallback:**

Already implemented in GeoMap.js:
1. Check WebGL support
2. If unavailable, show StaticMap component
3. If map loading fails, show fallback with retry option

**Chart Fallback:**

```javascript
const RiskChart = ({ data }) => {
  const [chartError, setChartError] = useState(false);
  
  if (chartError) {
    return (
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.date} className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">{item.date}</span>
            <div className="flex-1 flex gap-1">
              <div 
                className="h-6 bg-green-500/50 rounded"
                style={{ width: `${item.safe}%` }}
              />
              <div 
                className="h-6 bg-amber-500/50 rounded"
                style={{ width: `${item.caution}%` }}
              />
              <div 
                className="h-6 bg-red-500/50 rounded"
                style={{ width: `${item.danger}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      {/* Chart implementation */}
    </ResponsiveContainer>
  );
};
```


## Testing Strategy

### Overview

This UI/UX redesign project requires a testing strategy focused on visual consistency, component behavior, accessibility, and user experience. **Property-based testing is NOT applicable** for this project because:

1. **UI Rendering**: Testing visual appearance and layout is not suitable for property-based testing
2. **Component Behavior**: UI interactions are best tested with example-based scenarios
3. **Styling and Theming**: Visual design requires snapshot tests and manual review
4. **No Complex Business Logic**: The redesign focuses on presentation, not algorithmic correctness

### Testing Approach

#### 1. Component Unit Tests (Example-Based)

**Purpose**: Verify individual component behavior with specific scenarios.

**Tools**: Jest + React Testing Library

**Coverage Areas:**
- Component rendering with different props
- User interactions (clicks, form inputs, keyboard navigation)
- Conditional rendering based on state
- Event handler execution
- Accessibility attributes (ARIA labels, roles)

**Example Test:**
```javascript
// Button.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders with children text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
  
  test('shows loading spinner when loading prop is true', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('disabled');
    // Verify spinner is present
  });
  
  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand-500');
    
    rerender(<Button variant="danger">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });
  
  test('meets minimum touch target size', () => {
    render(<Button size="md">Button</Button>);
    const button = screen.getByRole('button');
    const styles = window.getComputedStyle(button);
    const height = parseInt(styles.height);
    expect(height).toBeGreaterThanOrEqual(44);
  });
});
```


#### 2. Visual Regression Tests (Snapshot Testing)

**Purpose**: Detect unintended visual changes in components and layouts.

**Tools**: Jest snapshots or Storybook with Chromatic

**Coverage Areas:**
- Component rendering with different props and states
- Responsive layouts at different breakpoints
- Dark theme styling
- Glassmorphism effects
- Typography and spacing

**Example Test:**
```javascript
// Card.test.js
import { render } from '@testing-library/react';
import Card from './Card';

describe('Card Visual Snapshots', () => {
  test('renders default variant correctly', () => {
    const { container } = render(
      <Card variant="default">
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
  
  test('renders elevated variant correctly', () => {
    const { container } = render(
      <Card variant="elevated">Content</Card>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
  
  test('renders with different padding sizes', () => {
    const { container } = render(
      <Card padding="lg">Large padding content</Card>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

**Storybook Stories for Visual Testing:**
```javascript
// Card.stories.js
export default {
  title: 'Components/Card',
  component: Card,
};

export const Default = () => (
  <Card variant="default">
    <h3 className="text-xl font-bold mb-2">Default Card</h3>
    <p className="text-neutral-300">This is a default glassmorphism card.</p>
  </Card>
);

export const Elevated = () => (
  <Card variant="elevated">
    <h3 className="text-xl font-bold mb-2">Elevated Card</h3>
    <p className="text-neutral-300">This card has enhanced glassmorphism.</p>
  </Card>
);

export const AllVariants = () => (
  <div className="space-y-4 bg-neutral-950 p-8">
    <Card variant="default">Default</Card>
    <Card variant="elevated">Elevated</Card>
    <Card variant="subtle">Subtle</Card>
  </div>
);
```


#### 3. Accessibility Tests

**Purpose**: Ensure WCAG 2.1 Level AA compliance and screen reader compatibility.

**Tools**: jest-axe, @testing-library/react

**Coverage Areas:**
- Color contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text)
- Keyboard navigation and focus management
- ARIA labels and roles
- Semantic HTML structure
- Screen reader announcements

**Example Test:**
```javascript
// Button.a11y.test.js
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from './Button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(<Button>Click Me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('icon-only button has aria-label', async () => {
    const { container } = render(
      <Button size="icon" aria-label="Close dialog">
        <X />
      </Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('disabled button is not keyboard focusable', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
```

**Contrast Testing:**
```javascript
// contrast.test.js
import { getContrast } from 'polished';

describe('Color Contrast Compliance', () => {
  test('primary text on dark background meets WCAG AA', () => {
    const textColor = '#f9fafb';  // neutral-50
    const bgColor = '#030712';    // neutral-950
    const contrast = getContrast(textColor, bgColor);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
  
  test('brand color on dark background meets WCAG AA', () => {
    const brandColor = '#38bdf8';  // brand-400
    const bgColor = '#030712';     // neutral-950
    const contrast = getContrast(brandColor, bgColor);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
  
  test('risk colors meet contrast requirements', () => {
    const bgColor = '#030712';
    
    expect(getContrast('#10b981', bgColor)).toBeGreaterThanOrEqual(4.5); // safe
    expect(getContrast('#f59e0b', bgColor)).toBeGreaterThanOrEqual(4.5); // caution
    expect(getContrast('#ef4444', bgColor)).toBeGreaterThanOrEqual(4.5); // danger
  });
});
```


#### 4. Integration Tests

**Purpose**: Test user flows and component interactions.

**Tools**: React Testing Library, MSW (Mock Service Worker) for API mocking

**Coverage Areas:**
- Complete user workflows (analyze URL, view history, navigate)
- Form submission and validation
- API integration with loading/error states
- Navigation between pages
- State persistence

**Example Test:**
```javascript
// AnalysisFlow.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from './App';

const server = setupServer(
  rest.post('/api/analyze', (req, res, ctx) => {
    return res(ctx.json({
      riskScore: 25,
      riskLevel: 'safe',
      domain: { name: 'example.com' },
      // ... full response
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('URL Analysis Flow', () => {
  test('user can analyze a URL and see results', async () => {
    render(<App />);
    
    // Navigate to analyze page
    fireEvent.click(screen.getByText('Analyze'));
    
    // Enter URL
    const input = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(input, { target: { value: 'https://example.com' } });
    
    // Submit form
    fireEvent.click(screen.getByText(/analyze/i));
    
    // Wait for loading state
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/risk score/i)).toBeInTheDocument();
    });
    
    // Verify risk display
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText(/safe/i)).toBeInTheDocument();
  });
  
  test('shows error message when API fails', async () => {
    server.use(
      rest.post('/api/analyze', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    render(<App />);
    
    // Submit analysis
    const input = screen.getByPlaceholderText(/enter url/i);
    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByText(/analyze/i));
    
    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
```


#### 5. Responsive Design Tests

**Purpose**: Verify layouts adapt correctly across breakpoints.

**Tools**: React Testing Library with viewport mocking

**Coverage Areas:**
- Mobile layout (< 640px)
- Tablet layout (640px - 1024px)
- Desktop layout (> 1024px)
- Touch target sizes on mobile
- Navigation menu behavior

**Example Test:**
```javascript
// Responsive.test.js
import { render, screen } from '@testing-library/react';
import Header from './Header';

const setViewport = (width) => {
  global.innerWidth = width;
  global.dispatchEvent(new Event('resize'));
};

describe('Header Responsive Behavior', () => {
  test('shows mobile menu button on small screens', () => {
    setViewport(375);
    render(<Header />);
    
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeVisible();
  });
  
  test('shows desktop navigation on large screens', () => {
    setViewport(1024);
    render(<Header />);
    
    expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeVisible();
  });
});
```

#### 6. Performance Tests

**Purpose**: Ensure fast load times and smooth interactions.

**Tools**: Lighthouse CI, React DevTools Profiler

**Metrics:**
- Lighthouse Performance Score > 80 on mobile
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Cumulative Layout Shift < 0.1
- Bundle size monitoring

**Implementation:**
```javascript
// lighthouse-ci.config.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: ['http://localhost:3000/', 'http://localhost:3000/analyze'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
      },
    },
  },
};
```


#### 7. Manual Testing Checklist

**Visual Design:**
- [ ] Glassmorphism effects render correctly across browsers
- [ ] Dark theme colors are consistent throughout
- [ ] Typography hierarchy is clear and readable
- [ ] Spacing and alignment are consistent
- [ ] Icons are properly sized and colored
- [ ] Animations are smooth and not distracting

**Responsive Design:**
- [ ] Mobile layout (375px, 414px)
- [ ] Tablet layout (768px, 1024px)
- [ ] Desktop layout (1440px, 1920px)
- [ ] Landscape orientation on mobile
- [ ] Touch targets are minimum 44x44px

**Accessibility:**
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators are visible
- [ ] Screen reader announces content correctly (test with NVDA/JAWS)
- [ ] Color contrast meets WCAG AA standards
- [ ] Reduced motion preference is respected

**Browser Compatibility:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Performance:**
- [ ] Initial page load < 1 second on fast connection
- [ ] Smooth scrolling and animations (60fps)
- [ ] No layout shifts during load
- [ ] Images load progressively
- [ ] Charts render without blocking UI

### Test Coverage Goals

- **Unit Tests**: 80% coverage for components
- **Integration Tests**: All critical user flows
- **Accessibility Tests**: 100% of interactive components
- **Visual Regression**: All components with variants
- **Manual Testing**: Complete checklist before release

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run accessibility tests
        run: npm run test:a11y
      
      - name: Build application
        run: npm run build
      
      - name: Run Lighthouse CI
        run: npm run lighthouse:ci
```


## Implementation Phases

### Phase 1: Foundation Setup (Week 1)

**Goals**: Establish design system foundation and core infrastructure.

**Tasks:**
1. Update Tailwind configuration with dark theme tokens
2. Install and configure shadcn/ui components
3. Set up glassmorphism CSS utilities
4. Configure typography system
5. Install lucide-react and remove emoji usage
6. Set up Storybook for component development
7. Configure testing infrastructure (Jest, RTL, jest-axe)

**Deliverables:**
- Updated `tailwind.config.js` with complete design tokens
- shadcn/ui components installed and configured
- Storybook running with dark theme
- Test setup complete

### Phase 2: Core Component Refactoring (Week 2)

**Goals**: Refactor existing components to use shadcn/ui and apply new design system.

**Tasks:**
1. Refactor Button component with shadcn/ui primitives
2. Refactor Card component with glassmorphism
3. Refactor Input component with dark theme styling
4. Refactor Badge component for risk indicators
5. Create LoadingState and Skeleton components
6. Create ErrorDisplay component
7. Write unit tests for all refactored components

**Deliverables:**
- All core UI components refactored
- Component tests passing
- Storybook stories for each component

### Phase 3: Layout and Navigation (Week 3)

**Goals**: Implement responsive layouts and navigation patterns.

**Tasks:**
1. Create Header component with mobile menu
2. Implement mobile navigation drawer with Sheet component
3. Create Container and layout components
4. Implement responsive breakpoint behavior
5. Add smooth animations and transitions
6. Test navigation on mobile and desktop
7. Verify accessibility of navigation

**Deliverables:**
- Responsive header with mobile menu
- Layout components complete
- Navigation tests passing


### Phase 4: Data Visualization Components (Week 4)

**Goals**: Implement insights panels, charts, and metrics displays.

**Tasks:**
1. Install and configure recharts library
2. Create MetricCard component
3. Create RiskChart component with dark theme
4. Create InsightsPanel component
5. Create TrendIndicator component
6. Implement responsive chart behavior
7. Add chart fallbacks for accessibility
8. Write tests for visualization components

**Deliverables:**
- All data visualization components complete
- Charts working with dark theme
- Responsive behavior verified
- Component tests passing

### Phase 5: Feature Components (Week 5)

**Goals**: Build analysis-specific components with new design system.

**Tasks:**
1. Create enhanced RiskDisplay component
2. Create RiskFactors list component
3. Create AnalysisResult component
4. Enhance GeoMap with dark theme and glassmorphism
5. Create NetworkInfo component
6. Implement AnalysisForm with validation
7. Add loading states for all components
8. Write integration tests for analysis flow

**Deliverables:**
- All analysis components complete
- Analysis flow working end-to-end
- Integration tests passing

### Phase 6: History Dashboard (Week 6)

**Goals**: Implement history dashboard with insights and filtering.

**Tasks:**
1. Create HistoryDashboard layout
2. Create HistoryItem component
3. Create HistoryFilters component
4. Implement filtering and sorting logic
5. Add insights panels to history page
6. Implement pagination or infinite scroll
7. Add bulk actions with confirmation dialogs
8. Write tests for history functionality

**Deliverables:**
- History dashboard complete
- Filtering and sorting working
- Tests passing


### Phase 7: Polish and Optimization (Week 7)

**Goals**: Refine animations, optimize performance, ensure accessibility.

**Tasks:**
1. Add micro-interactions and hover effects
2. Implement smooth page transitions
3. Optimize bundle size with code splitting
4. Optimize images and assets
5. Run Lighthouse audits and fix issues
6. Conduct accessibility audit with screen readers
7. Test on multiple browsers and devices
8. Fix any visual inconsistencies

**Deliverables:**
- Lighthouse performance score > 80
- Accessibility score > 90
- All animations smooth and polished
- Cross-browser compatibility verified

### Phase 8: Documentation and Handoff (Week 8)

**Goals**: Document design system and components for maintainability.

**Tasks:**
1. Document all design tokens in README
2. Write JSDoc comments for all components
3. Create component usage examples in Storybook
4. Document glassmorphism patterns
5. Document responsive behavior guidelines
6. Create accessibility documentation
7. Write migration guide from old components
8. Create component showcase page

**Deliverables:**
- Complete design system documentation
- Component API documentation
- Migration guide
- Component showcase page

## Migration Strategy

### Backward Compatibility

**Approach**: Maintain backward compatibility during migration by:

1. **Wrapper Components**: New shadcn/ui-based components wrap old APIs
2. **Prop Mapping**: Old prop names map to new shadcn/ui props
3. **Gradual Migration**: Migrate pages one at a time
4. **Deprecation Warnings**: Console warnings for deprecated usage

**Example:**
```javascript
// Button.js - Maintains old API while using new implementation
const Button = ({ variant, size, ...props }) => {
  // Map old variants to new
  const variantMap = {
    primary: 'default',
    secondary: 'secondary',
    danger: 'destructive',
  };
  
  return <ShadcnButton variant={variantMap[variant]} {...props} />;
};
```

### Migration Checklist

**Per Page:**
- [ ] Replace Button components
- [ ] Replace Card components
- [ ] Replace Input components
- [ ] Replace Badge components
- [ ] Update icon usage (emoji → lucide-react)
- [ ] Apply glassmorphism styling
- [ ] Test responsive behavior
- [ ] Verify accessibility
- [ ] Run visual regression tests


## Design System Documentation

### Color Usage Guidelines

**Background Hierarchy:**
```
Level 1 (Page): neutral-950
Level 2 (Cards): neutral-900/70 with glassmorphism
Level 3 (Elevated): neutral-800/80 with glassmorphism
```

**Text Hierarchy:**
```
Primary (Headings): neutral-50
Secondary (Body): neutral-300
Tertiary (Muted): neutral-400
Disabled: neutral-500
```

**Interactive States:**
```
Default: brand-400
Hover: brand-500
Active: brand-600
Focus: brand-400 with ring
Disabled: neutral-600 with reduced opacity
```

**Semantic Colors:**
```
Success/Safe: green-500
Warning/Caution: amber-500
Error/Danger: red-500
Info: brand-500
```

### Typography Guidelines

**Heading Scale:**
```
Hero Display: text-6xl (60px), font-extrabold
Page Title: text-4xl (36px), font-bold
Section Heading: text-2xl (24px), font-semibold
Card Heading: text-xl (20px), font-semibold
Subheading: text-lg (18px), font-medium
```

**Body Text:**
```
Large Body: text-lg (18px), font-normal
Body: text-base (16px), font-normal
Small: text-sm (14px), font-normal
Caption: text-xs (12px), font-normal
```

**Line Height:**
```
Display: 1.1
Headings: 1.2
Body: 1.5
Captions: 1.4
```

**Font Weights:**
```
Light: 300 (subtle text)
Normal: 400 (body text)
Medium: 500 (labels, emphasis)
Semibold: 600 (subheadings)
Bold: 700 (headings)
Extrabold: 800 (hero text)
```


### Spacing Guidelines

**Component Internal Spacing:**
```
Tight: space-y-1 (4px) - Related items
Default: space-y-2 (8px) - Form fields
Comfortable: space-y-4 (16px) - Card content
Spacious: space-y-6 (24px) - Sections
```

**Layout Spacing:**
```
Section Padding: p-8 (32px) mobile, p-12 (48px) desktop
Card Padding: p-6 (24px) default
Container Max Width: max-w-7xl (1280px)
Grid Gap: gap-4 (16px) mobile, gap-6 (24px) desktop
```

**Touch Targets:**
```
Minimum: 44x44px (11 rem)
Comfortable: 48x48px (12 rem)
Large: 56x56px (14 rem)
```

### Animation Guidelines

**Duration:**
```
Instant: 100ms - Feedback
Fast: 200ms - Hover effects
Default: 300ms - Transitions
Slow: 500ms - Complex animations
```

**Easing:**
```
ease-in-out: Default for most transitions
ease-out: Entering elements
ease-in: Exiting elements
```

**Common Animations:**
```css
/* Hover scale */
.hover-scale {
  transition: transform 200ms ease-out;
}
.hover-scale:hover {
  transform: scale(1.05);
}

/* Fade in */
.fade-in {
  animation: fadeIn 300ms ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide in */
.slide-in {
  animation: slideIn 300ms ease-out;
}
@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Shimmer (loading) */
.shimmer {
  animation: shimmer 2s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```


### Glassmorphism Implementation Guide

**Base Pattern:**
```css
.glass-card {
  background: rgba(17, 24, 39, 0.7);  /* neutral-900 with 70% opacity */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari support */
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

**Tailwind Utility Classes:**
```javascript
// Add to tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.glass-default': {
          'background': 'rgba(17, 24, 39, 0.7)',
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-elevated': {
          'background': 'rgba(31, 41, 55, 0.8)',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.15)',
        },
        '.glass-subtle': {
          'background': 'rgba(17, 24, 39, 0.5)',
          'backdrop-filter': 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)',
          'border': '1px solid rgba(255, 255, 255, 0.05)',
        },
      });
    },
  ],
};
```

**Usage Examples:**
```jsx
// Default glassmorphism card
<div className="glass-default rounded-xl p-6">
  Content
</div>

// Elevated card with hover effect
<div className="glass-elevated rounded-xl p-6 hover:border-white/20 transition-all">
  Content
</div>

// Subtle background
<div className="glass-subtle rounded-lg p-4">
  Content
</div>
```

**Browser Fallback:**
```css
/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(12px)) {
  .glass-default {
    background: rgba(17, 24, 39, 0.95);
  }
  .glass-elevated {
    background: rgba(31, 41, 55, 0.98);
  }
  .glass-subtle {
    background: rgba(17, 24, 39, 0.85);
  }
}
```


### Icon Usage Guidelines

**Icon Library**: lucide-react

**Icon Sizes:**
```
Extra Small: h-3 w-3 (12px) - Inline with small text
Small: h-4 w-4 (16px) - Inline with body text
Default: h-5 w-5 (20px) - Buttons, labels
Medium: h-6 w-6 (24px) - Headers, emphasis
Large: h-8 w-8 (32px) - Hero sections
Extra Large: h-12 w-12 (48px) - Empty states
```

**Common Icon Mappings:**
```javascript
import {
  Shield,        // Security, protection
  Search,        // Search, analyze
  AlertCircle,   // Errors, warnings
  AlertTriangle, // Caution, warnings
  CheckCircle,   // Success, safe
  XCircle,       // Danger, errors
  Info,          // Information
  MapPin,        // Location, geographic
  Globe,         // Network, internet
  Lock,          // Security, HTTPS
  Unlock,        // Insecure
  History,       // History, past
  Trash2,        // Delete
  Copy,          // Copy to clipboard
  ExternalLink,  // External links
  TrendingUp,    // Positive trends
  TrendingDown,  // Negative trends
  Activity,      // Analytics, metrics
  BarChart3,     // Charts, data
  Menu,          // Mobile menu
  X,             // Close, dismiss
  ChevronDown,   // Dropdown, expand
  ChevronRight,  // Navigation, next
  Loader2,       // Loading spinner
} from 'lucide-react';
```

**Icon with Text:**
```jsx
<div className="flex items-center gap-2">
  <Shield className="h-5 w-5 text-brand-400" />
  <span>Secure Connection</span>
</div>
```

**Icon-Only Button:**
```jsx
<button
  className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
  aria-label="Close dialog"
>
  <X className="h-5 w-5" />
</button>
```

**Animated Loading Icon:**
```jsx
<Loader2 className="h-5 w-5 animate-spin text-brand-400" />
```


### Accessibility Implementation Checklist

**Keyboard Navigation:**
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and follows visual flow
- [ ] Focus indicators are visible (2px outline, brand-400 color)
- [ ] Skip to main content link for screen readers
- [ ] Escape key closes modals and dropdowns
- [ ] Arrow keys navigate within menus and lists

**ARIA Labels and Roles:**
- [ ] Icon-only buttons have aria-label
- [ ] Form inputs have associated labels
- [ ] Error messages have role="alert"
- [ ] Loading states have aria-live="polite"
- [ ] Modals have role="dialog" and aria-modal="true"
- [ ] Navigation has role="navigation"
- [ ] Main content has role="main"

**Color and Contrast:**
- [ ] Text contrast meets WCAG AA (4.5:1 for normal, 3:1 for large)
- [ ] Color is not the only means of conveying information
- [ ] Focus indicators have sufficient contrast
- [ ] Disabled states are visually distinct
- [ ] Error states use icons in addition to color

**Screen Reader Support:**
- [ ] Semantic HTML elements used (header, nav, main, footer)
- [ ] Headings follow logical hierarchy (h1 → h2 → h3)
- [ ] Images have alt text
- [ ] Charts have text alternatives
- [ ] Loading states announce to screen readers
- [ ] Error messages are announced

**Motion and Animation:**
- [ ] Animations respect prefers-reduced-motion
- [ ] No auto-playing animations longer than 5 seconds
- [ ] Parallax and motion effects can be disabled
- [ ] Loading spinners don't cause seizures (no rapid flashing)

**Forms:**
- [ ] Required fields are marked with aria-required
- [ ] Error messages are associated with inputs (aria-describedby)
- [ ] Validation feedback is immediate and clear
- [ ] Success states are announced to screen readers
- [ ] Autocomplete attributes are used appropriately


## Performance Optimization Strategy

### Bundle Size Optimization

**Code Splitting:**
```javascript
// Lazy load route components
const Home = lazy(() => import('./pages/Home'));
const Analyze = lazy(() => import('./pages/Analyze'));
const History = lazy(() => import('./pages/History'));
const About = lazy(() => import('./pages/About'));

// Lazy load heavy components
const RiskChart = lazy(() => import('./components/insights/RiskChart'));
const GeoMap = lazy(() => import('./components/geographic/GeoMap'));
```

**Icon Optimization:**
```javascript
// Import only used icons
import { Shield, Search, AlertCircle } from 'lucide-react';

// Instead of:
// import * from 'lucide-react';
```

**Tailwind CSS Purging:**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // Purge unused classes in production
};
```

### Image Optimization

**Responsive Images:**
```jsx
<img
  src="/images/hero-mobile.jpg"
  srcSet="/images/hero-mobile.jpg 640w,
          /images/hero-tablet.jpg 1024w,
          /images/hero-desktop.jpg 1920w"
  sizes="(max-width: 640px) 640px,
         (max-width: 1024px) 1024px,
         1920px"
  alt="Hero image"
  loading="lazy"
/>
```

**WebP Format:**
```jsx
<picture>
  <source srcSet="/images/hero.webp" type="image/webp" />
  <source srcSet="/images/hero.jpg" type="image/jpeg" />
  <img src="/images/hero.jpg" alt="Hero image" />
</picture>
```

### Rendering Optimization

**Memoization:**
```javascript
// Memoize expensive components
const MetricCard = memo(({ label, value, icon }) => {
  return (
    <Card>
      {/* Component content */}
    </Card>
  );
});

// Memoize expensive calculations
const riskDistribution = useMemo(() => {
  return calculateRiskDistribution(historyData);
}, [historyData]);
```

**Virtual Scrolling:**
```javascript
// For large history lists
import { FixedSizeList } from 'react-window';

const HistoryList = ({ items }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <HistoryItem item={items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

### Network Optimization

**API Request Caching:**
```javascript
// Cache analysis results
const cache = new Map();

const analyzeUrl = async (url) => {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const result = await api.post('/analyze', { url });
  cache.set(url, result);
  return result;
};
```

**Debounced Search:**
```javascript
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((query) => {
    performSearch(query);
  }, 300),
  []
);
```

### Lighthouse Optimization Targets

**Performance:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Total Blocking Time: < 300ms

**Best Practices:**
- HTTPS enabled
- No console errors
- Images have proper dimensions
- No deprecated APIs used

**SEO:**
- Meta descriptions present
- Proper heading hierarchy
- Descriptive link text
- Mobile-friendly viewport


## Security Considerations

### Content Security Policy

```javascript
// Add to index.html or server configuration
const csp = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'", "data:"],
  "connect-src": ["'self'", process.env.REACT_APP_API_URL],
  "frame-ancestors": ["'none'"],
};
```

### Input Sanitization

```javascript
// Sanitize user input before display
import DOMPurify from 'dompurify';

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

// Usage
const displayUrl = sanitizeInput(userInputUrl);
```

### XSS Prevention

```javascript
// Always use React's built-in escaping
<div>{userInput}</div>  // Safe - React escapes by default

// Avoid dangerouslySetInnerHTML unless absolutely necessary
// If needed, sanitize first:
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

### API Security

```javascript
// Include CSRF token in requests
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'X-CSRF-Token': getCsrfToken(),
  },
});

// Validate responses
const validateResponse = (response) => {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response format');
  }
  return response;
};
```

## Browser Support

### Target Browsers

**Desktop:**
- Chrome 90+ (latest 2 versions)
- Firefox 88+ (latest 2 versions)
- Safari 14+ (latest 2 versions)
- Edge 90+ (latest 2 versions)

**Mobile:**
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

### Polyfills

```javascript
// Add to index.js if needed
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

### Feature Detection

```javascript
// Check for backdrop-filter support
const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');

// Check for WebGL support (for maps)
const supportsWebGL = (() => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
})();
```


## Deployment Considerations

### Environment Variables

```bash
# .env.example
REACT_APP_API_URL=https://api.linkguard.com
REACT_APP_MAP_STYLE_URL=https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_VERSION=$npm_package_version
```

### Build Configuration

```javascript
// package.json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:analyze": "npm run build && source-map-explorer 'build/static/js/*.js'",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "test:a11y": "jest --testMatch='**/*.a11y.test.js'",
    "lighthouse:ci": "lhci autorun",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### Production Optimizations

```javascript
// Ensure production build optimizations
if (process.env.NODE_ENV === 'production') {
  // Disable console logs
  console.log = () => {};
  console.warn = () => {};
  
  // Enable React production mode
  // (automatically done by Create React App)
}
```

### CDN Configuration

```javascript
// Serve static assets from CDN
const CDN_URL = process.env.REACT_APP_CDN_URL;

const getAssetUrl = (path) => {
  return process.env.NODE_ENV === 'production'
    ? `${CDN_URL}${path}`
    : path;
};
```

### Monitoring and Analytics

```javascript
// Error tracking (e.g., Sentry)
import * as Sentry from '@sentry/react';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric) => {
  // Send to analytics service
  console.log(metric);
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```


## Appendix

### shadcn/ui Installation Commands

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add sheet
```

### Additional Dependencies

```bash
# Data visualization
npm install recharts

# Icons (already installed)
# npm install lucide-react

# Utilities (already installed)
# npm install clsx tailwind-merge

# Testing
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event
npm install --save-dev jest-axe
npm install --save-dev msw

# Performance monitoring
npm install web-vitals

# Storybook
npx storybook@latest init
```

### Useful Resources

**Design Inspiration:**
- Dribbble DeFi Landing Page (Shot #24287189)
- [Glassmorphism Generator](https://hype4.academy/tools/glassmorphism-generator)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)

**Component Libraries:**
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Recharts Documentation](https://recharts.org/)

**Accessibility:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

**Testing:**
- [React Testing Library](https://testing-library.com/react)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [MSW Documentation](https://mswjs.io/)

**Performance:**
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/source-map-explorer)


### Component API Reference

#### Button

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}
```

#### Card

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}
```

#### Input

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'url' | 'password';
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}
```

#### Badge

```typescript
interface BadgeProps {
  variant?: 'safe' | 'caution' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}
```

#### RiskDisplay

```typescript
interface RiskDisplayProps {
  score: number;           // 0-100
  level: 'safe' | 'caution' | 'danger';
  factors: RiskFactor[];
  confidence: number;      // 0-100
}

interface RiskFactor {
  id: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  description: string;
  icon: string;
}
```

#### MetricCard

```typescript
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}
```

#### RiskChart

```typescript
interface RiskChartProps {
  data: TrendDataPoint[];
  type?: 'bar' | 'line' | 'pie';
  height?: number;
}

interface TrendDataPoint {
  date: string;
  safe: number;
  caution: number;
  danger: number;
}
```

#### LoadingState

```typescript
interface LoadingStateProps {
  type?: 'skeleton' | 'spinner' | 'progress';
  message?: string;
  progress?: number;      // 0-100 for progress type
}
```

#### ErrorDisplay

```typescript
interface ErrorDisplayProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'error' | 'warning' | 'info';
}
```

---

## Summary

This design document provides a comprehensive blueprint for transforming LinkGuard into a premium, data-driven security analysis platform. The redesign focuses on:

1. **Visual Excellence**: Dark theme with glassmorphism effects, sophisticated typography, and professional iconography
2. **Data-Driven UX**: Prominent metrics, charts, and insights panels that make security analysis transparent and understandable
3. **Mobile-First Design**: Responsive layouts that work seamlessly across devices with touch-optimized interactions
4. **Accessibility**: WCAG 2.1 Level AA compliance with keyboard navigation, screen reader support, and proper contrast ratios
5. **Performance**: Optimized bundle size, lazy loading, and smooth animations targeting Lighthouse score > 80
6. **Maintainability**: shadcn/ui component foundation, comprehensive documentation, and clear design system guidelines

The implementation follows an 8-week phased approach with clear deliverables, testing strategies, and migration paths to ensure a smooth transition from the current design to the new premium interface.


# InsightIQ - UI Design System Specification
**Version:** 1.0  
**Last Updated:** November 30, 2024  
**Theme:** Navy Sage (Dark Mode Default)

---

## 🎨 Color Palette

### Primary Colors
```
Navy Slate:     #1e293b  (Tailwind: slate-800)
Soft Cyan:      #0891b2  (Tailwind: cyan-600)
Deep Cyan:      #0e7490  (Tailwind: cyan-700)
```

### Gradient Definition
```css
/* Primary Gradient */
background: linear-gradient(to right, #334155, #0891b2);
/* Tailwind: from-slate-700 to-cyan-700 */
```

### Accent Colors
```
Cyan Accent:    #06b6d4  (Tailwind: cyan-500)
Light Cyan:     #22d3ee  (Tailwind: cyan-400)
```

### Semantic Colors
```
Success:        #10b981  (Tailwind: emerald-500)
Warning:        #f59e0b  (Tailwind: amber-500)
Error:          #ef4444  (Tailwind: red-500)
Info:           #3b82f6  (Tailwind: blue-500)
```

### Neutrals (Dark Theme)
```
Background:     #0f172a  (Tailwind: slate-900)
Surface:        #1e293b  (Tailwind: slate-800)
Card:           #1e293b/50 + backdrop-blur (slate-800/50)
Border:         #334155/30 (slate-700/30)
Text Primary:   #f8fafc  (Tailwind: slate-50)
Text Secondary: #94a3b8  (Tailwind: slate-400)
```

---

## 📐 Spacing & Layout

### Container Widths
```
Max Width:      7xl (1280px)
Content Padding: 1.5rem (24px)
```

### Border Radius
```
Small:   0.5rem (8px)   - Buttons, inputs
Medium:  0.75rem (12px) - Cards, smaller components  
Large:   1rem (16px)    - Large cards
XLarge:  1.25rem (20px) - Hero sections, modals
```

### Shadows
```css
/* Default Card Shadow */
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Hover Shadow with Cyan Glow */
box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 
            0 8px 10px -6px rgb(8 145 178 / 0.2);
/* Tailwind: shadow-xl shadow-cyan-500/20 */
```

### Grid System
```
Dashboard Stats:  4 columns (lg), 2 columns (md), 1 column (sm)
Data Sources:     3 columns (lg), 2 columns (md), 1 column (sm)
Gap:             1.5rem (24px)
```

---

## 🔤 Typography

### Font Family
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
             "Segoe UI", Roboto, sans-serif;
/* Tailwind default font-sans */
```

### Font Sizes
```
Headings:
- H1: 3.75rem (60px) - Hero titles
- H2: 2.25rem (36px) - Section headers  
- H3: 1.5rem (24px)  - Card titles
- H4: 1.125rem (18px) - Subsections

Body:
- Large:   1.25rem (20px)
- Base:    1rem (16px)
- Small:   0.875rem (14px)
- XSmall:  0.75rem (12px)
```

### Font Weights
```
Light:      300
Regular:    400 (body text)
Medium:     500 (labels, navigation)
Semibold:   600 (card titles, important text)
Bold:       700 (headings, CTAs)
```

### Line Heights
```
Tight:   1.25  (headings)
Normal:  1.5   (body text)
Relaxed: 1.625 (large paragraphs)
```

---

## 🎯 Component Specifications

### Buttons

#### Primary Button (CTA)
```css
Background: gradient from-slate-700 to-cyan-700
Text: white
Padding: 0.75rem 1.5rem (12px 24px)
Border Radius: 0.75rem (12px)
Font Weight: 600 (semibold)
Hover: shadow-lg shadow-cyan-500/30 + scale(1.02)
```

#### Secondary Button
```css
Background: slate-700
Text: white
Padding: 0.75rem 1.5rem
Border Radius: 0.75rem
Font Weight: 600
Hover: bg-slate-600
```

#### Outline Button
```css
Background: transparent
Border: 2px solid slate-600
Text: slate-300
Padding: 0.75rem 1.5rem
Border Radius: 0.75rem
Hover: border-slate-500
```

### Cards

#### Standard Card
```css
Background: slate-800/50 + backdrop-blur-xl
Border: 1px solid slate-700/30
Border Radius: 1rem (16px)
Padding: 1.5rem (24px)
Shadow: default
Hover: shadow-xl shadow-cyan-500/10
Transition: all 300ms
```

#### Stat Card (Dashboard Metrics)
```
Layout: Centered content
Icon: 14x14 (w-14 h-14) at top center
  - Background: gradient from-{color}-600/20 to-{color}-600/5
  - Padding: rounded-xl
  - Icon Size: 7x7 (w-7 h-7)
Label: text-sm, slate-400, centered, margin-bottom: 0.5rem
Value: text-4xl, bold, white, centered, margin-bottom: 0.75rem
Metric: text-sm with icon (ArrowUpRight/ArrowDownRight)
  - Success: emerald-400
  - Error: red-400
  - Neutral: slate-400
```

### Navigation Sidebar

#### Dimensions
```
Expanded: 18rem (288px / w-72)
Collapsed: 5rem (80px / w-20)
Transition: all 300ms
```

#### Active State
```css
Background: gradient from-slate-700 to-cyan-700
Text: white
Shadow: shadow-lg shadow-cyan-500/20
Border Radius: 0.75rem
```

#### Inactive State
```css
Background: transparent
Text: slate-50
Hover: bg-cyan-500/10
Border Radius: 0.75rem
```

### Inputs & Forms

#### Text Input
```css
Background: slate-900/30
Border: 1px solid slate-700
Border Radius: 0.75rem (12px)
Padding: 0.75rem 1rem (12px 16px)
Text: slate-50
Placeholder: slate-500
Focus: border-cyan-500 + ring-2 ring-cyan-500/20
```

#### Textarea
```css
/* Same as text input */
Resize: none
Rows: 3 (default)
```

### Badges/Status Indicators

#### Connected/Success
```css
Background: emerald-500/10
Text: emerald-400
Border: 1px solid emerald-500/20
Border Radius: 9999px (full)
Padding: 0.25rem 0.75rem
Font Size: 0.75rem (12px)
```

#### Syncing/Warning
```css
Background: amber-500/10
Text: amber-400
Border: 1px solid amber-500/20
/* Same structure as success */
```

#### Error
```css
Background: red-500/10
Text: red-400
Border: 1px solid red-500/20
/* Same structure as success */
```

---

## ✨ Effects & Animations

### Transitions
```css
/* Default transition for all interactive elements */
transition: all 300ms ease-in-out;
```

### Hover States
```css
/* Cards */
transform: scale(1.02);
box-shadow: xl + cyan-500/10 glow;

/* Buttons */
box-shadow: lg + cyan-500/30 glow;
transform: scale(1.02);

/* Icons in cards */
transform: scale(1.1);
```

### Glassmorphism
```css
background: slate-800/50;
backdrop-filter: blur(40px);
-webkit-backdrop-filter: blur(40px);
```

---

## 🎨 Gradient Text

### Primary Gradient Text
```css
background: linear-gradient(to right, #cbd5e1, #22d3ee);
background-clip: text;
-webkit-background-clip: text;
color: transparent;
/* Tailwind: bg-gradient-to-r from-slate-300 to-cyan-400 bg-clip-text text-transparent */
```

### Usage
- Hero headlines
- Large metrics/KPIs
- Brand name in navigation

---

## 📱 Responsive Breakpoints

```
sm:  640px  (Tailwind default)
md:  768px  (Tailwind default)
lg:  1024px (Tailwind default)
xl:  1280px (Tailwind default)
2xl: 1536px (Tailwind default)
```

### Grid Breakpoints
```
Stats Cards:     lg:grid-cols-4 md:grid-cols-2 grid-cols-1
Data Sources:    lg:grid-cols-3 md:grid-cols-2 grid-cols-1
Content Columns: lg:grid-cols-2 grid-cols-1
```

---

## 🔍 Iconography

### Icon Library
**Lucide React** - https://lucide.dev/

### Icon Sizes
```
Small:  16px (w-4 h-4)   - Inline text, small buttons
Medium: 20px (w-5 h-5)   - Navigation, standard buttons
Large:  24px (w-6 h-6)   - Card headers, hero icons
XLarge: 28px (w-7 h-7)   - Stat card icons
2XL:    32px (w-8 h-8)   - Feature sections
```

### Common Icons
```
Navigation:
- Home, Database, BarChart3, Clock, Settings, LogOut

Actions:
- Upload, Download, Share2, Plus, Search, Filter

Status:
- Check, X, AlertCircle, Info, TrendingUp, TrendingDown

Data:
- FileText, Globe, Activity, Zap, Sparkles
```

---

## 📋 Page Layouts

### Landing Page
```
Structure:
1. Sticky Header (backdrop-blur)
2. Hero Section (gradient background)
3. Features Grid (3 columns)
4. How It Works (3 steps)
5. Footer

Hero Height: py-20 (80px padding)
Section Spacing: py-20 between sections
```

### Dashboard
```
Structure:
1. Welcome Card (full width)
2. Stats Grid (4 columns)
3. Quick Actions (4 columns)
4. Activity + Insights (2 columns)

Spacing: space-y-6 (24px) between sections
```

### Protected Pages
```
Layout: Sidebar + Main Content
Sidebar: Fixed, collapsible
Main: Flex-1, scrollable
Header: Sticky with backdrop blur
```

---

## 🎯 Design Principles

### 1. Professional & Subtle
- Muted color palette (Navy Sage)
- Avoid bright, flashy colors
- Enterprise-grade appearance

### 2. Data-Focused
- Clear hierarchy for metrics
- Centered, balanced stat cards
- Generous white space

### 3. Modern & Clean
- Glassmorphism effects
- Soft shadows with subtle glows
- Smooth transitions

### 4. Accessible
- High contrast ratios
- Clear visual hierarchy
- Keyboard navigation support

### 5. Consistent
- Reusable component patterns
- Standardized spacing
- Uniform border radius

---

## 📦 Component Examples

### Stat Card (Centered Layout)
```jsx
<div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/30 
                rounded-2xl p-6 hover:shadow-xl hover:shadow-cyan-500/10 
                transition-all group text-center">
  {/* Icon - Centered at top */}
  <div className="flex justify-center mb-4">
    <div className="w-14 h-14 bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 
                    rounded-xl flex items-center justify-center 
                    group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7 text-cyan-400" />
    </div>
  </div>
  
  {/* Label */}
  <p className="text-sm font-medium text-slate-400 mb-2">Label</p>
  
  {/* Value */}
  <div className="flex items-baseline justify-center space-x-1 mb-3">
    <p className="text-4xl font-bold text-slate-50">247</p>
  </div>
  
  {/* Metric with Trend */}
  <div className="flex items-center justify-center space-x-2">
    <div className="flex items-center text-emerald-400">
      <ArrowUpRight className="w-4 h-4" />
      <span className="text-sm font-medium">+18%</span>
    </div>
    <span className="text-xs text-slate-400">from last month</span>
  </div>
</div>
```

### Primary CTA Button
```jsx
<button className="bg-gradient-to-r from-slate-700 to-cyan-700 
                   text-white px-8 py-4 rounded-xl font-semibold 
                   hover:shadow-lg hover:shadow-cyan-500/30 
                   transition-all transform hover:scale-105">
  Get Started Free
</button>
```

### Navigation Item (Active)
```jsx
<button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl 
                   bg-gradient-to-r from-slate-700 to-cyan-700 text-white 
                   shadow-lg shadow-cyan-500/20">
  <Icon className="w-5 h-5" />
  <span className="font-medium">Dashboard</span>
</button>
```

---

## 🚀 Implementation Notes

### Tailwind Configuration
```javascript
// tailwind.config.js additions
module.exports = {
  theme: {
    extend: {
      colors: {
        // Navy Sage custom colors if needed
      },
      backdropBlur: {
        xl: '40px',
      }
    }
  }
}
```

### Dark Mode
- **Default Theme**: Dark
- Light mode toggle can be added later
- All color specifications above are for dark mode

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Backdrop blur fallback: solid backgrounds
- Gradient fallback: primary color

---

## 📸 Reference Screenshots

Key pages to reference:
1. ✅ Landing Page - Navy Sage hero with gradient text
2. ✅ Dashboard - Centered stat cards with trend indicators
3. ✅ Data Sources - Grid layout with status badges
4. ✅ Analysis Workspace - Query input with AI sparkles icon

---

## 🔄 Version History

**v1.0** - November 30, 2024
- Initial Navy Sage design system
- Centered stat card layout
- Dark mode as default
- Professional color palette finalized

---

## 📞 Notes for Developers

1. **Always use Tailwind classes** - avoid custom CSS when possible
2. **Maintain consistency** - reference this doc for all new components
3. **Test hover states** - all interactive elements should have feedback
4. **Mobile-first** - design for mobile, enhance for desktop
5. **Accessibility** - maintain color contrast, add ARIA labels
6. **Performance** - use backdrop-blur sparingly, optimize images

---

**End of Design System Specification**
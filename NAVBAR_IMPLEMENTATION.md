# Dynamic Navbar Implementation Guide

## Overview
The Dynamic Navbar is a custom Shopify component that renders navigation menus from metadata/backend data with full support for nested submenus, mobile responsiveness, and accessibility.

## Files Created

### 1. **`assets/navbar.js`**
- Main JavaScript component that handles menu rendering and interactions
- Supports desktop hover menus and mobile tap/click interactions
- Loads menu data from JSON metadata or API endpoints
- Full keyboard navigation support (arrow keys, escape)
- Mobile hamburger menu with animated transitions

### 2. **`blocks/_navbar-new.liquid`**
- Shopify Liquid template for the navbar block
- Responsive design with rounded corners (24px border-radius)
- Circular centered logo (60x60px by default)
- Right-aligned action buttons (search, cart, wishlist, account)
- Theme color scheme integration
- Fully configurable via Shopify settings

## Installation & Setup

### Step 1: Add the Navbar Block to Your Header Section
Add the navbar block to your `header-group.json` configuration:

```json
{
  "navbar": {
    "type": "_navbar-new",
    "settings": {
      "menu": "main-menu",
      "show_search": true,
      "show_cart": true,
      "show_wishlist": false,
      "show_account": true,
      "color_scheme": ""
    }
  }
}
```

### Step 2: Update Your Header Template
The navbar can be rendered anywhere in your header. Example:

```liquid
<navbar-component
  class="navbar"
  data-menu-data='[...]'
  {{ block.shopify_attributes }}
>
  <!-- navbar content -->
</navbar-component>
```

## Menu Data Structure

### From Shopify Menu
The navbar automatically converts Shopify menu links to the internal structure:

```json
[
  {
    "id": "men",
    "label": "Men",
    "url": "/collections/men",
    "children": [
      {
        "id": "mens-shirts",
        "label": "Shirts",
        "url": "/collections/men/shirts"
      }
    ]
  }
]
```

### From Custom API/Metadata
You can provide menu data via:

**Option 1: Data Attribute**
```html
<navbar-component
  data-menu-data='[
    {"id":"1","label":"Home","url":"/"},
    {"id":"2","label":"Shop","url":"/shop","children":[...]}
  ]'
>
</navbar-component>
```

**Option 2: API Endpoint**
```html
<navbar-component
  data-api-endpoint="/api/navbar"
>
</navbar-component>
```

## Customization

### CSS Variables
Customize the navbar appearance using CSS variables:

```css
.navbar {
  --navbar-padding: 12px;              /* Outer spacing */
  --navbar-radius: 24px;                /* Border radius */
  --navbar-height: 70px;                /* Min height */
  --navbar-logo-size: 60px;             /* Logo diameter */
  --navbar-bg: var(--color-background); /* Background color */
  --navbar-text: var(--color-foreground);/* Text color */
  --navbar-gap: 24px;                   /* Item spacing */
}
```

### Shopify Settings
The navbar block includes these configurable settings:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `menu` | link_list | main-menu | The menu to render |
| `logo_width` | range | 60 | Logo size in pixels (40-100) |
| `show_search` | checkbox | true | Display search icon |
| `show_cart` | checkbox | true | Display cart icon |
| `show_wishlist` | checkbox | false | Display wishlist icon |
| `show_account` | checkbox | true | Display account icon |
| `color_scheme` | color_scheme | - | Color scheme for navbar |

## Features

### ✅ Desktop Features
- Hover-triggered dropdown menus
- Smooth animations and transitions
- Keyboard navigation (Arrow keys to navigate, Escape to close)
- Nested submenu support
- Active link indicators

### ✅ Mobile Features
- Hamburger menu toggle button
- Animated hamburger transitions
- Expandable submenu items
- Touch-friendly interactions
- Auto-close on viewport resize

### ✅ Accessibility
- Full ARIA labels and attributes
- Keyboard navigation support
- Screen reader friendly
- Semantic HTML structure
- Focus management

### ✅ Performance
- Lazy loading of navigation JS
- Efficient DOM updates
- Debounced resize handling
- Component-based architecture

## Responsive Breakpoints

- **Mobile**: < 768px
  - Hamburger menu visible
  - Single-column menu layout
  - Simplified action buttons

- **Tablet**: 768px - 1024px
  - Compact menu spacing
  - Reduced logo size

- **Desktop**: > 1024px
  - Full navbar with hover menus
  - Expanded action buttons
  - Full-width content

## Integration with Existing Components

### With Cart Drawer
```html
<navbar-component>
  <!-- navbar content -->
  <a href="{{ routes.cart_url }}" class="navbar__action--cart">
    Cart
  </a>
</navbar-component>
```

### With Search Modal
```html
<navbar-component>
  <a href="{{ routes.search_url }}" class="navbar__action--search">
    Search
  </a>
</navbar-component>
```

### With Theme Events
The navbar component fires custom events you can listen to:

```javascript
document.addEventListener('navbar-menu-open', (e) => {
  console.log('Menu opened:', e.detail);
});
```

## Styling Examples

### Dark Mode Support
The navbar automatically adapts to dark mode via CSS media queries:

```css
@media (prefers-color-scheme: dark) {
  .navbar {
    --navbar-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}
```

### Custom Color Schemes
Create custom color schemes in your Shopify theme settings:

```css
.navbar.color-dark {
  --navbar-bg: #1a1a1a;
  --navbar-text: #ffffff;
}
```

## Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS 12+, Android Chrome 8+

## Troubleshooting

### Menu items not appearing
1. Check that menu data is valid JSON
2. Verify `ref="navList"` is present in the navbar
3. Check browser console for parsing errors

### Submenus not showing on mobile
1. Ensure the expand button has proper event listeners
2. Check that `navbar__mobile-submenu--open` class is being applied
3. Verify CSS transitions are not disabled

### Logo not circular
1. Confirm `border-radius: 50%` is applied
2. Check that logo width equals logo height
3. Verify no overflow issues with the image

## Performance Tips
- Use the `loading="eager"` attribute for the logo
- Lazy-load the navbar.js script with `fetchpriority="low"`
- Cache menu data to reduce API calls
- Minimize JavaScript event listeners

## Future Enhancements
- Mega menu layouts with product previews
- Search integration with suggestions
- Sticky navbar scroll behavior
- Animated transitions for submenus
- Multi-column menu layouts

## Support
For issues or feature requests, check the repository's issue tracker or documentation.

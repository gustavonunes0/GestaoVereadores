---
name: Lex Institucional
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434750'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#747781'
  outline-variant: '#c4c6d2'
  surface-tint: '#3d5d9e'
  primary: '#0c3474'
  on-primary: '#ffffff'
  primary-container: '#2b4c8c'
  on-primary-container: '#a4bfff'
  inverse-primary: '#afc6ff'
  secondary: '#595f66'
  on-secondary: '#ffffff'
  secondary-container: '#dee3eb'
  on-secondary-container: '#5f656c'
  tertiary: '#303842'
  on-tertiary: '#ffffff'
  tertiary-container: '#474f59'
  on-tertiary-container: '#b8c0cd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001943'
  on-primary-fixed-variant: '#234584'
  secondary-fixed: '#dee3eb'
  secondary-fixed-dim: '#c2c7cf'
  on-secondary-fixed: '#171c22'
  on-secondary-fixed-variant: '#42474e'
  tertiary-fixed: '#dbe3f0'
  tertiary-fixed-dim: '#bfc7d4'
  on-tertiary-fixed: '#141c25'
  on-tertiary-fixed-variant: '#3f4752'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Public Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  headline-md-mobile:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  container-margin: 40px
---

## Brand & Style

This design system is built for legislative environments where clarity, authority, and efficiency are paramount. The aesthetic follows a **Corporate / Modern** approach, emphasizing a high degree of legibility and a systematic organization of complex data.

The personality is professional and reliable, moving away from the "gray and heavy" legacy of government software toward a clean, airy, and trustworthy interface. It utilizes generous whitespace to reduce the cognitive load of legal procedures, ensuring that officials and citizens can navigate legislative processes with confidence and focus.

## Colors

The palette is anchored in **Institutional Blue**, a shade that evokes stability and legal authority. 

- **Primary**: Used for core actions, active states, and critical branding elements.
- **Secondary**: A light wash used for surface backgrounds, subtle hover states, and to differentiate content blocks without adding visual weight.
- **Neutral**: A range of cool grays (Slate) used for secondary text, borders, and icons, ensuring high contrast while maintaining a soft visual profile.
- **Semantic Colors**: Use Success (Emerald), Warning (Amber), and Error (Rose) sparingly for status indicators (e.g., "Draft", "Approved", "Blocked").

## Typography

We use **Public Sans**, an open-source typeface designed for government and institutional clarity. It provides a neutral, highly readable foundation that scales exceptionally well from small metadata to large headers.

- **Headlines**: Use semibold weights to create a clear hierarchy.
- **Body**: Standardized at 16px for primary reading and 14px for secondary descriptions.
- **Labels**: Small caps are used for section headers (e.g., "IDENTIFICAÇÃO") to distinguish structural labels from input data.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a 12-column system for desktop and a 4-column system for mobile. 

- **Rhythm**: All spacing is based on a 4px baseline. Use 24px (lg) for major component gaps and 16px (md) for internal element padding.
- **Reflow**: On mobile, forms should stack vertically, and horizontal tabs (like "Identificação, Autoria") should transform into a scrollable area or a dropdown menu to preserve space.
- **Margins**: Use generous safe areas (40px) at the edges of the main content container to prevent visual clutter and ensure focus on the central task.

## Elevation & Depth

This design system uses **Tonal Layers** rather than heavy shadows to indicate hierarchy. 

- **Base Layer**: The page background uses a very light neutral tint (#F8FAFC).
- **Surface Layer**: Main content cards and containers are pure white with a thin, low-contrast border (#E2E8F0).
- **Interactive Depth**: Use a very soft, diffused shadow (Blur 12px, Opacity 4%) only for floating elements like modals or dropdown menus. 
- **Separators**: Horizontal lines should be 1px thick in a light gray to separate logical sections without breaking the visual flow.

## Shapes

The shape language is consistently **Rounded**, striking a balance between modern friendliness and institutional structure.

- **Inputs & Buttons**: Use a 0.5rem (8px) radius as the standard.
- **Cards & Modals**: Use 1rem (16px) for larger containing elements to provide a distinct "framed" appearance.
- **Tags/Status**: Use pill-shaped (full radius) for status indicators like "Rascunho" to differentiate them from actionable buttons.

## Components

### Buttons
- **Primary**: Solid blue fill (#2B4C8C), white text. Used for "Salvar" or "Avançar".
- **Secondary/Ghost**: No fill, blue border or gray text. Used for "Cancelar".
- **States**: 10% black overlay on hover; 20% black overlay on press.

### Form Fields
- **Inputs**: 8px rounded corners, 1px border. Focus state uses a 2px blue ring with 20% opacity.
- **Labels**: Positioned above the field in `label-md` style, using the neutral-600 color.
- **Icons**: Use linear, 20px icons inside inputs for "Data" or "Pesquisa" to provide visual cues.

### Cards
- White background, 1px border, 16px rounded corners.
- Internal padding of 24px (lg) to ensure content breathes.

### Navigation Tabs
- Simple underline style for the active state (2px thickness). Active text is primary blue; inactive text is neutral gray.

### Status Chips
- Small, rounded containers with low-saturation background colors matching the status (e.g., light blue background with dark blue text for "Draft").
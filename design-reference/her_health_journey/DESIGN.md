---
name: Her Health Journey
colors:
  surface: '#faf9f7'
  surface-dim: '#dadad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#514347'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#847377'
  outline-variant: '#d6c1c6'
  surface-tint: '#8b4a60'
  primary: '#88485e'
  on-primary: '#ffffff'
  primary-container: '#a46076'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb0c8'
  secondary: '#61597e'
  on-secondary: '#ffffff'
  secondary-container: '#ded4ff'
  on-secondary-container: '#615a7f'
  tertiary: '#28674f'
  on-tertiary: '#ffffff'
  tertiary-container: '#438067'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e2'
  primary-fixed-dim: '#ffb0c8'
  on-primary-fixed: '#39081d'
  on-primary-fixed-variant: '#6f3349'
  secondary-fixed: '#e6deff'
  secondary-fixed-dim: '#cac1eb'
  on-secondary-fixed: '#1d1737'
  on-secondary-fixed-variant: '#494265'
  tertiary-fixed: '#b0f0d1'
  tertiary-fixed-dim: '#95d4b6'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#0c513a'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 24px
  margin: 32px
  space-xs: 4px
  space-sm: 8px
  space-md: 16px
  space-lg: 24px
  space-xl: 32px
  space-2xl: 48px
---

## Brand & Style

This design system is built on a foundation of minimalism tailored for a mature, trustworthy healthcare SaaS platform. The aesthetic prioritizes clarity, emotional safety, and professional restraint, eschewing clinical coldness in favor of a warm, human-centric approach. 

The visual tone communicates empathy and precision. Generous whitespace, calm surfaces, and a muted, sophisticated color palette establish an environment of absolute reliability and respect for the user.

## Colors

The color palette is anchored by warm neutrals and grounded by muted, approachable accents. The primary accent (#B66F86) offers warmth and distinction, while the secondary accent (#8981A8) provides calming support for data visualization and secondary interactions. 

- **Background:** #FAF9F7 (Main canvas)
- **Surface:** #FFFFFF (Cards, panels, modals)
- **Primary Accent:** #B66F86 (Primary actions, key states)
- **Secondary Accent:** #8981A8 (Secondary actions, charts)
- **Main Text:** #29272B (High contrast, readable body and headers)
- **Secondary Text:** #777278 (Captions, metadata, hints)
- **Borders:** #E8E5E5 (Dividers, structural outlines)
- **Success:** #4D8A70 (Positive indicators, completed states)
- **Warning:** #C18B48 (Cautionary alerts, pending states)
- **Error:** #C65F68 (Critical alerts, destructive actions)

## Typography

Typography pairs the geometric clarity of Manrope for headings with the supreme legibility of Inter for body copy and data. The hierarchy relies on balanced font weights (400 for body, 500-600 for structure) to maintain calm readability across complex health dashboards and long-form records.

## Layout & Spacing

A strict 8px grid system dictates all layout rhythms, ensuring predictable vertical and horizontal alignment. The layout model utilizes a responsive fluid grid for application views, scaling down gracefully from widescreen desktop down to single-column mobile views. Generous margins and structured gutters prevent cognitive overload, prioritizing scannability and focus in patient data management.

## Elevation & Depth

Visual hierarchy is communicated through subtle tonal layering and low-contrast outlines rather than heavy drop shadows. Surfaces sit on the warm background using pure white (#FFFFFF) containers framed by clean, muted borders (#E8E5E5). When elevation is required for floating elements like dropdowns or modals, use diffused, low-opacity shadows tinted with the primary neutral to maintain a gentle, non-intrusive atmosphere.

## Shapes

The shape language uses small, consistent border radii (0.25rem for base elements, 0.5rem for containers, and 0.75rem for prominent cards). This soft-geometric approach avoids overly aggressive sharp corners while maintaining the structured, professional precision expected of an enterprise healthcare platform.

## Components

### Buttons
Restrained and purposeful. Primary actions utilize the primary accent background with white text; secondary actions use subtle surface containers with main text. Avoid full-width buttons on desktop layouts unless within explicit mobile viewports or constrained form sheets.

### Form Controls
Inputs feature a clean white background, subtle #E8E5E5 borders, and small radii. Focus states transition smoothly to the primary accent with a soft ring. Labels are clearly positioned above inputs using body-sm font weights.

### Data Tables
Structured for dense, highly readable medical data. Utilize alternating row subtleties or clean bottom borders, generous cell padding based on the 8px grid, and right-aligned numeric data.

### Cards & Containers
Pure white surfaces on the warm background, bound by crisp borders. Used to partition patient metrics, timeline milestones, and appointment summaries.

### Checkboxes & Radios
Clean, minimal square and circular geometry with high-contrast active states using the primary accent color.
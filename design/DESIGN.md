---
name: 할로윈 맛집·술집
colors:
  surface: '#14121f'
  surface-dim: '#14121f'
  surface-bright: '#3a3746'
  surface-container-lowest: '#0e0c1a'
  surface-container-low: '#1c1a27'
  surface-container: '#201e2c'
  surface-container-high: '#2b2836'
  surface-container-highest: '#363342'
  on-surface: '#e5e0f3'
  on-surface-variant: '#e0c0af'
  inverse-surface: '#e5e0f3'
  inverse-on-surface: '#312f3d'
  outline: '#a78b7c'
  outline-variant: '#584235'
  surface-tint: '#ffb68a'
  primary: '#ffb68a'
  on-primary: '#522300'
  primary-container: '#ff7b00'
  on-primary-container: '#5d2900'
  inverse-primary: '#994700'
  secondary: '#ddb7ff'
  on-secondary: '#490080'
  secondary-container: '#6f00be'
  on-secondary-container: '#d6a9ff'
  tertiary: '#f9bd22'
  on-tertiary: '#402d00'
  tertiary-container: '#cc9800'
  on-tertiary-container: '#483400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbc8'
  primary-fixed-dim: '#ffb68a'
  on-primary-fixed: '#321300'
  on-primary-fixed-variant: '#743500'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#14121f'
  on-background: '#e5e0f3'
  surface-variant: '#363342'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-compact: 1rem
  margin: 2.5rem
  margin-compact: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system blends the mysterious enchantment of a midnight festival with the inviting intimacy of a tucked-away pub. It leans into a refined **Glassmorphism & Ambient Glow** aesthetic—avoiding cheap horror tropes in favor of a warm, candlelit, nocturnal atmosphere.

- **Brand Personality**: Cozy, mystical, festive, and discerning. It channels the feeling of wandering lantern-lit alleyways on Halloween night to discover hidden speakeasies, cauldron stews, and themed cocktails.
- **Target Audience**: Nightlife explorers, foodies, and social revelers looking for curated seasonal experiences, intimate cocktail bars, and atmospheric dinner spots.
- **Emotional Response**: A sense of curiosity, cozy warmth against the crisp autumn chill, and delightful festive intrigue without sensory fatigue or illegibility.
- **Style Language**: Layered smoked-glass surfaces (`rgba(22, 18, 38, 0.75)` to `rgba(31, 26, 53, 0.85)`), ethereal edge illumination, bioluminescent pumpkin-amber focal points, and spectral violet back-lighting.

## Colors

The palette is engineered specifically for deep-dark displays, utilizing three foundational dark sky levels, paired with luminescent warmth and sorcerous accents:

- **Canvas & Surfaces**:
  - `Base / Midnight Void`: `#0d0b18` — The primary root canvas representing the deep night sky.
  - `Surface Container / Crypt`: `#161226` — Sub-panels, list backgrounds, and side rails.
  - `Surface Elevated / Cauldron Glass`: `#1f1a35` — Elevated cards, flyouts, and dialogs.
  - `Border Tint`: `rgba(168, 85, 247, 0.22)` — Ghostly violet hairline boundary for spatial definitions.

- **Accents & Radiance**:
  - `Primary / Jack-o'-Lantern`: `#ff7b00` (Hover: `#ff922b`, Glow: `rgba(255, 123, 0, 0.40)`) — Drives key conversions, CTA buttons, active state indicators, and primary map pins.
  - `Secondary / Mystic Violet`: `#a855f7` (Hover: `#c084fc`, Glow: `rgba(168, 85, 247, 0.30)`) — Used for mood tags, category icons, secondary controls, and ethereal highlights.
  - `Tertiary / Candle Amber`: `#fbbf24` — Utilized for star ratings, curated badges, reviews, and warm ambiance indicators.
  - `Semantic / Witchfire Emerald`: `#22c55e` — Status pings ("Open Now", "Tables Available"), reservation confirmations.

- **Typography & Content**:
  - `Text High-Contrast / Ghostly White`: `#f8fafc` (Headlines and key metrics).
  - `Text Muted / Moon Mist`: `#e2e8f0` (Body copy, primary labels).
  - `Text Subtle / Grave Dust`: `#94a3b8` (Timestamps, metadata, inactive placeholders).

## Typography

Typography prioritizes pristine rendering on high-density screens with support for dual-script English and Korean typographic rhythm:

- **Font Hierarchy & Pairings**: `Plus Jakarta Sans` is designated for alphanumeric display and Latin glyphs, gracefully backed by system modern gothic fonts (`Pretendard`, `-apple-system`, `BlinkMacSystemFont`, `Noto Sans KR`) for seamless Korean glyph baseline alignment.
- **Emoji Accents**: Emoji accents (`🎃`, `🦇`, `🕯️`, `🌙`, `🍷`, `🕷️`) serve as functional micro-bullet points and thematic markers. They must be rendered inline using natural system typography with `0.15em` end-margins to prevent layout jumping.
- **Contrast & Legibility Rules**:
  - Never set body copy below `12px` or opacity below `60%` against dark night-sky surfaces.
  - Large headings feature tight tracking (`-0.02em`) for an editorial punch, while small tags and metric labels use positive tracking (`+0.02em` to `+0.04em`) to maintain crisp separation in night-mode viewports.

## Layout & Spacing

The web app operates on an **asymmetric fixed-fluid desktop split view**:

- **Grid & Layout Model**:
  - **Desktop Screen Model**: A persistent 420px–480px left explorer rail (lists, filters, venue detail sheet) adjacent to a 100% fluid custom vector night-mode map surface.
  - **Full-Width Directory Mode**: A 12-column responsive grid capped at a maximum width of `1440px`, centered with `2.5rem` (`margin`) outer margins and `1.5rem` (`gutter`) gutters between venue cards.
- **Form Factor Adaptations**:
  - **Desktop (≥1200px)**: Co-existing master-detail view; sidebar and map simultaneously interactive.
  - **Tablet Landscape / Narrow Desktop (900px–1199px)**: Collapsible floating filter bar with sticky mini-cards docking over the map canvas.
  - **Compact Breakpoint (<900px)**: Transitions to a vertically stacked layout; map shrinks into an anchor header or toggleable bottom sheet.
- **Component Padding Scale**: Internal spacing inside venue cards, dialogue popovers, and navigation menus relies strictly on `space-sm` (8px), `space-md` (16px), and `space-lg` (24px).

## Elevation & Depth

Visual hierarchy does not rely on opaque black drop shadows; it is communicated through **translucent glass layering, gradient perimeter lighting, and bioluminescent candle flares**:

- **Level 0 (The Night Sky Base)**: Pure `#0d0b18`. Flat, anchor canvas. Custom map tiles use customized dark toner styles (`#0f0d1b` landcover, `#080610` water bodies, neon-gold arterial road threads).
- **Level 1 (Smoked Crypt Glass)**: `background: rgba(22, 18, 38, 0.72); backdrop-filter: blur(16px); border: 1px solid rgba(168, 85, 247, 0.16); box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.6)`. Used for navigation headers, inactive venue cards, and sidebar containers.
- **Level 2 (Candlelit Hover / Active Focus)**: `background: rgba(31, 26, 53, 0.88); backdrop-filter: blur(20px); border: 1px solid rgba(255, 123, 0, 0.45); box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 16px 0 rgba(255, 123, 0, 0.25)`. Used for hovered cards and open modal menus.
- **Level 3 (Spectral Floating Layer)**: Used for map tooltips, floating search pills, and floating action prompts. Accented by a mystic violet ambient haze: `box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.9), 0 0 24px 2px rgba(168, 85, 247, 0.35)`.

## Shapes

The design system employs **Pill-shaped (Level 3)** geometry to provide a welcoming, friendly contrast to the dark and spooky aesthetic:

- **Radius Tokens**:
  - Filter chips, badges, and action buttons adopt full pill radii (`rounded-full` / `9999px`) to evoke smooth witch’s potion vials and smooth pebbles.
  - Cards, panels, and floating sheets apply `1rem` (`16px`) base rounding, transitioning to `2rem` (`32px`) on prominent hero showcases.
- **Iconography & Glyphs**:
  - Icons feature gentle curves, open counters, and a consistent 2px stroke weight.
  - Micro-accents (star ratings, mood badges) use circular and pill containers to maintain tactile warmth.

## Components

### Buttons
- **Primary (Pumpkin Glow)**:
  - Background: Solid `#ff7b00` with subtle vertical gradient to `#ff922b`.
  - Text: `#0d0b18` (deep black for ultra-clean readability) with font weight `700`.
  - Padding: `0.75rem 1.5rem`, rounded-full.
  - Glow: `box-shadow: 0 0 16px rgba(255, 123, 0, 0.4)`. Hover expands glow to `24px` with a subtle `translateY(-1px)`.
- **Secondary (Witchcraft Tint)**:
  - Background: `rgba(168, 85, 247, 0.12)`, border: `1px solid rgba(168, 85, 247, 0.35)`.
  - Text: `#f8fafc`. Hover: background shifts to `rgba(168, 85, 247, 0.22)`, border to `#c084fc`.
- **Ghost (Spectral Link)**:
  - Transparent background, `#e2e8f0` text. Hover brings candle amber `#fbbf24` text color with no layout shift.

### Chips & Badges
- **Category Filter Chips**:
  - Height `36px`, pill shape. Background `rgba(22, 18, 38, 0.8)`, border `1px solid rgba(168, 85, 247, 0.2)`.
  - Active State: Background turns `#a855f7`, text `#ffffff`, with a `0 0 12px rgba(168, 85, 247, 0.45)` aura.
  - Includes playful thematic emojis (`🎃 호박전·전통주`, `🍷 뱀파이어 와인바`, `🕯️ 심야 오뎅바`).
- **Status Badges**:
  - `Open / 영업중`: Emerald dot (`#22c55e`) with pulsing ring over `rgba(34, 197, 94, 0.15)` backdrop.
  - `Reservation / 예약필수`: Amber badge (`#fbbf24`) with `rgba(251, 191, 36, 0.15)` background.

### Cards (Venue Cards)
- **Structure**: Smoked glass container with a 16:9 venue image header, pill tags floating in top corners, and a 16px internal padding content body.
- **States**:
  - Default: Border `rgba(168, 85, 247, 0.18)`, glass backdrop.
  - Hover: Border illuminates to `#ff7b00`, amber candle-glow shadow kicks in, image undergoes smooth `1.03x` scale zoom.
- **Information Architecture**: Venue title in `headline-sm`, subtitle/location in `body-sm`, followed by a Halloween-exclusive special menu preview line tagged with a small cauldron icon.

### Form Inputs & Search Fields
- **Omni Search Bar**:
  - Height `48px`, pill-shaped container, background `rgba(22, 18, 38, 0.85)`, border `1px solid rgba(168, 85, 247, 0.3)`.
  - Placeholder: `#94a3b8` ("홍대 몽환적인 칵테일바, 이태원 코스튬 펍...").
  - Focus State: Border flares to `#a855f7` with `0 0 0 3px rgba(168, 85, 247, 0.25)` focus ring.

### Checkboxes & Radios
- Pill or rounded-md controls with dark purple background `rgba(31, 26, 53, 0.9)`.
- Checked state fills with `#ff7b00` and displays a crisp `#0d0b18` checkmark, accompanied by a small outer pumpkin glow.

### Map Markers & Popups (Domain-Specific)
- **Map Pins**: Rounded teardrop marker filled with `#ff7b00` or `#a855f7` containing category glyphs (`🍸`, `🍖`, `🎃`). Unvisited pins have a subtle pulsing aura circle.
- **Marker Hover Card**: Compact glass card (`240px` wide) displaying the spot's cover thumbnail, title, rating (`★ 4.9`), and Halloween special drink highlight.
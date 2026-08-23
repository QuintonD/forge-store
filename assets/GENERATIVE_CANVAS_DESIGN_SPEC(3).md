# Generative Canvas — AI Marketplace Design Specification

Use this file as the implementation source of truth for the Generative Canvas visual direction.

The product is a one-stop AI marketplace for models, agents, harnesses, IDEs, creative tools, infrastructure, integrations, workflows, and AI-generated content.

The design principle is simple:

> Keep the application shell stable and neutral. Let each AI category express itself through a controlled abstract generative visual language.

Do not copy text, data, dates, pricing, ratings, or product facts shown inside the reference images. Those are illustrative only.

## 0. Asset filename map — use these exact downloaded filenames

The filenames below are the names produced when the images are downloaded from ChatGPT. **Use these exact names in the project. Do not rename them unless you also update every reference in this file.**

If Windows Explorer is hiding file extensions, the visible filename may omit `.png`; the actual file should still be a PNG.

| Exact downloaded filename | Meaning | Ship in product? |
|---|---|---|
| `ChatGPT Image Aug 23, 2026, 11_07_42 AM.png` | Original 18-direction ideation moodboard | No. Historical reference only. |
| `ChatGPT Image Aug 23, 2026, 11_07_47 AM (1).png` | Generative Canvas master style guide | No. Reference only. |
| `ChatGPT Image Aug 23, 2026, 11_07_48 AM (2).png` | UI component kit | No. Reference only. |
| `ChatGPT Image Aug 23, 2026, 11_07_48 AM (3).png` | Six category-page/card visual examples | No. Reference only. |
| `ChatGPT Image Aug 23, 2026, 11_07_48 AM (4).png` | Icon language sheet | Prototype/reference only. Recreate as vector icons for production. |
| `ChatGPT Image Aug 23, 2026, 11_07_49 AM (5).png` | Reusable abstract motif sheet | Yes, as decorative artwork/crops. |
| `ChatGPT Image Aug 23, 2026, 11_07_50 AM (6).png` | Primary wireframe / generative hero artwork | Yes, as large-format brand artwork. |

### Agent lookup rule

When this specification says:
- **master style guide** → open `ChatGPT Image Aug 23, 2026, 11_07_47 AM (1).png`
- **component kit** → open `ChatGPT Image Aug 23, 2026, 11_07_48 AM (2).png`
- **category examples** → open `ChatGPT Image Aug 23, 2026, 11_07_48 AM (3).png`
- **icon sheet** → open `ChatGPT Image Aug 23, 2026, 11_07_48 AM (4).png`
- **motif sheet** → open `ChatGPT Image Aug 23, 2026, 11_07_49 AM (5).png`
- **hero artwork** → open `ChatGPT Image Aug 23, 2026, 11_07_50 AM (6).png`

The `11_07_42 AM` moodboard is not an implementation source of truth. It exists only to show how the Generative Canvas direction was selected from the wider visual exploration.

---

---

## 1. Required source assets

Keep these filenames unchanged. These names must match the downloaded files exactly.

### `ChatGPT Image Aug 23, 2026, 11_07_47 AM (1).png`
**Role:** master visual reference.

Use it to understand:
- overall density
- whitespace
- typography hierarchy
- header/search/tab treatment
- list + visual-panel layout
- borders and radii
- category accent behavior
- featured-card treatment
- balance between UI and generative art

**Do not embed this image in the product.** It is a design reference only.

---

### `ChatGPT Image Aug 23, 2026, 11_07_48 AM (2).png`
**Role:** component reference.

Use it to implement:
- top search
- category tabs
- filter chips
- sidebar filters
- buttons
- pricing badges
- ratings
- metadata tags
- product cards
- featured cards
- category cards
- list rows
- inputs
- pagination
- toast messages

**Do not embed this image in the product.** Recreate the components in native HTML/CSS/components.

---

### `ChatGPT Image Aug 23, 2026, 11_07_48 AM (3).png`
**Role:** category-page and category-card visual reference.

Use the six panels as the canonical category identities:
- Coding
- Image
- Audio
- Agents
- Models
- Tools

Use it to understand how each category keeps the same structure while changing accent color and motif.

**Do not ship the full image or crop the rendered UI panels into the product.** Recreate the UI. Use the motif assets below for live decorative artwork.

---

### `ChatGPT Image Aug 23, 2026, 11_07_49 AM (5).png`
**Role:** production decorative motif source.

This file has transparency and may be used directly as decorative artwork or cropped into reusable background elements.

Approximate motif regions:
- top-left: broad flowing surface / latent landscape
- top-right: dotted technical grid / schematic field
- upper-middle-left: ribbon waveform
- upper-middle-right: directional flow field
- lower-middle-left: connected node mesh
- lower-middle-right: targeting / measurement grid
- bottom-left: isometric data plane
- bottom-right: modular blueprint grid

Use these motifs as low-information background decoration only.

Rules:
- keep text on a clean surface
- place motifs to the side of content, not directly under dense text
- allow cropping
- allow opacity reduction
- do not add glow
- do not heavily blur
- do not recolor into rainbow gradients
- do not use more than one dominant motif in the same card

Suggested category mapping:
- Coding → modular blueprint grid, isometric plane, technical grid
- Image → circular geometry, layered planes, crop/measurement structures
- Audio → ribbon waveform, flowing surface
- Agents → node mesh, directional flow field
- Models → latent landscape, node mesh, dotted field
- Tools → isometric plane, modular blueprint grid, geometric construction

---

### `ChatGPT Image Aug 23, 2026, 11_07_50 AM (6).png`
**Role:** primary large-format brand artwork.

This file has transparency and can be used directly.

Primary uses:
- homepage hero
- marketplace overview hero
- empty-state artwork for discovery/search
- large editorial divider
- subtle product-detail background for foundational platform categories

Default placement:
- position on the right side of a hero
- artwork width: 42–55% of hero width on desktop
- allow artwork to bleed outside the container
- keep left 45–55% visually quiet for heading, body, search, or CTA
- opacity: 0.80–1.00 on light backgrounds
- hide or simplify below 768px if it competes with content

Do not:
- place body text over its densest areas
- use it as a repeating tile
- add a colored glow behind it
- use it as every page hero

---

### `ChatGPT Image Aug 23, 2026, 11_07_48 AM (4).png`
**Role:** icon-style reference and optional temporary raster source.

Grid mapping, left-to-right:

Row 1:
1. Search / discovery
2. Coding
3. Image
4. Audio

Row 2:
1. Agents
2. Models / network
3. Tools / utilities
4. Layers / stack / infrastructure

Row 3:
1. Compare / transform
2. Bookmark / save
3. Filter
4. Account / profile

Preferred production implementation:
- recreate these using vector icons from one consistent icon family such as Lucide
- use 1.75–2px stroke at standard UI sizes
- apply category accent only to the active or primary stroke

Use the raster sheet directly only for prototypes.

---

## 2. Visual identity

### Base colors

```text
Canvas / app background: #F7F6F2
Surface:                 #FFFFFF
Primary ink:             #141414
Secondary ink:           #555A60
Subtle text:             #7A7E82
Border / divider:        #C7C7C2
Soft border:             #E3E2DD
Dark featured surface:   #081522
```

### Category accents

```text
Coding:  #1D3557
Image:   #315CFF
Audio:   #7A5CFA
Agents:  #2E7D6B
Models:  #5B6472
Tools:   #F97316
```

Use accents sparingly.

Accent is allowed on:
- active category icon
- active tab underline
- primary category CTA
- selected chip
- small metadata highlight
- category artwork
- focus/selection state where appropriate

Accent is not a page background color.

Do not use generic purple-blue AI gradients.

---

## 3. Typography

Use:

```text
Primary UI font: Geist
Fallback: Inter, system-ui, sans-serif
Metadata / technical values: Geist Mono
```

If Geist is unavailable, use Inter everywhere and a system monospace for technical metadata.

### Scale

```text
Display:     56px / 1.02 / 650
H1:          44px / 1.08 / 650
H2:          32px / 1.15 / 650
H3:          22px / 1.25 / 600
Body large:  18px / 1.55 / 400
Body:        15–16px / 1.55 / 400
Label:       13px / 1.35 / 550
Metadata:    12px / 1.35 / 450, mono when appropriate
```

Use sentence case.

Avoid giant decorative typography that reduces marketplace usability.

---

## 4. Layout system

Use an 8px spacing system.

Core spacing tokens:

```text
4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96
```

Desktop:
- max content width: 1440px
- 12-column grid
- 24px gutters
- 32px page padding

Tablet:
- 24px page padding
- 8-column grid

Mobile:
- 16px page padding
- 4-column grid

Default card radius: 12px.
Default large container radius: 16px.
Small controls: 8px.

Borders should be more common than shadows.

Default shadow:
- none
- use only a very subtle shadow for floating menus, dialogs, and sticky overlays

---

## 5. Core design rule: stable shell, adaptive content

The following must stay visually consistent across all categories:
- site header
- global search
- navigation
- grid
- typography
- card dimensions
- filter structure
- metadata hierarchy
- button shape
- spacing
- border treatment

Only these should adapt by category:
- accent color
- abstract motif
- small icon accent
- featured artwork
- optional chart/diagram language

Do not redesign the entire interface when the category changes.

---

## 6. Category visual language

### Coding
Use:
- structured grids
- terminal-like blocks
- blueprint lines
- modular rectangles
- node-to-node technical connections

Mood: precise, engineered, structured.

### Image
Use:
- frames
- crop marks
- circles
- layered translucent planes
- image-coordinate geometry
- particles around focal forms

Mood: visual, spatial, compositional.

### Audio
Use:
- waveforms
- frequency bands
- pulses
- horizontal ribbons
- amplitude fields

Mood: rhythmic, continuous, signal-based.

### Agents
Use:
- nodes
- paths
- orchestration graphs
- branching flows
- connected decision points

Mood: autonomous systems working together.

### Models
Use:
- meshes
- clusters
- latent fields
- spheres
- distributed nodes
- subtle probability-like fields

Mood: foundational intelligence and abstraction.

### Tools
Use:
- modular construction geometry
- stacked planes
- cubes
- connectors
- utility diagrams

Mood: practical infrastructure and assembly.

---

## 7. Global navigation

Desktop header height: 64–72px.

Required structure:

```text
[Brand] [Global search........................] [Submit] [Saved] [Account]
```

Second-level category navigation can appear below the header:

```text
All | Coding | Image | Audio | Agents | Models | Tools | Collections
```

Use a 2px underline for the active category.

Do not use a large permanent left sidebar for global navigation. Reserve sidebars for filter-heavy result pages.

---

## 8. Global search

Search is a primary product action.

Desktop width: 420–640px.
Minimum height: 44px.

Placeholder examples:
- `Search agents, tools, models...`
- `What do you want AI to do?`

Support natural-language discovery as well as exact search.

Search result groups should distinguish:
- products
- models
- categories
- collections
- AI-generated content
- guides/editorial

Use the search icon style from `ChatGPT Image Aug 23, 2026, 11_07_48 AM (4).png` as reference.

---

## 9. Homepage

Order sections as follows.

### 1. Hero
Left:
- short eyebrow
- strong H1
- one-sentence explanation
- global search or primary discovery action

Right:
- use `ChatGPT Image Aug 23, 2026, 11_07_50 AM (6).png`

Hero should feel editorial and calm, not promotional.

Example structure:

```text
THE AI MARKETPLACE
Find the right AI for the job.
Discover models, agents, coding tools, creative systems and the stacks people build with them.
[ Search the AI ecosystem... ]
```

### 2. Category strip
Show six category cards:
- Coding
- Image
- Audio
- Agents
- Models
- Tools

Recreate the visual pattern shown in `ChatGPT Image Aug 23, 2026, 11_07_48 AM (3).png`.

### 3. Trending / new releases
Use compact product cards or list rows.

### 4. Curated collections
Examples:
- Build an AI coding stack
- Run AI locally
- Best research agents
- Open-source alternatives
- AI tools for designers

### 5. Made with AI
Show actual AI-generated outputs, not system motifs.

### 6. Latest ecosystem activity
Optional:
- releases
- pricing changes
- new integrations
- popular collections

---

## 10. Category page

Desktop layout:

```text
[ category heading + description ]
[ tabs / chips ]

[ filters 240–280px ] [ result list/grid ] [ optional adaptive visual panel ]
```

On editorial category landing pages, use the pattern from `ChatGPT Image Aug 23, 2026, 11_07_47 AM (1).png`:
- product list on left/middle
- large abstract visual on right

On dense search/results pages, remove the large visual panel and prioritize results.

Mobile:
- filters become a drawer
- artwork becomes a shallow banner or disappears
- cards stack to one column

---

## 11. Product cards

Required information order:

1. product logo/icon
2. product name
3. one-sentence description
4. category/type tags
5. rating or quality indicator where available
6. pricing summary
7. save/bookmark action

Optional:
- open-source badge
- verified badge
- platform compatibility
- install/user count
- update recency

Do not show more than 3 tags by default.

Card hover:
- border darkens slightly
- optional translateY(-1px)
- no large scale animation

Featured card:
- may use `#081522` dark surface
- white text
- category motif in low contrast
- no glow

Follow the featured-card proportions in `ChatGPT Image Aug 23, 2026, 11_07_48 AM (2).png`.

---

## 12. Product detail page

Structure:

### Header block
- logo
- name
- short descriptor
- category badges
- pricing
- primary CTA
- save button

### Quick facts
Use a compact metadata rail for:
- platform
- open source / proprietary
- API
- local support
- supported models
- integrations
- license
- last update

### Main content
Recommended order:
1. What it does
2. Key capabilities
3. Screenshots / demo
4. Compatibility
5. Pricing
6. Works well with
7. Alternatives
8. Community/reviews
9. Made with this tool
10. Related guides

Use real screenshots and vendor assets. Do not generate fake product screenshots.

---

## 13. Filters

Desktop filter sidebar should resemble `ChatGPT Image Aug 23, 2026, 11_07_48 AM (2).png`.

Core filter groups:
- category
- price
- open source
- platform
- interface: web / desktop / CLI / API
- local support
- model/provider support
- integrations
- rating
- last updated
- license

Use checkboxes for multi-select.
Use chips for active filters.

Do not hide important marketplace filtering exclusively behind AI chat.

---

## 14. Buttons

Primary:
- dark ink background on neutral pages
- category accent may be used for category-specific CTA
- minimum height 40px

Secondary:
- white or transparent
- 1px border

Tertiary:
- text only
- arrow optional

Do not use pill buttons for every control. Pills are reserved for chips, compact filters, and tags.

---

## 15. AI-generated content

AI-generated content is a first-class content type, not decorative filler.

Use actual generated outputs as thumbnails.

Supported content:
- image
- video
- audio
- interactive experiences
- websites/apps
- 3D
- writing

Each content card should show:
- thumbnail or preview
- title
- creator
- creation tools/models
- content type
- optional prompt/process link

Example metadata:

```text
Created with: Midjourney + Photoshop
Model: Flux 2
Workflow: ComfyUI
```

Visually distinguish **content thumbnails** from **system generative motifs**.

System motifs (`ChatGPT Image Aug 23, 2026, 11_07_49 AM (5).png`) are interface decoration.
AI-generated content cards show the actual work.

Do not fill the content section with generic AI art purely to make the page colorful.

---

## 16. Collections / stacks

Users should be able to group products into reusable stacks.

Example:

```text
AI Coding Stack
Cursor
Claude
OpenClaw
GitHub MCP
Ollama
```

Collection cards should use a simple stacked-card visual, not a separate illustration style.

Use the layers/stack icon style shown in `ChatGPT Image Aug 23, 2026, 11_07_48 AM (4).png`.

Allow:
- save
- duplicate
- share
- compare
- open all product pages

---

## 17. Motion and artwork integration

Motion must make the generated artwork feel native to the interface. It must never make the marketplace feel like a demo reel.

### 17.1 Motion principles

1. **UI first.** Search, filters, cards, text, and navigation must remain readable and stable while artwork moves.
2. **Static first frame.** Every page must look finished before animation starts.
3. **Animate containers, masks, lines, and opacity.** Do not distort the PNG artwork itself.
4. **One dominant motion event at a time.** Do not animate hero art, cards, background motifs, and navigation simultaneously.
5. **No perpetual decorative motion by default.** Artwork should settle after entry.
6. **Keep movement small.** Decorative raster artwork should move no more than 4–12px during an interaction.
7. **Do not animate blur, hue rotation, saturation, glow, or heavy filters.**
8. **Never animate text independently from its containing UI element unless it is a simple fade/translate entrance.**

### 17.2 Timing and easing

Use these defaults:

```text
Micro interaction:         120–180ms
Button/chip state:         140–180ms
Card hover/focus:          160–200ms
Panel/tab crossfade:       180–260ms
Artwork entrance:          450–650ms
Mask/reveal animation:     350–550ms
SVG line/node animation:   250–450ms
Page-level transition:     <= 300ms
```

Use:

```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

Do not use elastic, springy, bounce, or overshoot easing for marketplace UI.

### 17.3 Layering rule

Decorative artwork must sit behind interactive content.

Use this layer order:

```text
z-index 0  page/card surface
z-index 1  decorative motif or hero artwork
z-index 2  readable content and UI
z-index 3  menus, tooltips, dropdowns, dialogs
```

For every decorative PNG:

```css
pointer-events: none;
user-select: none;
```

Do not allow decorative artwork to capture hover, click, drag, or focus.

### 17.4 Hero artwork animation

Asset:
`ChatGPT Image Aug 23, 2026, 11_07_50 AM (6).png`

Use this asset as one large transparent composition. Do not split or distort it unless a future vector version is created.

#### Desktop placement

```text
Position: absolute inside hero
Anchor: right center
Width: 42–55% of hero width
Max height: ~560px
Opacity: 0.88–1.00
Object fit: contain
Transform origin: 60% 50%
```

Recommended entrance:

```text
Initial: opacity 0, translateY(12px), scale(0.985)
Final:   opacity 1, translateY(0),    scale(1)
Duration: 550ms
Easing: --ease-out
Delay: 80–140ms after hero content begins rendering
```

After entrance, stop the animation.

Optional desktop-only scroll response:
- translate the asset vertically by a maximum of 6px across the full hero scroll range
- do not scale during scroll
- disable below 768px
- disable for reduced motion

Do **not**:
- continuously float or breathe the entire hero image
- rotate it
- pulse its opacity
- add a glow behind it
- apply parallax greater than 6px
- animate the hero in response to pointer movement

### 17.5 Motif sheet integration

Asset:
`ChatGPT Image Aug 23, 2026, 11_07_49 AM (5).png`

Source dimensions: approximately `1448 × 1086`.

Treat this file as a transparent motif atlas. Crop it with an overflow-hidden wrapper or CSS background positioning. Do not show the full sheet in the product.

Recommended motif regions:

```text
Top-left        flowing latent surface
Top-right       technical dotted/grid field
Upper-left-mid  ribbon / waveform
Upper-right-mid directional flow field
Lower-left-mid  node network / mesh
Lower-right-mid targeting / measurement grid
Bottom-left     isometric data plane
Bottom-right    modular blueprint grid
```

Use `overflow: hidden` on the motif container. Position the original image inside it and scale/crop until the chosen motif fills the available decorative area.

Default motif opacity:

```text
Light surface, large background:       0.14–0.28
Light surface, featured decorative:    0.24–0.42
Dark featured card:                    0.12–0.24
Hover/focus increase:                  +0.04 to +0.08 maximum
```

Do not exceed `0.45` opacity for a motif placed behind or adjacent to marketplace UI.

Keep `mix-blend-mode: normal` unless a specific page has been visually tested. Do not rely on blend modes as part of the design system.

### 17.6 Motif entrance animation

For raster motifs, do not attempt fake internal line drawing.

Use one of these three entrance styles only:

**A. Fade + small translate — default**

```text
opacity 0 → target opacity
translateY(8px) → 0
450ms / --ease-out
```

**B. Mask reveal — hero/category headers**

Reveal the motif using a broad CSS mask or clipping container.

```text
Reveal direction: left-to-right or bottom-to-top
Duration: 400–550ms
Feather: broad, soft edge
```

Do not use a sharp wipe.

**C. Crossfade — category changes**

```text
Old motif: opacity target → 0 in 160–200ms
New motif: opacity 0 → target in 220–280ms
Overlap transitions by ~80ms
```

Do not slide an old category motif across the screen into a new category.

### 17.7 Category-specific motion language

Keep the same timing system across categories. Only the **motion metaphor** may vary.

#### Coding
Use:
- short horizontal/vertical line reveals
- grid segments appearing in sequence
- tiny node activations

Do not simulate terminal typing as a background effect.

#### Image
Use:
- crop-frame reveal
- soft mask expansion
- layered plane crossfade

Do not spin circles or continuously zoom imagery.

#### Audio
Use:
- one short waveform sweep on entry
- amplitude line drawing if rebuilt as SVG
- subtle horizontal reveal

Do not run a permanent equalizer animation.

#### Agents
Use:
- path activation between 2–4 nodes
- node fade/scale from `0.96 → 1`
- short directional flow sequence

Do not continuously send particles through the graph.

#### Models
Use:
- cluster fade-in
- mesh/node reveal
- slow one-time opacity propagation through nearby nodes

Do not create pulsing neural-network clichés.

#### Tools
Use:
- modular block reveal
- plane stacking using 2–4px translation
- connector line reveal

Do not use mechanical spinning gears.

### 17.8 Category card hover/focus

For the six category cards based on:
`ChatGPT Image Aug 23, 2026, 11_07_48 AM (3).png`

On hover or keyboard focus:

```text
Card:       translateY(0 → -2px)
Border:     subtle darkening
Motif:      opacity +0.05
Motif move: 0 → 4px toward the open visual area of the card
CTA arrow:  translateX(0 → 3px)
Duration:   160–200ms
```

Do not scale the entire card.
Do not increase motif opacity enough to compete with the category title.

On touch devices, do not depend on hover for any information.

### 17.9 Featured product card motion

Reference:
`ChatGPT Image Aug 23, 2026, 11_07_48 AM (2).png`

Keep the dark featured card stable.

Allowed hover/focus motion:

```text
translateY: 0 → -1px
border/outline contrast: slight increase
motif opacity: +0.04 maximum
```

Do not animate the entire decorative motif continuously inside featured cards.

### 17.10 Search and filter motion

Search is functional UI, not part of the generative animation system.

Use only:
- border/focus-color transition
- dropdown fade + `4px` translate
- chip selection background transition
- filter drawer slide on mobile

Do not animate search placeholder text, search icons, or filter counts.

Mobile filter drawer:

```text
Duration: 220–280ms
Easing: --ease-standard
Backdrop fade: same duration
```

### 17.11 Product list/grid entrance

Do not heavily animate result sets.

When results first load or filters change:
- fade the result region from `0.85 → 1`
- optionally translate the region `4px → 0`
- duration `160–220ms`

If individual card staggering is used:
- maximum 6 cards
- 20–30ms stagger
- total stagger window <= 150ms

Do not replay long entrance animations after every filter interaction.

### 17.12 Optional vector enhancement

The raster references are sufficient for initial implementation.

If a motif is later recreated as SVG or Canvas, animation may be more detailed:
- line draw with `stroke-dasharray`
- node activation
- path propagation
- clipping masks
- controlled particle placement

Rules remain:
- finish the animation within ~600ms
- do not loop by default
- keep motion subordinate to marketplace content
- use the same category accent color
- preserve the geometry and restraint of the raster reference

Do not convert the interface into a continuously animated generative background.

### 17.13 Edge fading and visual integration

Artwork should appear to emerge from the layout rather than look pasted on top.

For motif artwork, use one or more of:
- natural PNG transparency
- container cropping
- a broad CSS `mask-image` fade near the content edge
- opacity reduction

Recommended mask behavior:
- keep the core 60–75% of the motif fully visible
- feather the outer 15–25%
- fade toward the content area when artwork sits beside text

Do not use a visible rectangular crop edge unless the component intentionally has a framed visual panel.

For `ChatGPT Image Aug 23, 2026, 11_07_50 AM (6).png`, rely primarily on its existing transparency. Only add an edge mask if the artwork collides visually with hero text.

### 17.14 Reduced motion

Honor `prefers-reduced-motion: reduce`.

When reduced motion is active:
- render hero art immediately at final position
- render motifs immediately at final opacity
- disable parallax
- disable line/path drawing
- remove card translation
- retain simple color, border, and focus-state changes

Do not hide artwork because reduced motion is enabled.

### 17.15 Animation implementation check

Before shipping a page, verify:

- Can all text be read while animation is running?
- Does the page look complete with animation disabled?
- Does artwork settle instead of looping forever?
- Are transparent PNGs visually integrated rather than shown as obvious rectangular images?
- Are category changes crossfades rather than large page movements?
- Is motion under ~600ms except intentional mobile drawers?
- Are decorative layers `pointer-events: none`?
- Does reduced-motion mode preserve the complete interface?
- Is the same easing/timing language used across all categories?
- Are UI interactions more important than decorative motion?

---

## 18. Responsive behavior

### >= 1280px
Use full 12-column layout.
Large decorative artwork is allowed.
Filter sidebars may remain persistent.

### 768–1279px
Reduce artwork scale.
Use 8-column layout.
Result grids should use 2 columns where practical.

### < 768px
Use 4-column grid.
One primary content column.
Move filters into a drawer.
Hide nonessential decorative motifs if space is constrained.
Do not place decorative art above core search/results content.
Minimum tap target: 44×44px.

---

## 19. Accessibility

Required:
- WCAG AA text contrast
- visible keyboard focus states
- all icon-only controls have labels
- do not communicate category only through color
- maintain 44px mobile touch targets
- decorative motif images use empty alt text
- meaningful screenshots/content images require alt text
- honor reduced motion

Do not reduce text contrast to achieve a softer aesthetic.

---

## 20. Content and copy style

Use short literal copy.

Good:
- `Build faster with AI.`
- `Tools and agents for software development.`
- `Works with OpenAI, Anthropic and local models.`
- `Free and open source.`

Avoid:
- `Unleash the limitless power of artificial intelligence.`
- `Revolutionize your workflow.`
- generic AI hype

Product descriptions should generally fit within two lines on cards.

---

## 21. Image implementation rules

### Reference-only images
Never render these directly in the live product:
- `ChatGPT Image Aug 23, 2026, 11_07_47 AM (1).png`
- `ChatGPT Image Aug 23, 2026, 11_07_48 AM (2).png`
- `ChatGPT Image Aug 23, 2026, 11_07_48 AM (3).png`

They exist to show the target design.

### Production-usable decorative images
May be rendered directly:
- `ChatGPT Image Aug 23, 2026, 11_07_49 AM (5).png`
- `ChatGPT Image Aug 23, 2026, 11_07_50 AM (6).png`

Both include transparency.

### Prototype-only / vector reference
- `ChatGPT Image Aug 23, 2026, 11_07_48 AM (4).png`

Prefer recreating these icons as vectors for production.

### Third-party/product imagery
Do not generate substitutes for:
- product logos
- company logos
- screenshots
- model-provider marks

Use official or source-provided assets.

### AI-generated content imagery
Use the actual content being listed.
Do not reuse the Generative Canvas system motifs as user/content thumbnails.

---

## 22. Asset placement examples

### Homepage hero
Use:
- `ChatGPT Image Aug 23, 2026, 11_07_50 AM (6).png`

Placement:
- right aligned
- contain, not cover
- preserve transparency
- max height roughly 560px desktop
- allow controlled overflow

### Category header
Use:
- a crop from `ChatGPT Image Aug 23, 2026, 11_07_49 AM (5).png`

Select motif according to category mapping in Section 1.
Keep motif secondary to title and filters.

### Featured product card
Use:
- small low-opacity crop from `ChatGPT Image Aug 23, 2026, 11_07_49 AM (5).png`

Do not use the large hero asset here.

### Navigation/category icons
Use:
- `ChatGPT Image Aug 23, 2026, 11_07_48 AM (4).png` only as style reference
- implement actual icons as vectors

### Components
Use:
- `ChatGPT Image Aug 23, 2026, 11_07_48 AM (2).png` as visual reference only

---

## 23. What is intentionally not generated

No additional design-system images are required for the initial implementation.

### Missing assets check

Nothing material is missing from the generated design system. Do **not** generate more raster UI assets now. The remaining visual needs should be handled as follows:
- brand/logo mark → create as SVG/vector in the product code, not as generated raster art
- product/vendor logos → use official source assets
- product screenshots → use real screenshots
- AI-generated content gallery → use the actual listed content
- small UI/category icons → recreate from the icon sheet using one vector icon family
- empty states/editorial accents → reuse the motif sheet or hero artwork before creating new imagery

Only generate a new image when a specific future editorial page needs a unique illustration.

The current asset set already covers:
- master visual direction
- component language
- category identities
- large hero art
- reusable abstract motifs
- icon language

Do **not** generate generic placeholders for the following because real source material is better:
- vendor/product logos
- product screenshots
- AI-generated content gallery items
- user avatars
- tutorial screenshots

Generate additional artwork only when a real page requires a unique editorial illustration that cannot be satisfied by `ChatGPT Image Aug 23, 2026, 11_07_49 AM (5).png` or `ChatGPT Image Aug 23, 2026, 11_07_50 AM (6).png`.

If new system artwork is generated later, it must follow these rules:
- transparent background where possible
- abstract, technical, generative
- one category accent maximum
- no text baked into the image
- no product logos
- no human stock-photo aesthetic
- no purple-blue gradient clouds
- no neon glow
- visually quiet enough to sit beside functional UI

---

## 24. Implementation priority

Build in this order:

1. global tokens
2. header and global search
3. category tabs
4. product card and list row
5. result grid/list
6. filters
7. homepage category cards
8. homepage hero with `ChatGPT Image Aug 23, 2026, 11_07_50 AM (6).png`
9. category-specific motif treatment using `ChatGPT Image Aug 23, 2026, 11_07_49 AM (5).png`
10. product detail page
11. Made with AI content section
12. collections/stacks
13. motion polish

Do not begin with complex animation or custom generative rendering.

---

## 25. Final quality check

Before considering a page complete, verify:

- Does it look like the same product across every category?
- Is the category identity visible without dominating the UI?
- Is search easy to find?
- Can users compare products quickly?
- Are cards readable before they are visually interesting?
- Are abstract motifs decorative rather than informational?
- Are real product screenshots/logos used where appropriate?
- Is AI-generated content clearly separated from marketplace/system decoration?
- Are borders, spacing and typography consistent with the reference images?
- Are there any unnecessary gradients, glows, oversized pills, or generic AI visuals? Remove them.

When the written specification and a reference image conflict, follow this written specification.

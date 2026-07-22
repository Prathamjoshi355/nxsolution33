# Master Enterprise UI & Layout Guide
*An exhaustive reference document outlining the user interfaces, interactive states, design systems, and components of the core application modules (excluding Home, Industry, Institute, Area, Problem, Solution, and Admin panels).*

---

## 1. Product Details Page (`/product-details`)
The **Product Details Page** is a dedicated specification showcase designed to deliver maximum information density for enterprise hardware and software systems. It utilizes high-contrast typography, star ratings, and an interactive B2B consultation modal.

### Key Visual & Layout Components:
- **Responsive Dynamic Breadcrumb Strip**: 
  - Framed in a light, low-contrast background (`#F8FAFC` / `bg-surface-container-lowest`) with an elegant bottom border.
  - Dynamically renders path history (e.g., `Home / Products / AI Cameras / NX Dome Camera`) with responsive chevron arrows.
- **Product Information & Feature Checklist**:
  - Highlights the product name using high-contrast bold typography (`font-headline-xl text-primary`).
  - Lists primary tech features as an elegant list accompanied by secondary-colored checkmark icons (`check_circle`), providing clear visual rhythm.
- **Micro-Interactive Star Ratings**:
  - Displays a 5-star rating widget leveraging glowing amber stars (`#FFB800`) to represent community and deployment reviews.
- **Dual-Action Call to Actions (CTAs)**:
  - **Primary B2B Quote Button**: High-visibility trigger (`bg-secondary`) designed to launch the Interactive Quote Request Modal.
  - **Dynamic Spec Download Links**: Staggered icon links (`material-symbols-outlined`) enabling direct download of PDF data-sheets or manuals.
- **Interactive Ingestion Modal (Request Quote)**:
  - An animated full-overlay dialog triggered by the quote request button.
  - Integrates input field validation for `Name`, `Email`, `Phone`, and `Custom Message`.
  - On submit, standard browser reload is intercepted to transmit lead details to `/api/leads` and present a success state.

---

## 2. Products Catalog Page (`/products`)
Rendered dynamically via the **Products Section**, this page serves as an immersive catalog showing active and published hardware assets, edge-processing servers, and terminal configurations.

### Key Visual & Layout Components:
- **Symmetric Centered Heading**:
  - Centers a clear display header (`text-headline-lg` / `font-headline-lg-mobile`) and a high-density description detailing hardware and software products.
- **Dynamic Pill-Shaped Filter Bar**:
  - Offers immediate client-side filtering via rounded button pills: `All Products`, `Software`, `Hardware`, `AI Solutions`, and `IoT Devices`.
  - Visual states change instantly on-click using active-colored backgrounds (`bg-secondary`) and hover transitions.
- **Staggered Bento-style Grid System**:
  - Organizes catalog items into a responsive grid (1 column on mobile, 2 columns on tablet, 4 columns on desktop).
  - Each product card contains:
    - **Hover-Zoom Image Container**: Zooms the Unsplash asset subtly on hover (`group-hover:scale-105`) with smooth transitions.
    - **Bold Title & Truncated Specifications**: Keeps the card heights synchronized using line-clamp attributes on text segments.
    - **Micro-indicator link**: A subtle colored "View Details" trigger that smoothly routes the user to `/product-details?slug=<product_slug>`.

---

## 3. Case Studies Page (`/case-studies`)
The **Case Studies Page** acts as a professional B2B portfolio, displaying verified pilot results, sector enhancements, and machine-learning diagnostics.

### Key Visual & Layout Components:
- **Dynamic Category Filter Bar**:
  - Multi-pill filter controls allowing users to segregate historical success profiles under: `All`, `Education`, `Healthcare`, `Corporate`, `Manufacturing`, and `Smart City`.
- **High-Density Grid Layout**:
  - Staggered cards that present the specific industry category tag, a clear corporate title, and a brief summary of the challenges solved.
- **Direct Lead Routing Link**:
  - Includes an arrow action button (`Read More`) that links directly to the global `/contact` path, allowing visitors to instantly request similar operational configurations.

---

## 4. About Us Page (`/about`)
The **Corporate About Us Page** contains rich media, compliance guidelines, history timelines, and an interactive customer support accordion.

### Key Visual & Layout Components:
- **Immersive Hero Banner Section**:
  - A dark slate background (`bg-slate-950`) equipped with a high-resolution cityscape or tech graphic.
  - Layered with a gradient mask (`bg-gradient-to-r from-slate-950/85 to-transparent`) to ensure perfect readability of the blue uppercase badge and primary corporate headline.
- **Sticky Anchor Sub-Menu**:
  - A persistent, horizontally scrolling navigation strip containing quick links: `Company Profile`, `Why Choose Us`, `Product FAQs`, and `Corporate Contacts`.
  - Uses smooth-scroll triggers (`scrollIntoView`) to quickly snap the window viewport to the requested section.
- **Interactive Accordion FAQ Block**:
  - Features a live client-side search box (`input`) that filters queries on-the-fly.
  - Interactive categories (`Systems`, `Security`, `Corporate`) that group FAQs.
  - Dynamic expansion states: clicking a question rotates its chevron icon (`rotate-180`) and expands a smooth drawer showing deep-dive answers.

---

## 5. Resources Page (`/resources`)
A corporate information directory displaying technical white-papers, news, and research articles.

### Key Visual & Layout Components:
- **Clean 3-Column Bento Cards**:
  - Cards divided neatly into structured header blocks, Unsplash cover thumbnails, a category badge, and publishing metadata.
- **Hover Micro-Animations**:
  - Card elements feature shadow overlays (`shadow-sm hover:shadow-md`) and title color transformations (`group-hover:text-blue-600`) to increase interactivity.

---

## 6. Contact & Quote Page (`/contact`)
A high-throughput ingestion form that registers inquiries and custom parameters.

### Key Visual & Layout Components:
- **Two-Column Symmetric Layout**:
  - **Left Panel (Information Sidebar)**:
    - Styled with a dark theme (`bg-slate-900`) and glowing blue icons (`material-symbols-outlined`).
    - Lists official physical coordinates, telephone numbers, support emails, and an interactive "Working Hours" footer.
  - **Right Panel (Dynamic Ingestion Form)**:
    - A clean white container hosting a state-driven form.
    - Fields are equipped with placeholder animations and input validation: `Your Name`, `Email Address`, `Work Number`, and `Message`.
    - Shows an elegant green checkbox panel (`CheckCircle`) on successful submission.

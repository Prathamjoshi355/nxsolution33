export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  typography: 'Inter' | 'Space Grotesk' | 'Outfit' | 'Playfair Display';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing: 'compact' | 'normal' | 'cozy';
  darkMode: boolean;
}

export interface HeaderMenu {
  label: string;
  url: string;
  dropdown?: { label: string; url: string }[];
  megaMenu?: { category: string; links: { label: string; url: string }[] }[];
}

export interface HeaderSettings {
  logo: string;
  logoText: string;
  menus: HeaderMenu[];
  buttonText: string;
  buttonUrl: string;
  sticky: boolean;
  transparent: boolean;
  bgColor: string;
  textColor: string;
  height: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

export interface FooterSettings {
  logo: string;
  logoText: string;
  columns: FooterColumn[];
  socialLinks: { platform: string; url: string }[];
  newsletterTitle: string;
  newsletterPlaceholder: string;
  contactInfo: { email: string; phone: string; address: string; hours: string };
  copyright: string;
  bgColor: string;
  textColor: string;
}

export interface ComponentStyles {
  paddingTop: string;
  paddingBottom: string;
  marginTop: string;
  marginBottom: string;
  backgroundColor: string;
  backgroundImage?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDir?: string;
  borderRadius?: string;
  boxShadow?: string;
  textColor?: string;
  headingColor?: string;
  accentColor?: string;
  alignment: 'left' | 'center' | 'right';
  animation: 'none' | 'fade' | 'slide-up' | 'scale-up';
  visibility: 'all' | 'desktop' | 'mobile';
  overlay?: boolean;
  opacity?: number;
}

export interface SectionComponent {
  id: string;
  name: string;
  type: 'Hero' | 'Industries' | 'IndustriesServe' | 'Institution' | 'Area' | 'Problem' | 'Solution' | 'Products' | 'CaseStudies' | 'About' | 'Resources' | 'Contact' | 'Breadcrumb' | 'CTA' | 'AboutHero' | 'AboutCompany' | 'AboutStats' | 'AboutMissionVision' | 'AboutValues' | 'AboutLeadership' | 'AboutTimeline' | 'AboutCertifications' | 'AboutAwards' | 'AboutPartners' | 'AboutGallery' | 'AboutTestimonials' | 'AboutDownloads' | 'AboutContact' | 'AboutNX' | 'ChallengesToSolutions' | 'SolutionProcess' | 'OurSolutions' | 'OurCurrentWork' | 'TechnologyEcosystem' | 'TechnologyPartners' | 'ClientsTrustUs';
  visible: boolean;
  content: any; // section-specific schema
  styles: ComponentStyles;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  sections: SectionComponent[];
  visible: boolean;
  themeOverride?: any;
  draftSections?: SectionComponent[];
  draftSeo?: {
    title: string;
    description: string;
    keywords: string;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  gallery: string[];
  category: string;
  description: string;
  specifications: { key: string; value: string }[];
  features: string[];
  downloads: { label: string; url: string }[];
  seo: { title: string; description: string };
  status: 'draft' | 'published';
  relatedProducts: string[]; // ids
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  category: string;
  industry: string;
  clientName: string;
  image: string;
  gallery: string[];
  challenge: string;
  solution: string;
  results: string;
  metrics: { label: string; value: string }[];
  downloads: { label: string; url: string }[];
  testimonial?: { quote: string; author: string; role: string; company: string; avatar?: string };
  seo: { title: string; description: string; keywords: string };
  status: 'draft' | 'published';
  date: string;
  author: string;
  relatedCaseStudies: string[]; // ids
}

export interface ProductQuery {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  productName: string;
}

export interface CareerApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  resumeUrl: string;
  message: string;
}

export interface CRMLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  source: 'contact' | 'demo' | 'product_enquiry' | 'career_application' | 'newsletter';
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
  notes: string;
  date: string;
  details?: any; // Additional payload
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Role {
  name: 'Super Admin' | 'Designer' | 'Content Manager' | 'CRM Executive' | 'Viewer';
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Designer' | 'Content Manager' | 'CRM Executive' | 'Viewer';
  avatar?: string;
}

export interface Zone {
  id: string;
  publicId?: string;
  name: string;
  slug: string;
  heading: string;
  subHeading: string;
  description: string;
  image: string;
  industryId: string;
  institutionId: string;
  status: 'draft' | 'published' | 'archived';
  sortOrder: number;
  displayOrder?: number;
  isFeatured?: boolean;
  featured?: boolean;
  cardImage?: string;
  coverImage?: string;
  bannerImage?: string;
  icon?: string;
  priority?: string;
  riskLevel?: string;
  shortDescription?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  cta?: {
    buttonText?: string;
    buttonLink?: string;
  };
}

export interface Problem {
  id: string;
  publicId?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: 'draft' | 'published' | 'archived';
  sortOrder?: number;
  displayOrder?: number;
  industryId?: string;
  institutionId?: string;
  zoneId?: string;
  areaId?: string;
  shortDescription?: string;
  severity?: string;
  priority?: string;
  category?: string;
  icon?: string;
  cardImage?: string;
  bannerImage?: string;
  featured?: boolean;
  isFeatured?: boolean;
  riskLevel?: string;
  createdAt?: string;
  updatedAt?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  cta?: {
    buttonText?: string;
    buttonLink?: string;
  };
}

export interface Module {
  id: string;
  publicId?: string;
  problemId: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  coverImage?: string;
  galleryImages?: string[];
  icon?: string;
  status: 'draft' | 'published' | 'disabled';
  displayOrder?: number;
  sortOrder?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    metaImage?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ZoneProblem {
  id: string;
  industryId: string;
  institutionId: string;
  zoneId: string;
  problemId: string;
}

export interface SolutionSection {
  id: string; // 'hero' | 'problem-overview' | 'challenges' | 'features' | 'workflow' | 'benefits' | 'ai-modules' | 'hardware' | 'software' | 'case-study' | 'faqs' | 'cta' | 'lead-form'
  name: string;
  heading: string;
  subHeading?: string;
  description?: string;
  image?: string;
  images?: string[];
  icon?: string;
  buttonText?: string;
  buttonUrl?: string;
  items?: any[]; // For flexible structured lists, e.g. FAQ list (q, a), features list, etc.
  bgColor?: string;
  textColor?: string;
  visible: boolean;
  displayOrder: number;
}

export interface Solution {
  id: string;
  publicId?: string;
  problemId?: string; // primary linked problem (optional, legacy)
  moduleId?: string; // primary linked module (belongs to module under the new hierarchy)
  title: string;
  slug: string;
  heroTitle: string;
  heroSubtitle: string;
  status: 'draft' | 'published' | 'archived';
  sections: SolutionSection[];
  industryId?: string;
  institutionId?: string;
  zoneId?: string;
}

export interface ProblemSolution {
  id: string;
  problemId: string;
  solutionId: string;
  sortOrder?: number;
}

export interface SolutionLead {
  id: string;
  industryId: string;
  industryName: string;
  institutionId: string;
  institutionName: string;
  zoneId: string;
  zoneName: string;
  problemId: string;
  problemName: string;
  solutionId: string;
  solutionTitle: string;
  visitorName: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  timestamp: string;
  sourceUrl: string;
}

export interface Industry {
  id: string;
  publicId?: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  cardImage?: string;
  homePageImage?: {
    url: string;
    alt?: string;
  };
  icon: string;
  bannerImage: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  cta: {
    buttonText?: string;
    buttonLink?: string;
  };
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Institution {
  id: string;
  publicId?: string;
  industryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  cardImage: string;
  coverImage: string;
  bannerImage: string;
  icon: string;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  cta: {
    buttonText?: string;
    buttonLink?: string;
  };
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TechnologyItem {
  id: string;
  publicId?: string;
  name: string;
  logo: string;
  category: string;
  website?: string;
  description?: string;
  status: 'published' | 'draft' | 'archived';
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TechnologyCategory {
  id: string;
  name: string;
}

export interface TestimonialItem {
  id: string;
  publicId?: string;
  clientName: string;
  designation: string;
  organization: string;
  industry?: string;
  clientPhoto?: string;
  companyLogo?: string;
  testimonial: string;
  rating?: number; // 1-5 stars
  projectName?: string;
  location?: string;
  status: 'published' | 'draft' | 'archived';
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeTestimonialSelectedRef {
  testimonialId: string;
  featured?: boolean;
  order: number;
  enabled?: boolean;
}

export interface HomeTestimonialSectionConfig {
  badgeNumber: string;
  badgeText: string;
  badgeColor?: string;
  headingColor?: string;
  backgroundColor?: string;
  topPadding?: string;
  bottomPadding?: string;
  containerWidth?: string;
  selectedTestimonials: HomeTestimonialSelectedRef[];
  carouselSettings?: {
    autoPlay?: boolean;
    autoPlaySpeed?: number;
    pauseOnHover?: boolean;
    infiniteLoop?: boolean;
    navigationArrows?: boolean;
    showDots?: boolean;
    mouseDrag?: boolean;
    touchSwipe?: boolean;
    transitionSpeed?: number;
    itemsPerSlideDesktop?: number;
    itemsPerSlideTablet?: number;
    itemsPerSlideMobile?: number;
  };
  cardSettings?: {
    showPhoto?: boolean;
    showLogo?: boolean;
    showRating?: boolean;
    dotColor?: string;
    activeDotColor?: string;
  };
  enabled: boolean;
}

export interface HomeTechnologySelectedRef {
  technologyId: string;
  featured?: boolean;
  order: number;
}

export interface HomeTechnologySectionConfig {
  badgeNumber: string;
  badgeText: string;
  badgeColor?: string;
  headingColor?: string;
  backgroundColor?: string;
  topPadding?: string;
  bottomPadding?: string;
  containerWidth?: string;
  selectedTechnologies: HomeTechnologySelectedRef[];
  logoDisplayMode?: 'logo_only' | 'logo_name' | 'logo_name_category';
  sliderSettings?: {
    enableSlider?: boolean;
    autoScroll?: boolean;
    infiniteLoop?: boolean;
    navigationArrows?: boolean;
    mouseDrag?: boolean;
    touchSwipe?: boolean;
    scrollSpeed?: number;
    pauseOnHover?: boolean;
  };
  cardSettings?: {
    logoSize?: string;
    cardHeight?: string;
    cardWidth?: string;
    borderRadius?: string;
    border?: boolean;
    shadow?: boolean;
    hoverEffect?: boolean;
  };
  footerText: string;
  enabled: boolean;
}



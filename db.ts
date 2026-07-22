import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { ThemeSettings, HeaderSettings, FooterSettings, Page, Product, CaseStudy, CRMLead, AuditLog, Role, User, Zone, Problem, ZoneProblem, Solution, ProblemSolution, SolutionLead, Industry, Institution, Module, TechnologyItem, TechnologyCategory, TestimonialItem, HomeTestimonialSectionConfig } from './src/types.js';

function getDbFilePath(): string {
  let baseDir = process.cwd();
  try {
    if (typeof __dirname !== 'undefined') {
      baseDir = __dirname;
    } else if (import.meta && import.meta.url) {
      baseDir = path.dirname(fileURLToPath(import.meta.url));
    }
  } catch (e) {}

  const candidatePaths = [
    path.join(process.cwd(), 'db.json'),
    path.join(baseDir, 'db.json'),
    path.join(baseDir, '..', 'db.json'),
    path.join(process.cwd(), '..', 'db.json')
  ];
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        return p;
      }
    } catch (e) {}
  }
  return path.join(process.cwd(), 'db.json');
}

const DB_FILE_PATH = getDbFilePath();

interface SchemaDB {
  themeSettings: ThemeSettings;
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  pages: Page[];
  products: Product[];
  caseStudies: CaseStudy[];
  leads: CRMLead[];
  logs: AuditLog[];
  users: User[];
  roles: Role[];
  zones?: Zone[];
  problems?: Problem[];
  zoneProblems?: ZoneProblem[];
  solutions?: Solution[];
  problemSolutions?: ProblemSolution[];
  solutionLeads?: SolutionLead[];
  industries?: Industry[];
  institutions?: Institution[];
  modules?: Module[];
  technologyEcosystem?: TechnologyItem[];
  technologyCategories?: TechnologyCategory[];
  testimonials?: TestimonialItem[];
  homeTestimonialSection?: HomeTestimonialSectionConfig;
}

const DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#2563EB', // Blue 600
  secondaryColor: '#1E293B', // Slate 800
  accentColor: '#10B981', // Emerald 500
  bgColor: '#F8FAFC', // Slate 50
  textColor: '#0F172A', // Slate 900
  typography: 'Inter',
  borderRadius: 'lg',
  shadow: 'md',
  spacing: 'normal',
  darkMode: false,
};

const DEFAULT_HEADER: HeaderSettings = {
  logo: 'NX SOLUTION',
  logoText: 'Building Smarter, Safer & Better Tomorrow',
  menus: [
    { label: 'Home', url: '/' },
    { label: 'Industries', url: '/industries' },
    { label: 'Products', url: '/products' },
    { label: 'Case Studies', url: '/case-studies' },
    { label: 'About Us', url: '/about' },
    { label: 'Resources', url: '/resources' },
    { label: 'Contact', url: '/contact' },
  ],
  buttonText: 'Book Demo',
  buttonUrl: '/contact?type=demo',
  sticky: true,
  transparent: false,
  bgColor: '#FFFFFF',
  textColor: '#1E293B',
  height: '72px',
};

const DEFAULT_FOOTER: FooterSettings = {
  logo: 'NX SOLUTION',
  logoText: 'Advanced Security, AI, and Automation for Enterprises.',
  columns: [
    {
      title: 'Solutions',
      links: [
        { label: 'Education Security', url: '/industries' },
        { label: 'Healthcare Safety', url: '/industries' },
        { label: 'Manufacturing Safety', url: '/industries' },
        { label: 'Smart Society AI', url: '/industries' },
      ],
    },
    {
      title: 'Products',
      links: [
        { label: 'AI Cameras', url: '/products' },
        { label: 'Access Control', url: '/products' },
        { label: 'NX Sentinel Software', url: '/products' },
        { label: 'IoT Sensors', url: '/products' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', url: '/about' },
        { label: 'Case Studies', url: '/case-studies' },
        { label: 'Resources & News', url: '/resources' },
        { label: 'Contact Support', url: '/contact' },
      ],
    },
  ],
  socialLinks: [
    { platform: 'Twitter', url: 'https://twitter.com' },
    { platform: 'LinkedIn', url: 'https://linkedin.com' },
    { platform: 'GitHub', url: 'https://github.com' },
  ],
  newsletterTitle: 'Subscribe to Our Newsletter',
  newsletterPlaceholder: 'Enter your work email',
  contactInfo: {
    email: 'info@nxsolution.in',
    phone: '+91 8009 123 456',
    address: 'NX Solution, 123, Tech Park, Noida, Uttar Pradesh, India',
    hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
  },
  copyright: '© 2026 NX Solution. All Rights Reserved.',
  bgColor: '#0F172A',
  textColor: '#F8FAFC',
};

const DEFAULT_TECHNOLOGIES: TechnologyItem[] = [
  { id: 'tech-1', name: 'HIKVISION', logo: '', category: 'CCTV', website: 'https://www.hikvision.com', description: 'Leading CCTV & Video Surveillance Solutions', status: 'published', order: 1 },
  { id: 'tech-2', name: 'dahua', logo: '', category: 'CCTV', website: 'https://www.dahuasecurity.com', description: 'Video-centric AIoT Solution Provider', status: 'published', order: 2 },
  { id: 'tech-3', name: 'MATRIX', logo: '', category: 'Telecom & Security', website: 'https://www.matrixcomsec.com', description: 'Telecom and Security Solutions', status: 'published', order: 3 },
  { id: 'tech-4', name: 'suprema', logo: '', category: 'Access Control', website: 'https://www.supremenewyork.com', description: 'Biometrics & Access Control Systems', status: 'published', order: 4 },
  { id: 'tech-5', name: 'AXIS', logo: '', category: 'CCTV', website: 'https://www.axis.com', description: 'Network Cameras & Video Encoders', status: 'published', order: 5 },
  { id: 'tech-6', name: 'BOSCH', logo: '', category: 'Hardware', website: 'https://www.boschsecurity.com', description: 'Invented for Life Security Systems', status: 'published', order: 6 },
  { id: 'tech-7', name: 'Honeywell', logo: '', category: 'Automation', website: 'https://www.honeywell.com', description: 'Building Automation and Security Systems', status: 'published', order: 7 },
  { id: 'tech-8', name: 'CP PLUS', logo: '', category: 'CCTV', website: 'https://www.cpplusworld.com', description: 'Intelligent Security Systems', status: 'published', order: 8 },
  { id: 'tech-9', name: 'ZKTeco', logo: '', category: 'Access Control', website: 'https://www.zkteco.com', description: 'Time Attendance and Access Control', status: 'published', order: 9 },
  { id: 'tech-10', name: 'eSSL', logo: '', category: 'Attendance', website: 'https://www.esslsecurity.com', description: 'Biometric Attendance & Security Solutions', status: 'published', order: 10 },
  { id: 'tech-11', name: 'MANTRA', logo: '', category: 'Attendance', website: 'https://www.mantratec.com', description: 'Biometric Hardware & Fingerprint Scanners', status: 'published', order: 11 },
  { id: 'tech-12', name: 'D-Link', logo: '', category: 'Networking', website: 'https://www.dlink.com', description: 'Enterprise Switches & Networking', status: 'published', order: 12 },
  { id: 'tech-13', name: 'tp-link', logo: '', category: 'Networking', website: 'https://www.tp-link.com', description: 'Networking & Wireless Routers', status: 'published', order: 13 },
  { id: 'tech-14', name: 'UBIQUITI NETWORKS', logo: '', category: 'Networking', website: 'https://ui.com', description: 'UniFi Enterprise Networking & Wireless', status: 'published', order: 14 },
  { id: 'tech-15', name: 'Microsoft', logo: '', category: 'Software', website: 'https://www.microsoft.com', description: 'Cloud Services & Enterprise Software', status: 'published', order: 15 },
  { id: 'tech-16', name: 'aws', logo: '', category: 'Cloud', website: 'https://aws.amazon.com', description: 'Amazon Web Services Cloud Infrastructure', status: 'published', order: 16 },
  { id: 'tech-17', name: 'Google Cloud', logo: '', category: 'Cloud', website: 'https://cloud.google.com', description: 'Google Cloud Platform & AI Services', status: 'published', order: 17 },
  { id: 'tech-18', name: 'ONVIF', logo: '', category: 'Protocol', website: 'https://www.onvif.org', description: 'Open Network Video Interface Forum', status: 'published', order: 18 },
  { id: 'tech-19', name: 'MQTT', logo: '', category: 'IoT', website: 'https://mqtt.org', description: 'OASIS Standard Messaging Protocol for IoT', status: 'published', order: 19 },
];

const DEFAULT_TECH_CATEGORIES: TechnologyCategory[] = [
  { id: 'cat-1', name: 'CCTV' },
  { id: 'cat-2', name: 'Access Control' },
  { id: 'cat-3', name: 'Attendance' },
  { id: 'cat-4', name: 'Networking' },
  { id: 'cat-5', name: 'Cloud' },
  { id: 'cat-6', name: 'AI' },
  { id: 'cat-7', name: 'IoT' },
  { id: 'cat-8', name: 'Automation' },
  { id: 'cat-9', name: 'Analytics' },
  { id: 'cat-10', name: 'Software' },
  { id: 'cat-11', name: 'Hardware' },
  { id: 'cat-12', name: 'Telecom & Security' },
  { id: 'cat-13', name: 'Protocol' },
];

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "testi-1",
    clientName: "Director Operations",
    designation: "Director Operations",
    organization: "Leading Educational Institution",
    industry: "Education",
    testimonial: "NX Solution team understood our operational challenges deeply and delivered an intelligent solution that improved our security, efficiency and overall management.",
    rating: 5,
    status: "published",
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "testi-2",
    clientName: "Facility Manager",
    designation: "Facility Manager",
    organization: "Multi-specialty Hospital",
    industry: "Healthcare",
    testimonial: "Professional approach, deep technical knowledge and timely execution. NX Solution is a trusted technology partner for our organization.",
    rating: 5,
    status: "published",
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "testi-3",
    clientName: "EHS Head",
    designation: "EHS Head",
    organization: "Industrial Manufacturing Plant",
    industry: "Manufacturing",
    testimonial: "The automated safety and access monitoring installed across our manufacturing facility reduced operational delays significantly and improved compliance.",
    rating: 5,
    status: "published",
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "testi-4",
    clientName: "Chief Technology Officer",
    designation: "Chief Technology Officer",
    organization: "Commercial Real Estate Group",
    industry: "Real Estate",
    testimonial: "Seamless integration with our existing infrastructure and excellent ongoing support. Highly recommended for enterprise-scale smart security solutions.",
    rating: 5,
    status: "published",
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'NX AI Dome Camera',
    slug: 'nx-ai-dome-camera',
    images: ['https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80'],
    gallery: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&auto=format&fit=crop&q=80'
    ],
    category: 'Hardware Solutions',
    description: 'Our flagship 4MP High Resolution smart dome camera equipped with cutting-edge edge AI processors for instant face identification and intrusion detection.',
    specifications: [
      { key: 'Resolution', value: '4MP (2560 x 1440) at 30fps' },
      { key: 'AI Engine', value: 'Edge-AI 4 TOPS Neural Network Processing Unit' },
      { key: 'Weather Protection', value: 'IP67 Waterproof & IK10 Vandal-Proof' },
      { key: 'Audio', value: 'Built-in high sensitivity microphone & speaker' },
      { key: 'Night Vision', value: 'Smart IR up to 30 meters with Starvis sensor' },
    ],
    features: [
      'AI Human & Vehicle Detection with 99.8% precision',
      'Smart Motion Detection avoiding false alarms (leaves, shadows, rain)',
      'Real-time streaming over secure encrypted channel',
      'One-click easy installation with active PoE support',
    ],
    downloads: [
      { label: 'Product Datasheet (PDF)', url: '#' },
      { label: 'Installation Manual', url: '#' },
    ],
    seo: { title: 'NX AI Dome Camera - Professional Security', description: 'Advanced 4MP smart AI dome camera featuring real-time face detection and active deterrent.' },
    status: 'published',
    relatedProducts: ['prod-2', 'prod-3'],
  },
  {
    id: 'prod-2',
    name: 'NX Sentinel System',
    slug: 'nx-sentinel',
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'],
    gallery: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'],
    category: 'Software Solutions',
    description: 'Centralized command center software utilizing deep-learning algorithms to monitor, analyze, and alert operations in real-time across multiple locations.',
    specifications: [
      { key: 'Platform Compatibility', value: 'Windows Server, Ubuntu, Cloud' },
      { key: 'Max Cameras Supported', value: 'Up to 10,000 streams per cluster' },
      { key: 'Protocol Support', value: 'ONVIF, RTSP, WebRTC' },
    ],
    features: [
      'Real-time automated facial verification and visitor log integration',
      'Instant push notifications and SMS/Email security alerts',
      'Comprehensive data analytics panel with exportable PDF/Excel reports',
    ],
    downloads: [{ label: 'Software Spec Sheet', url: '#' }],
    seo: { title: 'NX Sentinel VMS - AI Video Analytics', description: 'Next generation Enterprise Video Management Software (VMS) with advanced AI analytics integrations.' },
    status: 'published',
    relatedProducts: ['prod-1'],
  },
  {
    id: 'prod-3',
    name: 'NX Face Terminal Pro',
    slug: 'nx-face-terminal-pro',
    images: ['https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=600&auto=format&fit=crop&q=80'],
    gallery: ['https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=600&auto=format&fit=crop&q=80'],
    category: 'Hardware Solutions',
    description: 'A wall-mounted access terminal with instant face scanning, thermal temperature scanning, and automatic barrier control triggers.',
    specifications: [
      { key: 'Verification Speed', value: '< 0.2 seconds per user' },
      { key: 'Face Capacity', value: '50,000 active profiles' },
      { key: 'Display', value: '7-inch HD IPS Touch Screen' },
    ],
    features: [
      'Mask compliance tracking and elevated body temperature alerts',
      'Seamless integration with magnetic locks and physical turnstiles/boom barriers',
      'Dual lens live detection preventing verification using photos or video',
    ],
    downloads: [{ label: 'Datasheet Terminal', url: '#' }],
    seo: { title: 'NX Face Terminal Pro - Biometric Access', description: 'Enterprise-grade facial recognition access terminal with thermal scanning.' },
    status: 'published',
    relatedProducts: ['prod-1'],
  }
];

const DEFAULT_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-1',
    title: 'Smart School Security Integration',
    slug: 'smart-school-security-integration',
    category: 'Education',
    industry: 'Educational Institution',
    clientName: 'Amity University Campus',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80'
    ],
    challenge: 'Amity University campus main gate was suffering from excessive tailgating, unauthorized visitors, and manual attendance registration which took up to 30 minutes per class.',
    solution: 'We deployed real-time Face Recognition access gates across 4 state-university campus main gates, reducing unauthorized tailgating incidents and automating attendance logs.',
    results: 'Reduced unauthorized tailgating incidents by 98.4% and automated attendance logs, reducing register overhead from 30 minutes to less than 2 seconds.',
    metrics: [
      { label: 'Tailgating Incidents', value: '98.4% Reduction' },
      { label: 'Entry Delay Time', value: '< 2 Seconds' },
      { label: 'Attendance Security Accuracy', value: '99.9% Match Rate' }
    ],
    downloads: [
      { label: 'Technical Implementation Report (PDF)', url: '#' },
      { label: 'Amity University Success Story Spec Sheet', url: '#' }
    ],
    testimonial: {
      quote: "The NX Solution smart biometric system has completely changed our campus safety. Attendance takes seconds, and we have real-time alerts for any unregistered personnel.",
      author: "Dr. K. S. Sharma",
      role: "Dean of Student Affairs",
      company: "Amity University",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
    },
    seo: {
      title: 'Smart School Security Integration Case Study - NX Solution',
      description: 'See how NX Solution integrated high-speed facial recognition barriers and automated logs at Amity University.',
      keywords: 'school security system, biometric gate access, campus safety AI'
    },
    status: 'published',
    date: 'May 2026',
    author: 'Chief Engineer Amit Roy',
    relatedCaseStudies: ['cs-2', 'cs-3']
  },
  {
    id: 'cs-2',
    title: 'Hospital Patient Safety and Tracking',
    slug: 'hospital-patient-safety-tracking',
    category: 'Healthcare',
    industry: 'Healthcare System',
    clientName: 'Max Healthcare Hospitals',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80'
    ],
    challenge: 'Alzheimer patients and high-risk visitors frequently wandered near hazardous or restricted pharmaceutical zones without authorized guides.',
    solution: 'Integrated smart CCTV cameras with NX Sentinel software to alert staff instantly when Alzheimer patients enter unauthorized high-risk wards or wander near perimeter boundaries.',
    results: 'Wandering incidents into restricted zones reduced to absolute zero, and emergency dispatch alerts dropped from 5 minutes to under 15 seconds.',
    metrics: [
      { label: 'Restricted Zone Wandering', value: '0 Incidents Reported' },
      { label: 'Emergency Response Time', value: '< 15 Seconds' },
      { label: 'Patient Tracking Precision', value: '99.5% Coverage' }
    ],
    downloads: [
      { label: 'Healthcare Security Architecture (PDF)', url: '#' }
    ],
    testimonial: {
      quote: "NX Sentinel's patient tracking module acts like an invisible guardian. It lets our nurses focus on clinical care while keeping vulnerable patients safe.",
      author: "Sister Clara D'Souza",
      role: "Nursing Director",
      company: "Max Healthcare",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    seo: {
      title: 'Hospital Patient Safety AI Case Study - NX Solution',
      description: 'NX Sentinel implementation study on smart patient tracking and automated nursing alerts in high-risk zones.',
      keywords: 'hospital patient tracking, ward security, nursing alerts AI'
    },
    status: 'published',
    date: 'April 2026',
    author: 'Analytics Specialist Priya Sharma',
    relatedCaseStudies: ['cs-1']
  },
  {
    id: 'cs-3',
    title: 'Factory Safety Automation',
    slug: 'factory-safety-automation',
    category: 'Manufacturing',
    industry: 'Factory Operations',
    clientName: 'Vedanta Metal Refineries',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80'
    ],
    challenge: 'Factory floor workers frequently entered heavy conveyor hazard-zones without complete PPE gear, risking severe safety violations and accidents.',
    solution: 'Utilized deep-learning image processing to automatically stop dangerous factory conveyors if a floor worker enters the hazard-zone without complete PPE gear (Helmet/Vest).',
    results: 'Zero industrial safety accidents since deployment, and complete compliance tracking for OSHA regulatory audits.',
    metrics: [
      { label: 'Conveyor Safety Incidents', value: '100% Drop' },
      { label: 'OSHA Audit Rating', value: 'Grade A Gold' },
      { label: 'Conveyor Emergency Shutoff', value: '< 100 Milliseconds' }
    ],
    downloads: [
      { label: 'PPE Compliance Whitepaper (PDF)', url: '#' }
    ],
    testimonial: {
      quote: "Our factory had several safety close-shaves. This automated NPU conveyor shutoff system literally saves lives and keeps us fully compliant with regulations.",
      author: "Vikram Malhotra",
      role: "EHS Safety Officer",
      company: "Vedanta Group",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    seo: {
      title: 'Factory Safety Automation and PPE Tracking Case Study',
      description: 'A study on deep-learning edge image processing and automatic machine shut-offs at Vedanta Metals.',
      keywords: 'PPE detection AI, conveyor automatic stop, manufacturing safety'
    },
    status: 'published',
    date: 'March 2026',
    author: 'AI Specialist Rahul Verma',
    relatedCaseStudies: ['cs-4']
  },
  {
    id: 'cs-4',
    title: 'Smart Society Integrated Security',
    slug: 'smart-society-integrated-security',
    category: 'Smart City',
    industry: 'Residential Township',
    clientName: 'DLF Primus Townships',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80'
    ],
    challenge: 'Manual gate verification for 1,200+ residential families created long queues at rush hours, and allowed unauthorized delivery vehicles to enter unlogged.',
    solution: 'Launched an automated smart barrier solution coupled with license plate validation algorithms for a residential luxury township housing 1,200+ active families.',
    results: 'Peak hours traffic congestion cleared, and visitor registration automated by 94% with secure app logs.',
    metrics: [
      { label: 'Visitor Register Automation', value: '94% Automated' },
      { label: 'Rush Hour Congestion', value: 'Zero Waiting' },
      { label: 'Resident App Satisfaction', value: '4.8/5.0 Rating' }
    ],
    downloads: [
      { label: 'Smart Society System Blueprints (PDF)', url: '#' }
    ],
    testimonial: {
      quote: "The automated license plate reader has removed the gate block completely. Now delivery agents get one-time PINs and residents feel 100% safe.",
      author: "Sanjay Singhal",
      role: "Secretary, Residents Welfare Association",
      company: "DLF Primus",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    seo: {
      title: 'Smart Society CCTV and Gate Automation Case Study',
      description: 'See how DLF Primus automated vehicle logging and guest registration using fast ANPR camera networks.',
      keywords: 'ANPR camera township, township gate barriers, visitor verification'
    },
    status: 'published',
    date: 'February 2026',
    author: 'Operations Architect Kabir Sen',
    relatedCaseStudies: ['cs-1', 'cs-3']
  }
];

const DEFAULT_PAGES: Page[] = [
  {
    id: 'page-home',
    name: 'Home',
    slug: '/',
    seo: {
      title: 'NX Solution - Enterprise AI-Powered Security Solutions',
      description: 'We help organizations solve real-world security, tracking, and management problems through AI, Smart Automation, IoT, and high-performance software.',
      keywords: 'Enterprise security, AI vision, Access control, Visitor management, IoT sensors, Smart Society',
    },
    visible: true,
    sections: [
      {
        id: 'home-hero',
        name: 'Hero Section',
        type: 'Hero',
        visible: true,
        content: {
          title: 'AI-Powered Solutions for Every Industry',
          subtitle: 'We help organizations solve real-world problems through AI, Automation, IoT, Software and Integrated Hardware.',
          ctaText: 'Explore Solutions',
          ctaUrl: '/industries',
          secondaryCtaText: 'Book a Demo',
          secondaryCtaUrl: '/contact',
          badges: [
            { icon: 'Brain', text: 'AI Powered' },
            { icon: 'Cpu', text: 'Smart Automation' },
            { icon: 'Eye', text: 'Real-time Monitoring' },
            { icon: 'BarChart3', text: 'Data Driven Insights' },
            { icon: 'Zap', text: 'Scalable Solutions' },
            { icon: 'ShieldCheck', text: 'End-to-End Support' }
          ],
          trustedText: 'Trusted by 500+ Organizations',
          logos: ['AMITY UNIVERSITY', 'MAX HEALTHCARE', 'FORTIS HOSPITALS', 'DLF PROPERTIES', 'VEDANTA GROUP']
        },
        styles: {
          paddingTop: '80px',
          paddingBottom: '80px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#0F172A',
          backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop',
          textColor: '#F8FAFC',
          headingColor: '#FFFFFF',
          accentColor: '#3B82F6',
          alignment: 'center',
          animation: 'fade',
          visibility: 'all'
        }
      },
      {
        id: 'home-about-nx',
        name: 'About NX Solution',
        type: 'AboutNX',
        visible: true,
        content: {
          badge: '02',
          title: 'ABOUT NX SOLUTION',
          paragraph1: "NX Solution is an AI & IoT Solution Engineering company that designs and deploys intelligent ecosystems to solve complex operational challenges across industries.",
          paragraph2: "We don't sell products. We engineer complete solutions around real operational challenges.",
          paragraph3: "Every organization is unique. Every challenge is different. That's why every solution we build is designed specifically for your operational environment.",
          image: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=800&auto=format&fit=crop",
          missionIcon: "Target",
          missionTitle: "MISSION",
          missionDesc: "Simplifying complex operations through intelligent technology ecosystems.",
          visionIcon: "Eye",
          visionTitle: "VISION",
          visionDesc: "Building smarter, safer and future-ready organizations.",
          philosophyIcon: "Lightbulb",
          philosophyTitle: "CORE PHILOSOPHY",
          philosophyDesc: "We don't sell products. We engineer complete solutions around real operational challenges."
        },
        styles: {
          paddingTop: '60px',
          paddingBottom: '60px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#FFFFFF',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#16A34A',
          alignment: 'left',
          animation: 'fade',
          visibility: 'all'
        }
      },
      {
        id: 'home-challenges-to-solutions',
        name: 'From Challenges to Solutions',
        type: 'ChallengesToSolutions',
        visible: true,
        content: {
          badge: '03',
          title: 'FROM CHALLENGES TO SOLUTIONS',
          col1Title: 'OPERATIONAL CHALLENGES',
          col2Title: 'OUR ENGINEERING APPROACH',
          col3Title: 'INTELLIGENT OUTCOMES'
        },
        styles: {
          paddingTop: '60px',
          paddingBottom: '60px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#FFFFFF',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#15803D',
          alignment: 'left',
          animation: 'fade',
          visibility: 'all'
        }
      },
      {
        id: 'home-industries-serve',
        name: 'Industries We Serve',
        type: 'IndustriesServe',
        visible: true,
        content: {
          badge: '04',
          title: 'INDUSTRIES WE SERVE',
          ctaText: 'Explore All Industries',
          ctaUrl: '/industries',
          badgeBgColor: '#00244A',
          badgeTextColor: '#FFFFFF',
          headingColor: '#0F172A',
          containerWidth: 'max-w-7xl',
          items: []
        },
        styles: {
          paddingTop: '60px',
          paddingBottom: '60px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#F8FAFC',
          alignment: 'center',
          animation: 'fade',
          visibility: 'all'
        }
      }
    ]
  },
  {
    id: 'page-industries',
    name: 'Industries',
    slug: '/industries',
    seo: {
      title: 'Industries We Serve - Smart Security Solutions',
      description: 'Find custom-tailored enterprise automation, security, and tracking solutions for your specific industry vertical.',
      keywords: 'Healthcare AI, Manufacturing monitoring, Smart city systems, Corporate safety',
    },
    visible: true,
    sections: [
      {
        id: 'industries-grid',
        name: 'Smart Solutions by Industry',
        type: 'Industries',
        visible: true,
        content: {
          title: 'Industries',
          subtitle: 'Smart Solutions for Every Industry',
          items: [
            { id: 'ind-edu', icon: 'GraduationCap', title: 'Education', desc: 'Smart Campus, Security, Attendance & more', link: '/institution', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpOJ6kzEb2foXUT2GaJOT67sHriFRhgmpQPoEGFGCwXp8AxuUyASsmOnudec3V-ggyJ6Evmmt7qMesqhWRaOnAfhMfE7_YfK8pswYlzvrJRfhgti4kJpMNSDWXdedY0D4k1MrxeuqJOA5e6ldJQTNdSs7FHLTkMYl7DqZOwJO5cgqn9TVa7H8B50VhWPUJfY5-yUJ39PFq_BBopITPP_0Q3QyvyZXTxWPdIly20r5v2fQi1ZtN0Vwd-BDwdjwOceqb_VMfMt_LEvti' },
            { id: 'ind-health', icon: 'HeartPulse', title: 'Healthcare', desc: 'Hospital Security, Patient Tracking & more', link: '/industries?industry=healthcare', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGN9wHf0mfcWbCdcvZPC6GZoEIwhPssYF92v1gHliVgxG5egmV4OgKjLl72Un4ZGEQFQdPQu3zJUiDHpHLjrQI1x22ys1NJQKauhx00M0a00Y4MTmm0EyJbz7dbsuNSlu57Mx7O5rEB6eUyPM75TB7HMyj897y7neBUo5XRtYBdGds559-fWVX5qcAywMJzhFntkI-8N7dr1CCWMDJJDR6JReffQ3bi8TK58cxl8L3nfAZoG88me-aBVvefANQem_cQVPC0z5PpnV2' },
            { id: 'ind-mfg', icon: 'Factory', title: 'Manufacturing', desc: 'Factory Security, PPE, Asset Tracking & more', link: '/industries?industry=manufacturing', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPldBQlsTzg3S0eH7wI4PP9FHlnnKlurfmnjznkaEkN_W27_pQKcSis04A7Stv2ynJdp9H1i7gHLgMfJTyQxaCiutb1CaSh-WcQHQecQpDqWVcs-9CKrLy8LGguC4wvLx--5Z6ieyLTMYA_CFbE1cTaWFk-QK3YPLAhLHCuy9xaE9VeKCV4UcauHzMxqV5UFP-u0cgKMHfOe4HzHrhc3GifmM6hOgZaKxAz6GptG3r0lezzpwsLaf0lzL5Jn2BfyWHTkj46grF1qxQ' },
            { id: 'ind-corp', icon: 'Building2', title: 'Corporate', desc: 'Office Security, Attendance, Visitor Management', link: '/industries?industry=corporate', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsMJBEJANY54LpuQBuT5JM0BT68uoT0eCWh4lzdYaNuDh6zGn1fSUmOE43M-tVh8sASZxLsCnfZRA7fMPXMR2YyfBS66lOb7Uf7aH_z0glPZRZjeWs1IyXoC1q4B0mE345FsIu0_gyKtxIFLQetBcqnlxrsLOWO6G-Fprjhp6moOGhYvUO2ezADqJDoKSA3X-bW8bRvebFL8XUs6irRRh-gdedsvdBVA1l_mv73OFUVr0Q4eEgpJ5CmUuBnyJ0j_brcnVSx2NWjTaU' },
            { id: 'ind-soc', icon: 'Users', title: 'Smart Society', desc: 'Security, Visitor, Parking, Water Mgmt', link: '/industries?industry=society', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAG5YpeGLNAoKH2g8feYv7P7xzxE_MrKrl2hnuRJb9mBdXI0JpIrlw_2GRxPDFxwWJsgGo35R7VuLuIwyHvBYL3Erbqgvd4YMET15dYzsXVYlF6qVaJzp7lORzF8BB_ndGWME1Rp-dqM79Dui17esWCXW3_x47H-VfhADzYglTe7krMA0tR4jT3cGxlFqD2xipfmDlbYuXN8VmMnt59f64qlTtG80xal-jZIn_9KsOgIozZr0X1HLh0fKkgTmcxYmlCzFdazsa9JnIk' },
            { id: 'ind-log', icon: 'Truck', title: 'Logistics & Fleet', desc: 'Fleet Tracking, Driver Monitoring & more', link: '/industries?industry=logistics', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAeChlx7qsarYDZPV1Is4HETP7roFC6bhu1pdTOfBL4UL5_Zd_P9DZBSCvFeOgw71uOADTNroiAsGMo4JnxcMlp02u8XHIXFdR-_gOh5TR08qofmm_ghBMS0Kvm2ZjiekQPnwPyjG4lYIcog-HBbHPxjk2e268dHQm5J6UWc_4qJGBndldgrJiyW-T4rcZYw3qP3v1Os4aY4LFT7-xbBf-r3hxN0lIhRno90tGIqxv6WWRxuG347tc7daN9EUNpW7QGH2aSp6RuyNV' },
            { id: 'ind-city', icon: 'Milestone', title: 'Smart City', desc: 'Surveillance, Traffic, Environment & more', link: '/industries?industry=city', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIc3IFiDY0ZW7JrHpFygUz3SoZuPas3_8t_Bczvx3RFqBpKFd3BQglSDT2qs-a3XxgWih7prwoaOjLXwn2ziIHiCW4wQ7wlBRrq7q56FPbBJgBrApE1pWK0HiYqGiXj0lLfguh-JnD5qiYq-WxGZooIg3gMyV7mf8WJZv-hhcANehHbGO8d8b-RYmibA8Bfha1rezdlLxEG7cECU4bG2OXYQC0NTBEgF0gfRXCTisNdNMPeEr4oGPR-_6PsfEJCieBTyD9DrCYmzGD' },
            { id: 'ind-gov', icon: 'Building', title: 'Government', desc: 'Public Security, Smart Governance & more', link: '/industries?industry=government', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-E492tXHP5ajTRLwHi5Qoo_htTgEMq_kPZUEB6HSRRzu0TLl4jzzY0R5zgm0Df3eCTd0wI4G19Ds3SzI5mkBmfOqgOEwHxckoH1WoixvsSEHp-G5klLIw9DQyf0R51awBVd-9th9bi6LxAY5P-6FVOhj0fgk7VIKCBS_naDAZbdIzhlk2k3zeQT4NXZqkXEO3AiK4AICGgBt1n08KSUsws9_bxOgY6iWODiA-CsOiJ30O4u9AtIGnvpk3ZVS5ingGS5poX1Wo75pu' }
          ]
        },
        styles: {
          paddingTop: '64px',
          paddingBottom: '64px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#FFFFFF',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#2563EB',
          alignment: 'center',
          animation: 'slide-up',
          visibility: 'all'
        }
      }
    ]
  },
  {
    id: 'page-institution',
    name: 'Institution Type',
    slug: '/institution',
    seo: { title: 'Education Institutions - Smart Campus Solutions', description: 'Select your educational organization type to view tailored campus safety modules.', keywords: 'School security, College surveillance, University safety' },
    visible: true,
    sections: [
      {
        id: 'institution-selector',
        name: 'Select Institution',
        type: 'Institution',
        visible: true,
        content: {
          title: 'Education',
          subtitle: 'Select the type of Institution',
          items: [
            { icon: 'School', title: 'School', desc: 'Primary, Secondary & Higher Secondary', link: '/area' },
            { icon: 'Building2', title: 'College', desc: 'Degree, Engineering & Professional Colleges', link: '/area' },
            { icon: 'Building', title: 'University', desc: 'Universities & Deemed Universities', link: '/area' },
            { icon: 'Award', title: 'Coaching Institute', desc: 'Coaching, Training & Skill Institutes', link: '/area' },
            { icon: 'Hotel', title: 'Hostel', desc: 'Boys, Girls & PG Hostels', link: '/area' },
            { icon: 'BookOpen', title: 'Library', desc: 'Library Management Solutions', link: '/area' },
            { icon: 'Gamepad2', title: 'Playground', desc: 'Sports & Activity Management', link: '/area' },
            { icon: 'ClipboardList', title: 'Exam Center', desc: 'Exam & Assessment Management', link: '/area' }
          ]
        },
        styles: {
          paddingTop: '64px',
          paddingBottom: '64px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#F8FAFC',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#2563EB',
          alignment: 'center',
          animation: 'fade',
          visibility: 'all'
        }
      }
    ]
  },
  {
    id: 'page-area',
    name: 'Area Selector',
    slug: '/area',
    seo: { title: 'Campus Areas - Security Audits', description: 'Select a specific zone or sector within the institution premises to map risk scenarios.', keywords: 'Main gate security, classroom monitoring' },
    visible: true,
    sections: [
      {
        id: 'area-grid',
        name: 'Campus Zones',
        type: 'Area',
        visible: true,
        content: {
          title: 'School',
          subtitle: 'Select the Area',
          items: [
            { icon: 'LogIn', title: 'Main Gate', desc: 'Entry / Exit Point', link: '/problem' },
            { icon: 'Presentation', title: 'Classrooms', desc: 'Classroom Monitoring', link: '/problem' },
            { icon: 'Columns', title: 'Corridors', desc: 'Hallway & Corridor', link: '/problem' },
            { icon: 'BookOpen', title: 'Library', desc: 'Library Area', link: '/problem' },
            { icon: 'TreePine', title: 'Playground', desc: 'Playground & Sports', link: '/problem' },
            { icon: 'Coffee', title: 'Cafeteria', desc: 'Canteen & Dining', link: '/problem' },
            { icon: 'Car', title: 'Parking', desc: 'Parking Area', link: '/problem' },
            { icon: 'Grid', title: 'Other Areas', desc: 'Other Important Areas', link: '/problem' }
          ]
        },
        styles: {
          paddingTop: '64px',
          paddingBottom: '64px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#FFFFFF',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#2563EB',
          alignment: 'center',
          animation: 'slide-up',
          visibility: 'all'
        }
      }
    ]
  },
  {
    id: 'page-problem',
    name: 'Problem Selector',
    slug: '/problem',
    seo: { title: 'Main Gate Security Issues', description: 'Identify current vulnerabilities occurring at campus entrances.', keywords: 'unauthorized entry, tailgating' },
    visible: true,
    sections: [
      {
        id: 'problem-selector',
        name: ' VMS Problems',
        type: 'Problem',
        visible: true,
        content: {
          title: 'Security - Main Gate',
          subtitle: 'Select the Problem',
          items: [
            { icon: 'UserX', title: 'Unauthorized Entry', desc: 'People entering without permission', link: '/solution' },
            { icon: 'UserMinus', title: 'Tailgating', desc: 'Following authorized person', link: '/solution' },
            { icon: 'UserCheck', title: 'Fake Visitors', desc: 'Fake / Unregistered visitors', link: '/solution' },
            { icon: 'Clock', title: 'No Visitor Record', desc: 'Manual register, no digital record', link: '/solution' },
            { icon: 'AlertTriangle', title: 'Wrong Access', desc: 'Access to wrong people', link: '/solution' },
            { icon: 'Hourglass', title: 'Time Consumption', desc: 'Manual process takes time', link: '/solution' },
            { icon: 'MonitorOff', title: 'No Real-Time Monitoring', desc: 'No live monitoring system', link: '/solution' },
            { icon: 'HelpCircle', title: 'Other Problems', desc: 'Other security issues', link: '/solution' }
          ]
        },
        styles: {
          paddingTop: '64px',
          paddingBottom: '64px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#F8FAFC',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#EF4444',
          alignment: 'center',
          animation: 'scale-up',
          visibility: 'all'
        }
      }
    ]
  },
  {
    id: 'page-solution',
    name: 'AI Solution Detail',
    slug: '/solution',
    seo: { title: 'AI-Powered Security Solution for Main Gates', description: 'Combat unauthorized entry using AI Face Recognition and digital Visitor logs.', keywords: 'face scanning lock system' },
    visible: true,
    sections: [
      {
        id: 'solution-details',
        name: 'VMS Solution Details',
        type: 'Solution',
        visible: true,
        content: {
          title: 'Unauthorized Entry at Main Gate',
          subtitle: 'AI-Powered Security & Access Control Solution',
          problemHeading: 'Problem',
          problemDesc: 'Unauthorized people enter the school premises, which seriously compromises the safety and security of students, teachers, and administrative staff.',
          challengesHeading: 'Current Challenges',
          challenges: [
            'Manual verification takes excessive time and leads to human errors',
            'No real-time tracking or alerts when unwanted personnel try to bypass barriers',
            'Fake visitor IDs and physical tailgating go undetected',
            'Unreliable paper-based guest registries without photo-proofing'
          ],
          image: 'https://images.unsplash.com/photo-1541829019-2592e213f985?w=800&auto=format&fit=crop&q=80',
          ctaText: 'Book a Demo',
          badges: [
            { icon: 'ScanFace', text: 'AI Face Recognition' },
            { icon: 'KeyRound', text: 'Access Control' },
            { icon: 'Users', text: 'Visitor Management' },
            { icon: 'Eye', text: 'Real-time Monitoring' },
            { icon: 'Bell', text: 'Alerts & Notifications' },
            { icon: 'BarChart3', text: 'Reports & Analytics' }
          ]
        },
        styles: {
          paddingTop: '64px',
          paddingBottom: '64px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#FFFFFF',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#10B981',
          alignment: 'left',
          animation: 'fade',
          visibility: 'all'
        }
      }
    ]
  },
  {
    id: 'page-products',
    name: 'Products Grid',
    slug: '/products',
    seo: { title: 'Integrated Smart Software & Hardware Products - NX Solution', description: 'Explore our catalog of custom-designed AI security hardware and software control applications.', keywords: 'AI CCTV, face biometric device, visitor logs system' },
    visible: true,
    sections: [
      {
        id: 'products-catalog',
        name: 'Product Catalog Sections',
        type: 'Products',
        visible: true,
        content: {
          title: 'Products',
          subtitle: 'Integrated Hardware, Software & AI Solutions',
        },
        styles: {
          paddingTop: '64px',
          paddingBottom: '64px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#F8FAFC',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#2563EB',
          alignment: 'center',
          animation: 'fade',
          visibility: 'all'
        }
      }
    ]
  },
  {
    id: 'page-case-studies',
    name: 'Case Studies',
    slug: '/case-studies',
    seo: { title: 'Case Studies - Success Stories and Proof of Performance', description: 'See how NX Solution integrated AI networks at institutions, factories, and smart properties to establish reliable protection.', keywords: 'security client case study' },
    visible: true,
    sections: [
      {
        id: 'case-studies-section',
        name: 'Case Studies Panel',
        type: 'CaseStudies',
        visible: true,
        content: {
          title: 'Case Studies',
          subtitle: 'Real Solutions. Real Results.',
          items: [
            {
              id: 'cs-1',
              title: 'Smart School Security Integration',
              category: 'Education',
              desc: 'Deployed real-time Face Recognition access gates across 4 state-university campus main gates, reducing unauthorized tailgating incidents by 98.4% and automating attendance logs.',
              image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80'
            },
            {
              id: 'cs-2',
              title: 'Hospital Patient Safety and Tracking',
              category: 'Healthcare',
              desc: 'Integrated smart CCTV cameras with NX Sentinel software to alert staff instantly when Alzheimer patients enter unauthorized high-risk wards or wander near perimeter boundaries.',
              image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80'
            },
            {
              id: 'cs-3',
              title: 'Factory Safety Automation',
              category: 'Manufacturing',
              desc: 'Utilized deep-learning image processing to automatically stop dangerous factory conveyors if a floor worker enters the hazard-zone without complete PPE gear (Helmet/Vest).',
              image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80'
            },
            {
              id: 'cs-4',
              title: 'Smart Society Integrated Security',
              category: 'Smart City',
              desc: 'Launched an automated smart barrier solution coupled with license plate validation algorithms for a residential luxury township housing 1,200+ active families.',
              image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80'
            }
          ]
        },
        styles: {
          paddingTop: '64px',
          paddingBottom: '64px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#FFFFFF',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#2563EB',
          alignment: 'center',
          animation: 'slide-up',
          visibility: 'all'
        }
      }
    ]
  },
  {
    id: 'page-about',
    name: 'About Us',
    slug: '/about',
    seo: { title: 'About Us - Building Smarter and Safer Tomorrows', description: 'NX Solution is an enterprise technology provider building cutting-edge security systems, network architectures, and hardware modules.', keywords: 'about security company' },
    visible: true,
    sections: [
      {
        id: 'about-details',
        name: 'Corporate Overview',
        type: 'About',
        visible: true,
        content: {
          title: 'About NX Solution',
          subtitle: 'Building Smarter, Safer & Better Tomorrow',
          desc: 'NX Solution is an AI-powered technology company providing smart, integrated and scalable solutions for every industry. We combine AI, IoT, Software and Hardware to solve real-world operational challenges.',
          whoBadge: "WHO WE ARE",
          whoTitle: "Redefining Physical Security with Computer Vision",
          whoDesc: "At NX Solution, we bridge physical boundaries with intelligent code. Our automated systems enable educational institutions, hospitals, and high-tech corporate campuses to achieve reliable 24/7 gate entry tracking, sub-second biometric turnstile checks, and real-time blacklisted vehicle alerts.",
          whoCta: "Explore Systems FAQ",
          sustainabilityBadge: "SUSTAINABILITY",
          sustainabilityTitle: "Eco-Friendly Hardware & Smart Facility Efficiency",
          sustainabilityDesc: "We believe intelligent monitoring should preserve both safety and the planet. Our state-of-the-art turnstile gates and camera control boards are designed with smart power states, reducing carbon footprints by up to 35% during low-flow weekend hours while remaining fully responsive to trigger alerts.",
          sustainabilityCta: "Request Green Blueprint",
          sustainabilityImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
          faqBadge: "PRODUCT SUPPORT",
          faqTitle: "Technical System FAQ",
          faqDesc: "Instantly search common hardware compatibility and software regulatory questions.",
          faqs: [
            {
              category: "Systems",
              q: "How does the AI face terminal integrate with existing turnstiles?",
              a: "Our face terminal supports standard Wiegand and relay signal triggers. It can integrate directly with major mechanical turnstiles, speed gates, and magnetic lock brands, dispatching unlock signals in less than 300ms of verification."
            },
            {
              category: "Security",
              q: "Is my biometric data secure and compliant?",
              a: "Absolutely. We do not store full biometric raw images. All faces are converted into secure 512-byte irreversible hash arrays stored locally on-premise or within private, encrypted networks, fully complying with local GDPR and data privacy standards."
            },
            {
              category: "Systems",
              q: "What happens to the access control gates during a power failure?",
              a: "All mechanical doors and smart turnstiles are configured with standard fail-safe mechanisms. In the event of power loss or critical fire alarms, magnetic locks release automatically to enable safe emergency evacuations."
            },
            {
              category: "Corporate",
              q: "Can we schedule a custom system audit of our facility?",
              a: "Yes, our engineering team can review your building layout and design a full blueprint specifying optimal camera placements, barrier selections, and network topology. Contact our regional support desk to set up a site visit."
            },
            {
              category: "Security",
              q: "Does the system support multi-site centralized management?",
              a: "Yes. The NX Central Command software enables you to combine security feeds, visitor tracking logs, and employee attendance metrics across multiple physical office branches into a single unified cloud dashboard."
            },
            {
              category: "Corporate",
              q: "What is the standard warranty and post-deployment support structure?",
              a: "We offer a standard 24-month replacement warranty on all physical gating and terminal hardware, paired with 24/7 dedicated telephone and live remote diagnostic support plans tailored for enterprise clients."
            }
          ],
          contactBadge: "GLOBAL OFFICE",
          contactTitle: "Contact NX Headquarters",
          contactDesc: "Have questions about specific hardware compatibility, enterprise pricing structures, or regional deployment options? Reach out to our physical central helpdesk.",
          contactOfficeTitle: "Main Corporate Office",
          contactOfficeValue: "Sector 62, Electronic City, Noida, UP - 201301",
          contactPhoneTitle: "Central Desk Helpline",
          contactPhoneValue: "+91 (120) 4567 890",
          contactMailTitle: "Corporate Inquiries",
          contactMailValue: "contact@nx-solution.com",
          stats: [
            { label: 'Years of Experience', value: '10+' },
            { label: 'Active Clients', value: '500+' },
            { label: 'Projects Completed', value: '1000+' },
            { label: 'Expert Team Members', value: '50+' }
          ],
          whyTitle: 'Why Choose NX Solution?',
          whyBadges: [
            { icon: 'Brain', text: 'AI-Powered Analytics' },
            { icon: 'Cpu', text: 'Real-time Tracking' },
            { icon: 'Sliders', text: 'Custom Development' },
            { icon: 'Clock', text: '24/7 Remote Support' },
            { icon: 'Shield', text: 'Trusted by Enterprises' },
            { icon: 'Gauge', text: 'Future Ready Technology' }
          ]
        },
        styles: {
          paddingTop: '64px',
          paddingBottom: '64px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#F8FAFC',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#2563EB',
          alignment: 'center',
          animation: 'fade',
          visibility: 'all'
        }
      }
    ]
  },
  {
    id: 'page-resources',
    name: 'Resources',
    slug: '/resources',
    seo: { title: 'Insights, Whitepapers, and Blog Logs - NX Solution', description: 'Browse technical security articles, news reports, and detailed Whitepapers compiled by our expert network engineers.', keywords: 'security whitepapers cctv news' },
    visible: true,
    sections: [
      {
        id: 'resources-section',
        name: 'Technical Blogs Grid',
        type: 'Resources',
        visible: true,
        content: {
          title: 'Resources',
          subtitle: 'Insights, Blogs, News and More',
          blogs: [
            {
              id: 'blog-1',
              title: 'How AI is Transforming School Security Systems',
              category: 'Blogs',
              date: '20 May 2026',
              desc: 'An in-depth review on deep learning facial models and their impact on safety perimeters and digital student rosters.',
              image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80'
            },
            {
              id: 'blog-2',
              title: 'Benefits of AI Video Analytics in Commercial Properties',
              category: 'Whitepapers',
              date: '15 May 2026',
              desc: 'Whitepaper investigating the deployment of low-latency thermal and visual analysis engines at main access checkpoints.',
              image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80'
            },
            {
              id: 'blog-3',
              title: 'Smart Hospital Security Architecture Guide',
              category: 'Case Studies',
              date: '10 May 2026',
              desc: 'Architectural blueprint explaining secure network deployment of tracking tags and boundary radars inside critical care buildings.',
              image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80'
            }
          ]
        },
        styles: {
          paddingTop: '64px',
          paddingBottom: '64px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#FFFFFF',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#2563EB',
          alignment: 'center',
          animation: 'slide-up',
          visibility: 'all'
        }
      }
    ]
  },
  {
    id: 'page-contact',
    name: 'Contact',
    slug: '/contact',
    seo: { title: 'Contact Us - Get an Instant Enterprise Demo', description: 'Request a customized physical walkthrough of NX Solution hardware or ask about direct quotation prices.', keywords: 'contact sales quote request demo' },
    visible: true,
    sections: [
      {
        id: 'contact-section',
        name: 'Contact Form Frame',
        type: 'Contact',
        visible: true,
        content: {
          title: 'Contact Us',
          subtitle: 'We are here to help you!',
        },
        styles: {
          paddingTop: '64px',
          paddingBottom: '64px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#FFFFFF',
          textColor: '#1E293B',
          headingColor: '#0F172A',
          accentColor: '#2563EB',
          alignment: 'center',
          animation: 'fade',
          visibility: 'all'
        }
      }
    ]
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Pratham Admin',
    email: 'prathamgamer355@gmail.com',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }
];

const DEFAULT_ROLES: Role[] = [
  { name: 'Super Admin', permissions: ['all', 'cms_edit', 'crm_manage', 'media_edit', 'users_manage'] },
  { name: 'Designer', permissions: ['cms_edit', 'media_edit'] },
  { name: 'Content Manager', permissions: ['cms_edit', 'media_edit'] },
  { name: 'CRM Executive', permissions: ['crm_manage'] },
  { name: 'Viewer', permissions: [] }
];

class DatabaseEngine {
  private data!: SchemaDB;
  private mongoClient: MongoClient | null = null;
  private mongoDb: any = null;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  private ensureDataCollections() {
    if (!this.data) this.loadDefaults();
    if (!this.data.themeSettings) this.data.themeSettings = DEFAULT_THEME;
    if (!this.data.headerSettings) this.data.headerSettings = DEFAULT_HEADER;
    if (!this.data.footerSettings) this.data.footerSettings = DEFAULT_FOOTER;
    if (!Array.isArray(this.data.pages)) this.data.pages = DEFAULT_PAGES;
    if (!Array.isArray(this.data.products)) this.data.products = DEFAULT_PRODUCTS;
    if (!Array.isArray(this.data.caseStudies)) this.data.caseStudies = DEFAULT_CASE_STUDIES;
    if (!Array.isArray(this.data.leads)) this.data.leads = [];
    if (!Array.isArray(this.data.logs)) this.data.logs = [];
    if (!Array.isArray(this.data.users)) this.data.users = DEFAULT_USERS;
    if (!Array.isArray(this.data.roles)) this.data.roles = DEFAULT_ROLES;
    if (!Array.isArray(this.data.zones)) this.data.zones = [];
    if (!Array.isArray(this.data.problems)) this.data.problems = [];
    if (!Array.isArray(this.data.zoneProblems)) this.data.zoneProblems = [];
    if (!Array.isArray(this.data.solutions)) this.data.solutions = [];
    if (!Array.isArray(this.data.problemSolutions)) this.data.problemSolutions = [];
    if (!Array.isArray(this.data.solutionLeads)) this.data.solutionLeads = [];
    if (!Array.isArray(this.data.industries)) this.data.industries = [];
    if (!Array.isArray(this.data.institutions)) this.data.institutions = [];
    if (!Array.isArray(this.data.modules)) this.data.modules = [];
    if (!Array.isArray(this.data.technologyEcosystem)) this.data.technologyEcosystem = [...DEFAULT_TECHNOLOGIES];
    if (!Array.isArray(this.data.technologyCategories)) this.data.technologyCategories = [...DEFAULT_TECH_CATEGORIES];
    if (!Array.isArray(this.data.testimonials)) this.data.testimonials = [...DEFAULT_TESTIMONIALS];
  }

  private init() {
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
        this.ensureDataCollections();

        // Seed industries from industries page if empty
        if (!this.data.industries || this.data.industries.length === 0) {
          const page = this.data.pages?.find(p => p && p.slug === '/industries');
          const gridSec = page?.sections?.find(s => s && (s.type === 'Industries' || s.id === 'industries-grid'));
          const items = gridSec ? (gridSec.content?.items || []) : [];
          this.data.industries = items.map((item: any, idx: number) => ({
            id: item.id || `ind-${idx}-${Date.now()}`,
            name: item.title || '',
            slug: (item.slug || item.title || '').toLowerCase().trim().replace(/^\/?industries\/?/, '').replace(/^\//, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            shortDescription: item.desc || '',
            description: item.description || item.desc || '',
            coverImage: item.image || '',
            cardImage: item.image || '',
            icon: item.icon || 'GraduationCap',
            bannerImage: '',
            seo: {
              metaTitle: item.title,
              metaDescription: item.desc,
              keywords: ''
            },
            cta: {
              buttonText: item.button || 'Learn More',
              buttonLink: item.link || ''
            },
            status: item.status || 'published',
            featured: true,
            sortOrder: idx,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          this.save();
        }

        // Seed institutions from institution page if empty
        if (!this.data.institutions || this.data.institutions.length === 0) {
          const page = this.data.pages?.find(p => p && p.slug === '/institution');
          const gridSec = page?.sections?.find(s => s && (s.type === 'Institution' || s.id === 'institution-grid' || s.id === 'institution-selector'));
          const items = gridSec ? (gridSec.content?.items || []) : [];
          this.data.institutions = items.map((item: any, idx: number) => {
            const indId = (item.industryIds && item.industryIds.length > 0) ? item.industryIds[0] : 'ind-edu';
            return {
              id: item.id || `inst-${idx}-${Date.now()}`,
              industryId: indId,
              name: item.title || '',
              slug: (item.slug || item.title || '').toLowerCase().trim().replace(/^\//, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              shortDescription: item.desc || '',
              description: item.description || item.desc || '',
              cardImage: item.image || '',
              coverImage: item.image || '',
              bannerImage: '',
              icon: item.icon || 'School',
              contact: {
                email: '',
                phone: '',
                website: ''
              },
              seo: {
                metaTitle: item.title,
                metaDescription: item.desc,
                keywords: ''
              },
              cta: {
                buttonText: item.button || 'Learn More',
                buttonLink: item.buttonLink || ''
              },
              status: item.status || 'published',
              featured: true,
              sortOrder: idx,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          });
          this.save();
        }

        // Ensure Institution menu is removed from header menu links to hide it completely as requested
        if (this.data && this.data.headerSettings && Array.isArray(this.data.headerSettings.menus)) {
          const originalLength = this.data.headerSettings.menus.length;
          this.data.headerSettings.menus = this.data.headerSettings.menus.filter(
            m => m && m.label !== 'Institution' && m.url !== '/institution'
          );
          if (this.data.headerSettings.menus.length !== originalLength) {
            this.save();
          }
        }
      } catch (err) {
        console.error('Error reading database file, loading default schemas', err);
        this.loadDefaults();
      }
    } else {
      this.loadDefaults();
    }
    this.ensureDataCollections();

    // Seeding default zones if not present
    if (!this.data.zones || this.data.zones.length === 0) {
      this.data.zones = [
        {
          id: "zone-school-maingate",
          name: "Main Gate",
          slug: "main-gate",
          heading: "Main Entrance Security Gate",
          subHeading: "Choose the Security Area",
          description: "Monitor and manage vehicle access, visitor logs, and tailgating incidents at the primary entrance point using automated license plate recognition.",
          image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=600&auto=format&fit=crop",
          industryId: "ind-edu",
          institutionId: "inst-0-1784001788478",
          status: "published",
          sortOrder: 0,
          displayOrder: 0,
          isFeatured: true
        },
        {
          id: "zone-school-serverroom",
          name: "Server Room",
          slug: "server-room",
          heading: "Central Server & Data Room",
          subHeading: "Identify IT Vulnerabilities",
          description: "High-security surveillance area. Guard against unauthorized entry, environmental anomalies, and hardware tampering with smart biometric verification.",
          image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop",
          industryId: "ind-edu",
          institutionId: "inst-0-1784001788478",
          status: "published",
          sortOrder: 1,
          displayOrder: 1,
          isFeatured: false
        },
        {
          id: "zone-school-classroom",
          name: "Classrooms",
          slug: "classrooms",
          heading: "Academic Wing & Classrooms",
          subHeading: "Enhance Student Security",
          description: "Classrooms and lecture theatres equipped with dynamic safety monitoring, presence verification, and automated event emergency logs.",
          image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=600&auto=format&fit=crop",
          industryId: "ind-edu",
          institutionId: "inst-0-1784001788478",
          status: "published",
          sortOrder: 2,
          displayOrder: 2,
          isFeatured: false
        }
      ];
      this.save();
    }
    this.ensurePublicIds();
  }

  private loadDefaults() {
    this.data = {
      themeSettings: DEFAULT_THEME,
      headerSettings: DEFAULT_HEADER,
      footerSettings: DEFAULT_FOOTER,
      pages: DEFAULT_PAGES,
      products: DEFAULT_PRODUCTS,
      caseStudies: DEFAULT_CASE_STUDIES,
      leads: [],
      logs: [
        { id: 'log-1', userId: 'user-admin', userName: 'System', action: 'Initialize', details: 'Database initialized with 12 enterprise pre-seeded pages.', timestamp: new Date().toISOString() }
      ],
      users: DEFAULT_USERS,
      roles: DEFAULT_ROLES,
      zones: [],
      problems: [],
      zoneProblems: [],
      solutions: [],
      problemSolutions: [],
      solutionLeads: [],
      industries: [],
      institutions: [],
      modules: []
    };
    this.save();
  }

  public save() {
    try {
      const targetPath = getDbFilePath();
      fs.writeFileSync(targetPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Note: Local db.json write skipped or failed (expected on Vercel read-only filesystem):', err);
    }
  }

  public async connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        console.log('MONGODB_URI is not set. Operating in local JSON file mode.');
        return;
      }

      try {
        console.log('Connecting to MongoDB...');
        const client = new MongoClient(uri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        });
        await client.connect();

        // Parse dbName out of connection URI
        let dbName = 'nx_solution_cms';
        try {
          const parsedUrl = new URL(uri);
          dbName = parsedUrl.pathname.replace(/^\//, '') || 'nx_solution_cms';
        } catch (e) {
          const cleanUri = uri.split('?')[0];
          const lastSlash = cleanUri.lastIndexOf('/');
          if (lastSlash !== -1) {
            dbName = cleanUri.substring(lastSlash + 1) || 'nx_solution_cms';
          }
        }

        this.mongoClient = client;
        this.mongoDb = client.db(dbName);
        console.log(`Successfully connected to MongoDB database: ${dbName}`);

        await this.syncAndLoadFromMongo();
      } catch (err: any) {
        this.mongoClient = null;
        this.mongoDb = null;
        const errStr = String(err?.message || err?.stack || err);
        console.error('Failed to connect to MongoDB, falling back to local file-based database:', err);
        
        if (errStr.includes('alert number 80') || errStr.includes('ssl3_read_bytes') || errStr.includes('tlsv1 alert internal error')) {
          console.warn(`
========================================================================
⚠️  MONGODB CONNECTION FAILURE (TLS/SSL Handshake Error / Alert 80)
========================================================================
The connection to your MongoDB instance failed during the TLS handshake.

👉 PRIMARY CAUSE:
Your MongoDB Atlas Database "Network Access" rules are likely blocking 
this server's dynamic IP address.

👉 HOW TO SOLVE THIS:
1. Go to your MongoDB Atlas Dashboard (https://cloud.mongodb.com).
2. Click on "Network Access" under the "Security" tab in the left panel.
3. Click "+ Add IP Address" on the top right.
4. Select the "Allow Access From Anywhere" button (or enter "0.0.0.0/0").
5. Click "Confirm" and wait 1-2 minutes for Atlas to deploy the change.

✅ SEAMLESS FALLBACK ACTIVE:
The application has successfully fallen back to the local database file 
(db.json). All content, users, leads, and pages remain fully functional!
========================================================================
`);
        } else {
          console.warn(`
========================================================================
⚠️  MONGODB CONNECTION WARNING
========================================================================
Could not connect to the remote MongoDB database. 

Ensure your connection string (MONGODB_URI) is correct, and that the
database is online and accessible.

✅ SEAMLESS FALLBACK ACTIVE:
Operating in local JSON file-based database mode (db.json).
========================================================================
`);
        }
      }
    })();

    return this.connectionPromise;
  }

  private async syncAndLoadFromMongo() {
    if (!this.mongoDb) return;

    try {
      // 1. Theme Settings
      const themeCol = this.mongoDb.collection('themeSettings');
      let mongoTheme = await themeCol.findOne({ _id: 'global' });
      if (!mongoTheme) {
        console.log('Seeding themeSettings to MongoDB...');
        await themeCol.updateOne({ _id: 'global' }, { $set: DEFAULT_THEME }, { upsert: true });
        mongoTheme = DEFAULT_THEME;
      }
      this.data.themeSettings = { ...DEFAULT_THEME, ...mongoTheme };

      // 2. Header Settings
      const headerCol = this.mongoDb.collection('headerSettings');
      let mongoHeader = await headerCol.findOne({ _id: 'global' });
      if (!mongoHeader) {
        console.log('Seeding headerSettings to MongoDB...');
        await headerCol.updateOne({ _id: 'global' }, { $set: DEFAULT_HEADER }, { upsert: true });
        mongoHeader = DEFAULT_HEADER;
      }
      this.data.headerSettings = { ...DEFAULT_HEADER, ...mongoHeader };
      
      // Ensure Institution is removed from headers menus synced from MongoDB
      if (this.data.headerSettings && this.data.headerSettings.menus) {
        const hasInstitution = this.data.headerSettings.menus.some(m => m.label === 'Institution' || m.url === '/institution');
        if (hasInstitution) {
          this.data.headerSettings.menus = this.data.headerSettings.menus.filter(
            m => m.label !== 'Institution' && m.url !== '/institution'
          );
          this.save();
          this.persistSingletonToMongo('headerSettings', this.data.headerSettings);
        }
      }

      // 3. Footer Settings
      const footerCol = this.mongoDb.collection('footerSettings');
      let mongoFooter = await footerCol.findOne({ _id: 'global' });
      if (!mongoFooter) {
        console.log('Seeding footerSettings to MongoDB...');
        await footerCol.updateOne({ _id: 'global' }, { $set: DEFAULT_FOOTER }, { upsert: true });
        mongoFooter = DEFAULT_FOOTER;
      }
      this.data.footerSettings = { ...DEFAULT_FOOTER, ...mongoFooter };

      // 4. Pages
      const pagesCol = this.mongoDb.collection('pages');
      let mongoPages = await pagesCol.find({}).toArray();
      if (mongoPages.length === 0) {
        console.log('Seeding default pages to MongoDB...');
        await pagesCol.insertMany(JSON.parse(JSON.stringify(DEFAULT_PAGES)));
        mongoPages = DEFAULT_PAGES;
      }
      this.data.pages = mongoPages.map(({ _id, ...p }: any) => p as Page);

      // 5. Products
      const productsCol = this.mongoDb.collection('products');
      let mongoProducts = await productsCol.find({}).toArray();
      if (mongoProducts.length === 0) {
        console.log('Seeding default products to MongoDB...');
        await productsCol.insertMany(JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)));
        mongoProducts = DEFAULT_PRODUCTS;
      }
      this.data.products = mongoProducts.map(({ _id, ...p }: any) => p as Product);

      // 6. Users
      const usersCol = this.mongoDb.collection('users');
      let mongoUsers = await usersCol.find({}).toArray();
      if (mongoUsers.length === 0) {
        console.log('Seeding default users to MongoDB...');
        await usersCol.insertMany(JSON.parse(JSON.stringify(DEFAULT_USERS)));
        mongoUsers = DEFAULT_USERS;
      }
      this.data.users = mongoUsers.map(({ _id, ...p }: any) => p as User);

      // 7. Roles
      const rolesCol = this.mongoDb.collection('roles');
      let mongoRoles = await rolesCol.find({}).toArray();
      if (mongoRoles.length === 0) {
        console.log('Seeding default roles to MongoDB...');
        await rolesCol.insertMany(JSON.parse(JSON.stringify(DEFAULT_ROLES)));
        mongoRoles = DEFAULT_ROLES;
      }
      this.data.roles = mongoRoles.map(({ _id, ...p }: any) => p as Role);

      // 8. Leads
      const leadsCol = this.mongoDb.collection('leads');
      let mongoLeads = await leadsCol.find({}).toArray();
      this.data.leads = mongoLeads.map(({ _id, ...p }: any) => p as CRMLead);

      // 9. Case Studies
      const caseStudiesCol = this.mongoDb.collection('caseStudies');
      let mongoCaseStudies = await caseStudiesCol.find({}).toArray();
      if (mongoCaseStudies.length === 0) {
        console.log('Seeding default case studies to MongoDB...');
        await caseStudiesCol.insertMany(JSON.parse(JSON.stringify(DEFAULT_CASE_STUDIES)));
        mongoCaseStudies = DEFAULT_CASE_STUDIES;
      }
      this.data.caseStudies = mongoCaseStudies.map(({ _id, ...cs }: any) => cs as CaseStudy);

      // 10. Logs
      const logsCol = this.mongoDb.collection('logs');
      let mongoLogs = await logsCol.find({}).sort({ timestamp: -1 }).limit(100).toArray();
      if (mongoLogs.length === 0) {
        const defaultLog = { id: 'log-1', userId: 'user-admin', userName: 'System', action: 'Initialize', details: 'Database initialized with MongoDB.', timestamp: new Date().toISOString() };
        await logsCol.insertOne(defaultLog);
        mongoLogs = [defaultLog];
      }
      this.data.logs = mongoLogs.map(({ _id, ...p }: any) => p as AuditLog);

      // 11. Zones
      const zonesCol = this.mongoDb.collection('zones');
      let mongoZones = await zonesCol.find({}).toArray();
      this.data.zones = mongoZones.map(({ _id, ...z }: any) => {
        const item = { ...z };
        if (_id) item.id = z.id || _id.toString();
        return item as Zone;
      });

      // 12. Problems
      const problemsCol = this.mongoDb.collection('problems');
      let mongoProblems = await problemsCol.find({}).toArray();
      this.data.problems = mongoProblems.map(({ _id, ...p }: any) => {
        const item = { ...p };
        if (_id) item.id = p.id || _id.toString();
        return item as Problem;
      });

      // 13. ZoneProblems
      const zoneProblemsCol = this.mongoDb.collection('zoneProblems');
      let mongoZoneProblems = await zoneProblemsCol.find({}).toArray();
      this.data.zoneProblems = mongoZoneProblems.map(({ _id, ...zp }: any) => {
        const item = { ...zp };
        if (_id) item.id = zp.id || _id.toString();
        return item as ZoneProblem;
      });

      // 14. Solutions
      const solutionsCol = this.mongoDb.collection('solutions');
      let mongoSolutions = await solutionsCol.find({}).toArray();
      this.data.solutions = mongoSolutions.map(({ _id, ...s }: any) => {
        const item = { ...s };
        if (_id) item.id = s.id || _id.toString();
        return item as Solution;
      });

      // 15. ProblemSolutions
      const problemSolutionsCol = this.mongoDb.collection('problemSolutions');
      let mongoProblemSolutions = await problemSolutionsCol.find({}).toArray();
      this.data.problemSolutions = mongoProblemSolutions.map(({ _id, ...ps }: any) => {
        const item = { ...ps };
        if (_id) item.id = ps.id || _id.toString();
        return item as ProblemSolution;
      });

      // 16. SolutionLeads
      const solutionLeadsCol = this.mongoDb.collection('solutionLeads');
      let mongoSolutionLeads = await solutionLeadsCol.find({}).toArray();
      this.data.solutionLeads = mongoSolutionLeads.map(({ _id, ...sl }: any) => {
        const item = { ...sl };
        if (_id) item.id = sl.id || _id.toString();
        return item as SolutionLead;
      });

      // 17. Technology Ecosystem
      const techCol = this.mongoDb.collection('technology_ecosystem');
      let mongoTech = await techCol.find({}).toArray();
      if (mongoTech.length === 0) {
        console.log('Seeding technology_ecosystem to MongoDB...');
        for (const t of DEFAULT_TECHNOLOGIES) {
          await techCol.updateOne({ id: t.id }, { $set: t }, { upsert: true });
        }
        this.data.technologyEcosystem = [...DEFAULT_TECHNOLOGIES];
      } else {
        this.data.technologyEcosystem = mongoTech.map(({ _id, ...t }: any) => {
          const item = { ...t };
          if (_id) item.id = t.id || _id.toString();
          return item as TechnologyItem;
        });
      }

      // 18. Technology Categories
      const techCatCol = this.mongoDb.collection('technology_categories');
      let mongoTechCats = await techCatCol.find({}).toArray();
      if (mongoTechCats.length === 0) {
        for (const c of DEFAULT_TECH_CATEGORIES) {
          await techCatCol.updateOne({ id: c.id }, { $set: c }, { upsert: true });
        }
        this.data.technologyCategories = [...DEFAULT_TECH_CATEGORIES];
      } else {
        this.data.technologyCategories = mongoTechCats.map(({ _id, ...c }: any) => {
          const item = { ...c };
          if (_id) item.id = c.id || _id.toString();
          return item as TechnologyCategory;
        });
      }

      // 19. Testimonials
      const testiCol = this.mongoDb.collection('testimonials');
      let mongoTestimonials = await testiCol.find({}).toArray();
      if (mongoTestimonials.length === 0) {
        console.log('Seeding testimonials to MongoDB...');
        for (const t of DEFAULT_TESTIMONIALS) {
          await testiCol.updateOne({ id: t.id }, { $set: t }, { upsert: true });
        }
        this.data.testimonials = [...DEFAULT_TESTIMONIALS];
      } else {
        this.data.testimonials = mongoTestimonials.map(({ _id, ...t }: any) => {
          const item = { ...t };
          if (_id) item.id = t.id || _id.toString();
          return item as TestimonialItem;
        });
      }

      // Save the loaded state locally too so we are fully in sync
      this.ensurePublicIds();
      this.save();
      console.log('Synchronized MongoDB data with local database engine successfully.');
    } catch (err) {
      console.error('Error syncing and loading from MongoDB:', err);
    }
  }

  private async persistToMongo(collectionName: string, idField: string, item: any, isDelete = false) {
    if (!this.mongoDb) return;
    try {
      const col = this.mongoDb.collection(collectionName);
      if (isDelete) {
        await col.deleteOne({ [idField]: item });
      } else {
        // Upsert
        await col.updateOne(
          { [idField]: item[idField] },
          { $set: item },
          { upsert: true }
        );
      }
    } catch (err) {
      console.error(`MongoDB background persistence error on ${collectionName}:`, err);
    }
  }

  private async persistSingletonToMongo(collectionName: string, item: any) {
    if (!this.mongoDb) return;
    try {
      const col = this.mongoDb.collection(collectionName);
      await col.updateOne(
        { _id: 'global' },
        { $set: item },
        { upsert: true }
      );
    } catch (err) {
      console.error(`MongoDB background persistence error on singleton ${collectionName}:`, err);
    }
  }

  // Auth Operations
  public authenticateUser(email: string): User | null {
    const user = (this.data?.users || DEFAULT_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  public getUsers(): User[] {
    return this.data?.users || DEFAULT_USERS;
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
    this.persistToMongo('users', 'id', user);
  }

  public deleteUser(id: string) {
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.save();
    this.persistToMongo('users', 'id', id, true);
  }

  public updateUserRole(userId: string, role: any) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      this.save();
      this.persistToMongo('users', 'id', user);
    }
  }

  // Theme, Header, Footer
  public getTheme(): ThemeSettings {
    return this.data?.themeSettings || DEFAULT_THEME;
  }

  public updateTheme(theme: ThemeSettings) {
    this.data.themeSettings = theme;
    this.save();
    this.persistSingletonToMongo('themeSettings', theme);
  }

  public getHeader(): HeaderSettings {
    return this.data?.headerSettings || DEFAULT_HEADER;
  }

  public updateHeader(header: HeaderSettings) {
    this.data.headerSettings = header;
    this.save();
    this.persistSingletonToMongo('headerSettings', header);
  }

  public getFooter(): FooterSettings {
    return this.data?.footerSettings || DEFAULT_FOOTER;
  }

  public updateFooter(footer: FooterSettings) {
    this.data.footerSettings = footer;
    this.save();
    this.persistSingletonToMongo('footerSettings', footer);
  }

  // Pages
  public getPages(): Page[] {
    return this.data?.pages || DEFAULT_PAGES;
  }

  public getPageBySlug(slug: string): Page | undefined {
    // Exact or with trailing slash trimming
    const normalized = slug === '/' ? '/' : slug.replace(/\/$/, '');
    return (this.data?.pages || DEFAULT_PAGES).find(p => p.slug === normalized);
  }

  public updatePage(id: string, updatedPage: Page) {
    const idx = this.data.pages.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.pages[idx] = updatedPage;
      this.save();
      this.persistToMongo('pages', 'id', updatedPage);
    }
  }

  public createPage(page: Page) {
    this.data.pages.push(page);
    this.save();
    this.persistToMongo('pages', 'id', page);
  }

  public deletePage(id: string) {
    this.data.pages = this.data.pages.filter(p => p.id !== id);
    this.save();
    this.persistToMongo('pages', 'id', id, true);
  }

  // Products
  public getProducts(): Product[] {
    return this.data?.products || DEFAULT_PRODUCTS;
  }

  public getProductBySlug(slug: string): Product | undefined {
    return (this.data?.products || DEFAULT_PRODUCTS).find(p => p.slug === slug);
  }

  public saveProduct(product: Product) {
    const idx = this.data.products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      this.data.products[idx] = product;
    } else {
      this.data.products.push(product);
    }
    this.save();
    this.persistToMongo('products', 'id', product);
  }

  public deleteProduct(id: string) {
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.save();
    this.persistToMongo('products', 'id', id, true);
  }

  // Case Studies
  public getCaseStudies(): CaseStudy[] {
    return this.data.caseStudies || [];
  }

  public getCaseStudyBySlug(slug: string): CaseStudy | undefined {
    return (this.data.caseStudies || []).find(cs => cs.slug === slug);
  }

  public saveCaseStudy(caseStudy: CaseStudy) {
    if (!this.data.caseStudies) {
      this.data.caseStudies = [];
    }
    const idx = this.data.caseStudies.findIndex(cs => cs.id === caseStudy.id);
    if (idx !== -1) {
      this.data.caseStudies[idx] = caseStudy;
    } else {
      this.data.caseStudies.push(caseStudy);
    }
    this.save();
    this.persistToMongo('caseStudies', 'id', caseStudy);
  }

  public deleteCaseStudy(id: string) {
    this.data.caseStudies = (this.data.caseStudies || []).filter(cs => cs.id !== id);
    this.save();
    this.persistToMongo('caseStudies', 'id', id, true);
  }

  // CRM Leads
  public getLeads(): CRMLead[] {
    return this.data?.leads || [];
  }

  public saveLead(lead: CRMLead) {
    this.data.leads.unshift(lead);
    this.save();
    this.persistToMongo('leads', 'id', lead);
  }

  public updateLead(id: string, status: any, notes: string) {
    const lead = this.data.leads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      lead.notes = notes;
      this.save();
      this.persistToMongo('leads', 'id', lead);
    }
  }

  public deleteLead(id: string) {
    this.data.leads = this.data.leads.filter(l => l.id !== id);
    this.save();
    this.persistToMongo('leads', 'id', id, true);
  }

  // Logs
  public getLogs(): AuditLog[] {
    return this.data?.logs || [];
  }

  public addLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.data.logs.unshift(newLog);
    // Keep last 100 logs
    if (this.data.logs.length > 100) {
      this.data.logs = this.data.logs.slice(0, 100);
    }
    this.save();
    this.persistToMongo('logs', 'id', newLog);
  }

  // Roles
  public getRoles(): Role[] {
    return this.data?.roles || DEFAULT_ROLES;
  }

  public saveRolePermissions(roleName: string, permissions: string[]) {
    const role = this.data.roles.find(r => r.name === roleName);
    if (role) {
      role.permissions = permissions;
      this.save();
      this.persistToMongo('roles', 'name', role);
    }
  }

  // Zones Methods
  public getZones(): Zone[] {
    return this.data.zones || [];
  }

  public getZoneBySlug(slug: string): Zone | undefined {
    return (this.data.zones || []).find(z => z.slug === slug);
  }

  public saveZone(zone: Zone) {
    if (!this.data.zones) {
      this.data.zones = [];
    }
    const idx = this.data.zones.findIndex(z => z.id === zone.id);
    if (!zone.publicId) {
      if (idx !== -1 && this.data.zones[idx].publicId) {
        zone.publicId = this.data.zones[idx].publicId;
      } else {
        zone.publicId = generatePublicId('ARE');
      }
    }
    if (idx !== -1) {
      this.data.zones[idx] = zone;
    } else {
      this.data.zones.push(zone);
    }
    this.save();
    this.persistToMongo('zones', 'id', zone);
  }

  public deleteZone(id: string) {
    this.data.zones = (this.data.zones || []).filter(z => z.id !== id);
    this.save();
    this.persistToMongo('zones', 'id', id, true);
  }

  // Problems
  public getProblems(): Problem[] {
    return this.data.problems || [];
  }
  public getProblemBySlug(slug: string): Problem | undefined {
    return (this.data.problems || []).find(p => p.slug === slug);
  }
  public getProblemById(id: string): Problem | undefined {
    return (this.data.problems || []).find(p => p.id === id);
  }
  public saveProblem(problem: Problem) {
    if (!this.data.problems) this.data.problems = [];
    const idx = this.data.problems.findIndex(p => p.id === problem.id);
    if (!problem.publicId) {
      if (idx !== -1 && this.data.problems[idx].publicId) {
        problem.publicId = this.data.problems[idx].publicId;
      } else {
        problem.publicId = generatePublicId('PRB');
      }
    }
    if (idx !== -1) {
      this.data.problems[idx] = problem;
    } else {
      this.data.problems.push(problem);
    }
    this.save();
    this.persistToMongo('problems', 'id', problem);
  }
  public deleteProblem(id: string) {
    this.data.problems = (this.data.problems || []).filter(p => p.id !== id);
    // Also clear associated zoneProblem mappings and problemSolutions mappings
    this.data.zoneProblems = (this.data.zoneProblems || []).filter(zp => zp.problemId !== id);
    this.data.problemSolutions = (this.data.problemSolutions || []).filter(ps => ps.problemId !== id);
    this.save();
    this.persistToMongo('problems', 'id', id, true);
  }

  // Modules
  public getModules(): Module[] {
    return this.data.modules || [];
  }
  public getModuleBySlug(slug: string): Module | undefined {
    return (this.data.modules || []).find(m => m.slug === slug);
  }
  public getModuleById(id: string): Module | undefined {
    return (this.data.modules || []).find(m => m.id === id);
  }
  public getModulesByProblem(problemId: string): Module[] {
    return (this.data.modules || []).filter(m => m.problemId === problemId);
  }
  public saveModule(module: Module) {
    if (!this.data.modules) this.data.modules = [];
    const idx = this.data.modules.findIndex(m => m.id === module.id);
    if (!module.publicId) {
      if (idx !== -1 && this.data.modules[idx].publicId) {
        module.publicId = this.data.modules[idx].publicId;
      } else {
        module.publicId = generatePublicId('MOD');
      }
    }
    if (idx !== -1) {
      this.data.modules[idx] = module;
    } else {
      this.data.modules.push(module);
    }
    this.save();
    this.persistToMongo('modules', 'id', module);
  }
  public deleteModule(id: string) {
    this.data.modules = (this.data.modules || []).filter(m => m.id !== id);
    this.save();
    this.persistToMongo('modules', 'id', id, true);
  }

  // ZoneProblems Mappings
  public getZoneProblems(): ZoneProblem[] {
    return this.data.zoneProblems || [];
  }
  public getProblemsByZone(industryId: string, institutionId: string, zoneId: string): Problem[] {
    const mappings = (this.data.zoneProblems || []).filter(
      zp => zp.industryId === industryId && zp.institutionId === institutionId && zp.zoneId === zoneId
    );
    const problemIds = mappings.map(m => m.problemId);
    let problems = (this.data.problems || []).filter(p => problemIds.includes(p.id));

    // Robust Fallback: If no mappings exist in zoneProblems, check if problems are directly linked via fields
    if (problems.length === 0) {
      problems = (this.data.problems || []).filter(
        p => p.industryId === industryId && p.institutionId === institutionId && p.zoneId === zoneId
      );
    }
    return problems;
  }
  public assignProblemToZone(mapping: ZoneProblem) {
    if (!this.data.zoneProblems) this.data.zoneProblems = [];
    const exists = this.data.zoneProblems.some(
      zp => zp.industryId === mapping.industryId &&
            zp.institutionId === mapping.institutionId &&
            zp.zoneId === mapping.zoneId &&
            zp.problemId === mapping.problemId
    );
    if (!exists) {
      this.data.zoneProblems.push(mapping);
      this.save();
      this.persistToMongo('zoneProblems', 'id', mapping);
    }
  }
  public removeProblemFromZone(industryId: string, institutionId: string, zoneId: string, problemId: string) {
    const found = (this.data.zoneProblems || []).find(
      zp => zp.industryId === industryId && zp.institutionId === institutionId && zp.zoneId === zoneId && zp.problemId === problemId
    );
    if (found) {
      this.data.zoneProblems = (this.data.zoneProblems || []).filter(zp => zp.id !== found.id);
      this.save();
      this.persistToMongo('zoneProblems', 'id', found.id, true);
    }
  }
  public syncZoneProblemsForZone(industryId: string, institutionId: string, zoneId: string, problemIds: string[]) {
    if (!this.data.zoneProblems) this.data.zoneProblems = [];
    
    // Remove existing for this zone
    const toRemove = this.data.zoneProblems.filter(
      zp => zp.industryId === industryId && zp.institutionId === institutionId && zp.zoneId === zoneId
    );
    for (const item of toRemove) {
      this.persistToMongo('zoneProblems', 'id', item.id, true);
    }
    this.data.zoneProblems = this.data.zoneProblems.filter(
      zp => !(zp.industryId === industryId && zp.institutionId === institutionId && zp.zoneId === zoneId)
    );
    
    // Add new ones
    for (const pId of problemIds) {
      const mapping: ZoneProblem = {
        id: `zp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        industryId,
        institutionId,
        zoneId,
        problemId: pId
      };
      this.data.zoneProblems.push(mapping);
      this.persistToMongo('zoneProblems', 'id', mapping);
    }
    this.save();
  }

  // Solutions
  public getSolutions(): Solution[] {
    return this.data.solutions || [];
  }
  public getSolutionById(id: string): Solution | undefined {
    return (this.data.solutions || []).find(s => s.id === id);
  }
  public getSolutionBySlug(slug: string): Solution | undefined {
    return (this.data.solutions || []).find(s => s.slug === slug);
  }
  public getSolutionsByProblem(problemId: string): Solution[] {
    // Return solutions where direct problemId matches or problemSolutions mappings match
    const mappings = (this.data.problemSolutions || []).filter(ps => ps.problemId === problemId);
    const mappedSolutionIds = mappings.map(m => m.solutionId);
    return (this.data.solutions || []).filter(s => s.problemId === problemId || mappedSolutionIds.includes(s.id));
  }
  public saveSolution(solution: Solution) {
    if (!this.data.solutions) this.data.solutions = [];
    const idx = this.data.solutions.findIndex(s => s.id === solution.id);
    if (!solution.publicId) {
      if (idx !== -1 && this.data.solutions[idx].publicId) {
        solution.publicId = this.data.solutions[idx].publicId;
      } else {
        solution.publicId = generatePublicId('SOL');
      }
    }
    if (idx !== -1) {
      this.data.solutions[idx] = solution;
    } else {
      this.data.solutions.push(solution);
    }
    this.save();
    this.persistToMongo('solutions', 'id', solution);
  }
  public deleteSolution(id: string) {
    this.data.solutions = (this.data.solutions || []).filter(s => s.id !== id);
    // Also remove from mapping
    this.data.problemSolutions = (this.data.problemSolutions || []).filter(ps => ps.solutionId !== id);
    this.save();
    this.persistToMongo('solutions', 'id', id, true);
  }

  // ProblemSolutions Mappings
  public getProblemSolutions(): ProblemSolution[] {
    return this.data.problemSolutions || [];
  }
  public assignSolutionToProblem(mapping: ProblemSolution) {
    if (!this.data.problemSolutions) this.data.problemSolutions = [];
    const exists = this.data.problemSolutions.some(
      ps => ps.problemId === mapping.problemId && ps.solutionId === mapping.solutionId
    );
    if (!exists) {
      this.data.problemSolutions.push(mapping);
      this.save();
      this.persistToMongo('problemSolutions', 'id', mapping);
    }
  }
  public removeSolutionFromProblem(problemId: string, solutionId: string) {
    const found = (this.data.problemSolutions || []).find(
      ps => ps.problemId === problemId && ps.solutionId === solutionId
    );
    if (found) {
      this.data.problemSolutions = (this.data.problemSolutions || []).filter(ps => ps.id !== found.id);
      this.save();
      this.persistToMongo('problemSolutions', 'id', found.id, true);
    }
  }
  public syncSolutionsForProblem(problemId: string, solutionIds: string[]) {
    if (!this.data.problemSolutions) this.data.problemSolutions = [];
    
    // Delete existing
    const toRemove = this.data.problemSolutions.filter(ps => ps.problemId === problemId);
    for (const item of toRemove) {
      this.persistToMongo('problemSolutions', 'id', item.id, true);
    }
    this.data.problemSolutions = this.data.problemSolutions.filter(ps => ps.problemId !== problemId);
    
    // Add new
    for (const sId of solutionIds) {
      const mapping: ProblemSolution = {
        id: `ps-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        problemId,
        solutionId: sId
      };
      this.data.problemSolutions.push(mapping);
      this.persistToMongo('problemSolutions', 'id', mapping);
    }
    this.save();
  }

  // Solution Leads
  public getSolutionLeads(): SolutionLead[] {
    return this.data.solutionLeads || [];
  }
  public saveSolutionLead(lead: SolutionLead) {
    if (!this.data.solutionLeads) this.data.solutionLeads = [];
    this.data.solutionLeads.unshift(lead);
    this.save();
    this.persistToMongo('solutionLeads', 'id', lead);
  }
  public deleteSolutionLead(id: string) {
    this.data.solutionLeads = (this.data.solutionLeads || []).filter(l => l.id !== id);
    this.save();
    this.persistToMongo('solutionLeads', 'id', id, true);
  }

  // Industries Management
  public getIndustries(): Industry[] {
    return this.data.industries || [];
  }

  public saveIndustry(industry: Industry) {
    if (!this.data.industries) this.data.industries = [];
    const index = this.data.industries.findIndex(ind => ind.id === industry.id);
    if (!industry.publicId) {
      if (index !== -1 && this.data.industries[index].publicId) {
        industry.publicId = this.data.industries[index].publicId;
      } else {
        industry.publicId = generatePublicId('IND');
      }
    }
    if (index !== -1) {
      this.data.industries[index] = { ...this.data.industries[index], ...industry, updatedAt: new Date().toISOString() };
    } else {
      industry.createdAt = new Date().toISOString();
      industry.updatedAt = new Date().toISOString();
      this.data.industries.push(industry);
    }
    this.save();
    this.persistToMongo('industries', 'id', industry);
  }

  public deleteIndustry(id: string) {
    this.data.industries = (this.data.industries || []).filter(ind => ind.id !== id);
    this.save();
    this.persistToMongo('industries', 'id', id, true);
  }

  // Institutions Management
  public getInstitutions(): Institution[] {
    return this.data.institutions || [];
  }

  public saveInstitution(institution: Institution) {
    if (!this.data.institutions) this.data.institutions = [];
    const index = this.data.institutions.findIndex(inst => inst.id === institution.id);
    if (!institution.publicId) {
      if (index !== -1 && this.data.institutions[index].publicId) {
        institution.publicId = this.data.institutions[index].publicId;
      } else {
        institution.publicId = generatePublicId('INS');
      }
    }
    if (index !== -1) {
      this.data.institutions[index] = { ...this.data.institutions[index], ...institution, updatedAt: new Date().toISOString() };
    } else {
      institution.createdAt = new Date().toISOString();
      institution.updatedAt = new Date().toISOString();
      this.data.institutions.push(institution);
    }
    this.save();
    this.persistToMongo('institutions', 'id', institution);
  }

  public deleteInstitution(id: string) {
    this.data.institutions = (this.data.institutions || []).filter(inst => inst.id !== id);
    this.save();
    this.persistToMongo('institutions', 'id', id, true);
  }

  // Technology Ecosystem Management
  public getTechnologies(includeAll = false): TechnologyItem[] {
    if (!this.data.technologyEcosystem || this.data.technologyEcosystem.length === 0) {
      this.data.technologyEcosystem = [...DEFAULT_TECHNOLOGIES];
      this.save();
    }
    const items = this.data.technologyEcosystem || [];
    const filtered = includeAll ? items : items.filter(t => t.status === 'published');
    return [...filtered].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public saveTechnology(item: TechnologyItem) {
    if (!this.data.technologyEcosystem) this.data.technologyEcosystem = [];
    const idx = this.data.technologyEcosystem.findIndex(t => t.id === item.id);
    if (idx !== -1) {
      this.data.technologyEcosystem[idx] = { ...this.data.technologyEcosystem[idx], ...item, updatedAt: new Date().toISOString() };
    } else {
      if (!item.id) item.id = `tech-${Date.now()}`;
      if (!item.order) item.order = this.data.technologyEcosystem.length + 1;
      item.createdAt = new Date().toISOString();
      item.updatedAt = new Date().toISOString();
      this.data.technologyEcosystem.push(item);
    }
    this.save();
    this.persistToMongo('technology_ecosystem', 'id', item);
  }

  public deleteTechnology(id: string) {
    this.data.technologyEcosystem = (this.data.technologyEcosystem || []).filter(t => t.id !== id);
    this.save();
    this.persistToMongo('technology_ecosystem', 'id', id, true);
  }

  public reorderTechnologies(orderedIds: string[]) {
    if (!this.data.technologyEcosystem) return;
    orderedIds.forEach((id, index) => {
      const item = this.data.technologyEcosystem?.find(t => t.id === id);
      if (item) {
        item.order = index + 1;
        this.persistToMongo('technology_ecosystem', 'id', item);
      }
    });
    this.save();
  }

  public getTechnologyCategories(): TechnologyCategory[] {
    if (!this.data.technologyCategories || this.data.technologyCategories.length === 0) {
      this.data.technologyCategories = [...DEFAULT_TECH_CATEGORIES];
      this.save();
    }
    return this.data.technologyCategories;
  }

  // Testimonials Repository Management
  public getTestimonials(includeAll = false): TestimonialItem[] {
    if (!this.data.testimonials || this.data.testimonials.length === 0) {
      this.data.testimonials = [...DEFAULT_TESTIMONIALS];
      this.save();
    }
    const items = this.data.testimonials || [];
    const filtered = includeAll ? items : items.filter(t => t.status === 'published');
    return [...filtered].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public saveTestimonial(item: TestimonialItem) {
    if (!this.data.testimonials) this.data.testimonials = [];
    const idx = this.data.testimonials.findIndex(t => t.id === item.id);
    if (!item.publicId) {
      if (idx !== -1 && this.data.testimonials[idx].publicId) {
        item.publicId = this.data.testimonials[idx].publicId;
      } else {
        item.publicId = generatePublicId('TST');
      }
    }
    if (idx !== -1) {
      this.data.testimonials[idx] = { ...this.data.testimonials[idx], ...item, updatedAt: new Date().toISOString() };
    } else {
      if (!item.id) item.id = `testi-${Date.now()}`;
      if (!item.order) item.order = this.data.testimonials.length + 1;
      item.createdAt = new Date().toISOString();
      item.updatedAt = new Date().toISOString();
      this.data.testimonials.push(item);
    }
    this.save();
    this.persistToMongo('testimonials', 'id', item);
  }

  public deleteTestimonial(id: string) {
    this.data.testimonials = (this.data.testimonials || []).filter(t => t.id !== id);
    this.save();
    this.persistToMongo('testimonials', 'id', id, true);
  }

  public reorderTestimonials(orderedIds: string[]) {
    if (!this.data.testimonials) return;
    orderedIds.forEach((id, index) => {
      const item = this.data.testimonials?.find(t => t.id === id);
      if (item) {
        item.order = index + 1;
        this.persistToMongo('testimonials', 'id', item);
      }
    });
    this.save();
  }

  public addTechnologyCategory(name: string): TechnologyCategory {
    if (!this.data.technologyCategories) this.data.technologyCategories = [...DEFAULT_TECH_CATEGORIES];
    const exists = this.data.technologyCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) return exists;
    const newCat: TechnologyCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim()
    };
    this.data.technologyCategories.push(newCat);
    this.save();
    this.persistToMongo('technology_categories', 'id', newCat);
    return newCat;
  }


  // Batch process to ensure publicId exists for all entities
  public ensurePublicIds() {
    if (!this.data) return;
    let changed = false;

    if (Array.isArray(this.data.industries)) {
      this.data.industries.forEach(item => {
        if (!item.publicId || !item.publicId.startsWith('IND_')) {
          item.publicId = generatePublicId('IND', item.id || item.slug || item.name);
          changed = true;
          this.persistToMongo('industries', 'id', item);
        }
      });
    }

    if (Array.isArray(this.data.institutions)) {
      this.data.institutions.forEach(item => {
        if (!item.publicId || !item.publicId.startsWith('INS_')) {
          item.publicId = generatePublicId('INS', item.id || item.slug || item.name);
          changed = true;
          this.persistToMongo('institutions', 'id', item);
        }
      });
    }

    if (Array.isArray(this.data.zones)) {
      this.data.zones.forEach(item => {
        if (!item.publicId || !item.publicId.startsWith('ARE_')) {
          item.publicId = generatePublicId('ARE', item.id || item.slug || item.name);
          changed = true;
          this.persistToMongo('zones', 'id', item);
        }
      });
    }

    if (Array.isArray(this.data.problems)) {
      this.data.problems.forEach(item => {
        if (!item.publicId || !item.publicId.startsWith('PRB_')) {
          item.publicId = generatePublicId('PRB', item.id || item.slug || item.name);
          changed = true;
          this.persistToMongo('problems', 'id', item);
        }
      });
    }

    if (Array.isArray(this.data.solutions)) {
      this.data.solutions.forEach(item => {
        if (!item.publicId || !item.publicId.startsWith('SOL_')) {
          item.publicId = generatePublicId('SOL', item.id || item.slug || (item as any).name || item.title);
          changed = true;
          this.persistToMongo('solutions', 'id', item);
        }
      });
    }

    if (Array.isArray(this.data.modules)) {
      this.data.modules.forEach(item => {
        if (!item.publicId || !item.publicId.startsWith('MOD_')) {
          item.publicId = generatePublicId('MOD', item.id || item.slug || item.name);
          changed = true;
          this.persistToMongo('modules', 'id', item);
        }
      });
    }

    if (Array.isArray(this.data.pages)) {
      const homePage = this.data.pages.find(p => p && p.slug === '/');
      if (homePage && Array.isArray(homePage.sections)) {
        const hasSection = homePage.sections.some(s => s && (s.type === 'ChallengesToSolutions' || s.id === 'home-challenges-to-solutions'));
        if (!hasSection) {
          const idx = homePage.sections.findIndex(s => s && s.id === 'home-about-nx');
          const newSection = {
            id: 'home-challenges-to-solutions',
            name: 'From Challenges to Solutions',
            type: 'ChallengesToSolutions' as const,
            visible: true,
            content: {
              badge: '03',
              title: 'FROM CHALLENGES TO SOLUTIONS',
              col1Title: 'OPERATIONAL CHALLENGES',
              col2Title: 'OUR ENGINEERING APPROACH',
              col3Title: 'INTELLIGENT OUTCOMES'
            },
            styles: {
              paddingTop: '60px',
              paddingBottom: '60px',
              marginTop: '0px',
              marginBottom: '0px',
              backgroundColor: '#FFFFFF',
              textColor: '#1E293B',
              headingColor: '#0F172A',
              accentColor: '#15803D',
              alignment: 'left' as const,
              animation: 'fade' as const,
              visibility: 'all' as const
            }
          };
          if (idx !== -1) {
            homePage.sections.splice(idx + 1, 0, newSection);
          } else {
            homePage.sections.push(newSection);
          }
          // Same for draftSections
          if (Array.isArray(homePage.draftSections)) {
            const draftIdx = homePage.draftSections.findIndex(s => s && s.id === 'home-about-nx');
            const hasDraftSection = homePage.draftSections.some(s => s && (s.type === 'ChallengesToSolutions' || s.id === 'home-challenges-to-solutions'));
            if (!hasDraftSection) {
              if (draftIdx !== -1) {
                homePage.draftSections.splice(draftIdx + 1, 0, newSection);
              } else {
                homePage.draftSections.push(newSection);
              }
            }
          }
          changed = true;
          this.persistToMongo('pages', 'id', homePage);
        }

        // Ensure Clients Trust Us section exists right after Technology Ecosystem
        const hasClientsSection = homePage.sections.some(s => s && (s.type === 'ClientsTrustUs' || s.id === 'home-clients-trust-us'));
        if (!hasClientsSection) {
          const techIdx = homePage.sections.findIndex(s => s && (s.type === 'TechnologyEcosystem' || s.id === 'home-technology-ecosystem'));
          const clientsSection = {
            id: 'home-clients-trust-us',
            name: 'Clients Trust Us',
            type: 'ClientsTrustUs' as const,
            visible: true,
            content: {
              sectionHeader: {
                badgeNumber: "09",
                badgeText: "CLIENTS TRUST US",
                badgeColor: "#16A34A",
                headingColor: "#1e293b"
              },
              testimonials: [
                {
                  id: "testi-1",
                  quote: "NX Solution team understood our operational challenges deeply and delivered an intelligent solution that improved our security, efficiency and overall management.",
                  author: "- Director Operations",
                  organization: "Leading Educational Institution"
                },
                {
                  id: "testi-2",
                  quote: "Professional approach, deep technical knowledge and timely execution. NX Solution is a trusted technology partner for our organization.",
                  author: "- Facility Manager",
                  organization: "Multi-specialty Hospital"
                },
                {
                  id: "testi-3",
                  quote: "The automated safety and access monitoring installed across our manufacturing facility reduced operational delays significantly and improved compliance.",
                  author: "- EHS Head",
                  organization: "Industrial Manufacturing Plant"
                },
                {
                  id: "testi-4",
                  quote: "Seamless integration with our existing infrastructure and excellent ongoing support. Highly recommended for enterprise-scale smart security solutions.",
                  author: "- Chief Technology Officer",
                  organization: "Commercial Real Estate Group"
                }
              ]
            },
            styles: {
              paddingTop: '40px',
              paddingBottom: '60px',
              marginTop: '0px',
              marginBottom: '0px',
              backgroundColor: '#FFFFFF',
              textColor: '#1E293B',
              headingColor: '#0F172A',
              accentColor: '#16A34A',
              alignment: 'left' as const,
              animation: 'fade' as const,
              visibility: 'all' as const
            }
          };

          if (techIdx !== -1) {
            homePage.sections.splice(techIdx + 1, 0, clientsSection);
          } else {
            homePage.sections.push(clientsSection);
          }

          if (Array.isArray(homePage.draftSections)) {
            const draftTechIdx = homePage.draftSections.findIndex(s => s && (s.type === 'TechnologyEcosystem' || s.id === 'home-technology-ecosystem'));
            const hasDraftClients = homePage.draftSections.some(s => s && (s.type === 'ClientsTrustUs' || s.id === 'home-clients-trust-us'));
            if (!hasDraftClients) {
              if (draftTechIdx !== -1) {
                homePage.draftSections.splice(draftTechIdx + 1, 0, clientsSection);
              } else {
                homePage.draftSections.push(clientsSection);
              }
            }
          }
          changed = true;
          this.persistToMongo('pages', 'id', homePage);
        }
      }
    }

    if (changed) {
      this.save();
    }
  }
}

export function generatePublicId(prefix: string, seed?: string): string {
  if (!seed) {
    const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    let randomPart = '';
    for (let i = 0; i < 20; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}_${randomPart}`;
  }
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  let part = '';
  for (let i = 0; i < 20; i++) {
    const index = Math.abs((hash + i * 31 + seed.charCodeAt(i % seed.length))) % chars.length;
    part += chars.charAt(index);
  }
  return `${prefix}_${part}`;
}

export const db = new DatabaseEngine();

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nx_solution_platform';
const DB_NAME = process.env.MONGO_DB_NAME || 'nx_solution_platform';

console.log('🌱 Starting MongoDB Database Seeding Process...');
console.log(`Connecting to MongoDB at: ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

// 1. Initial Default Datasets
const DEFAULT_THEME = {
  id: 'theme-default',
  primaryColor: '#2563EB',
  secondaryColor: '#1E293B',
  accentColor: '#10B981',
  bgColor: '#F8FAFC',
  textColor: '#0F172A',
  typography: 'Inter',
  borderRadius: 'lg',
  shadow: 'md',
  spacing: 'normal',
  darkMode: false,
};

const DEFAULT_HEADER = {
  id: 'header-default',
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

const DEFAULT_FOOTER = {
  id: 'footer-default',
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

const DEFAULT_TECHNOLOGIES = [
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

const DEFAULT_TECH_CATEGORIES = [
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

const DEFAULT_TESTIMONIALS = [
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

const DEFAULT_PRODUCTS = [
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

const DEFAULT_CASE_STUDIES = [
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

const DEFAULT_USERS = [
  {
    id: 'user-admin',
    name: 'System Administrator',
    email: 'admin@nxsolution.com',
    roleId: 'role-super-admin',
    status: 'active' as const,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_ROLES = [
  {
    id: 'role-super-admin',
    name: 'Super Administrator',
    permissions: ['all']
  }
];

async function runSeed() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB successfully.');
    const db = client.db(DB_NAME);

    // 1. Seed Theme Settings
    await db.collection('themeSettings').replaceOne({ id: 'theme-default' }, DEFAULT_THEME, { upsert: true });
    console.log('✔ Theme Settings seeded.');

    // 2. Seed Header Settings
    await db.collection('headerSettings').replaceOne({ id: 'header-default' }, DEFAULT_HEADER, { upsert: true });
    console.log('✔ Header Settings seeded.');

    // 3. Seed Footer Settings
    await db.collection('footerSettings').replaceOne({ id: 'footer-default' }, DEFAULT_FOOTER, { upsert: true });
    console.log('✔ Footer Settings seeded.');

    // 4. Seed Products
    for (const prod of DEFAULT_PRODUCTS) {
      await db.collection('products').replaceOne({ id: prod.id }, prod, { upsert: true });
    }
    console.log(`✔ Products seeded (${DEFAULT_PRODUCTS.length} items).`);

    // 5. Seed Case Studies
    for (const cs of DEFAULT_CASE_STUDIES) {
      await db.collection('caseStudies').replaceOne({ id: cs.id }, cs, { upsert: true });
    }
    console.log(`✔ Case Studies seeded (${DEFAULT_CASE_STUDIES.length} items).`);

    // 6. Seed Technologies Ecosystem
    for (const tech of DEFAULT_TECHNOLOGIES) {
      await db.collection('technology_ecosystem').replaceOne({ id: tech.id }, tech, { upsert: true });
    }
    console.log(`✔ Technologies seeded (${DEFAULT_TECHNOLOGIES.length} items).`);

    // 7. Seed Tech Categories
    for (const cat of DEFAULT_TECH_CATEGORIES) {
      await db.collection('technology_categories').replaceOne({ id: cat.id }, cat, { upsert: true });
    }
    console.log(`✔ Tech Categories seeded (${DEFAULT_TECH_CATEGORIES.length} items).`);

    // 8. Seed Testimonials
    for (const test of DEFAULT_TESTIMONIALS) {
      await db.collection('testimonials').replaceOne({ id: test.id }, test, { upsert: true });
    }
    console.log(`✔ Testimonials seeded (${DEFAULT_TESTIMONIALS.length} items).`);

    // 9. Seed Users & Roles
    for (const u of DEFAULT_USERS) {
      await db.collection('users').replaceOne({ id: u.id }, u, { upsert: true });
    }
    for (const r of DEFAULT_ROLES) {
      await db.collection('roles').replaceOne({ id: r.id }, r, { upsert: true });
    }
    console.log('✔ Users & Roles seeded.');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runSeed();

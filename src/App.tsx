import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Cpu, RefreshCw, Layers, Sparkles } from 'lucide-react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { apiService } from './Public/Services/api';

const queryClient = new QueryClient();
import { ThemeSettings, HeaderSettings, FooterSettings, Page, Product } from './types';
import Header from './Public/Shared/Header/Header';
import Footer from './Public/Shared/Footer/Footer';
import SectionRenderer from './Public/Components/SectionRenderer';
import ProductDetails from './Public/ProductDetails/ProductDetails';
import Login from './SuperAdmin/Login/Login';
import AdminDashboard from './SuperAdmin/Admin/AdminDashboard';
import HomePageAdmin from './SuperAdmin/Admin/HomePageAdmin';
import IndustryManagement from './SuperAdmin/Admin/IndustryManagement';
import InstitutionManagement from './SuperAdmin/Admin/InstitutionManagement';
import AreaManagement from './SuperAdmin/Admin/AreaManagement';
import ProblemManagement from './SuperAdmin/Admin/ProblemManagement';
import ModuleManagement from './SuperAdmin/Admin/ModuleManagement';
import SolutionManagement from './SuperAdmin/Admin/SolutionManagement';
import WebsiteManagement from './SuperAdmin/Admin/WebsiteManagement';
import AboutUsManagement from './SuperAdmin/Admin/AboutUsManagement';
import TechnologyManagement from './SuperAdmin/Admin/TechnologyManagement';
import TestimonialsManagement from './SuperAdmin/Admin/TestimonialsManagement';

import { DynamicIndustryView, DynamicInstitutionView, DynamicZoneView } from './Public/Components/DynamicCMSViews';
import DynamicSolutionView from './Public/Components/DynamicSolutionView';
import DynamicProblemModulesView from './Public/Components/DynamicProblemModulesView';

// Universal dynamic breadcrumb strip for sub-pages
function BreadcrumbStrip({ path }: { path: string }) {
  if (path === '/' || !path) return null;

  // Split path into segments and build breadcrumbs
  const segments = path.split('/').filter(Boolean);
  
  // Format label nicely
  const formatLabel = (segment: string) => {
    const prettyMap: Record<string, string> = {
      'industries': 'Industries',
      'products': 'Products',
      'case-studies': 'Case Studies',
      'about': 'About Us',
      'resources': 'Resources',
      'contact': 'Contact',
      'product-details': 'Product Details',
      'solution': 'Solution',
    };
    if (prettyMap[segment.toLowerCase()]) return prettyMap[segment.toLowerCase()];
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <section className="bg-white py-4 w-full" id="section-universal-breadcrumb">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-xs flex items-center space-x-2 py-1">
        <Link to="/" className="font-semibold text-[#64748B] hover:text-blue-600 transition-colors">Home</Link>
        <span className="text-[#64748B] font-semibold">/</span>
        {segments.map((segment, idx) => {
          const isLast = idx === segments.length - 1;
          const url = '/' + segments.slice(0, idx + 1).join('/');
          const label = formatLabel(segment);

          if (isLast) {
            return (
              <span key={url} className="text-slate-900 font-bold">{label}</span>
            );
          }

          return (
            <React.Fragment key={url}>
              <Link to={url} className="font-semibold text-[#64748B] hover:text-blue-600 transition-colors">
                {label}
              </Link>
              <span className="text-[#64748B] font-semibold">/</span>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

// Unified Layout wrapper to handle dynamic Page rendering
function MainLayout({
  theme,
  headerSettings,
  footerSettings,
  pages,
  products,
  isAdminLoggedIn,
  onRefresh
}: {
  theme: ThemeSettings;
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  pages: Page[];
  products: Product[];
  isAdminLoggedIn: boolean;
  onRefresh: () => void;
}) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const { data: industriesData } = useQuery({
    queryKey: ['publicIndustriesList'],
    queryFn: () => apiService.getPublicIndustries(),
  });

  useEffect(() => {
    if (!industriesData || industriesData.length === 0) return;

    if (path === '/institution') {
      const eduInd = industriesData.find((ind: any) => ind.slug === 'education' || ind.name?.toLowerCase() === 'education');
      if (eduInd) {
        navigate(`/industries/${eduInd.publicId}`, { replace: true });
      }
    } else if (path === '/area') {
      const eduInd = industriesData.find((ind: any) => ind.slug === 'education' || ind.name?.toLowerCase() === 'education');
      if (eduInd) {
        apiService.getPublicIndustry(eduInd.publicId).then(res => {
          const firstInst = res?.institutions?.[0];
          if (firstInst) {
            navigate(`/industries/${eduInd.publicId}/${firstInst.publicId}`, { replace: true });
          } else {
            navigate(`/industries/${eduInd.publicId}`, { replace: true });
          }
        }).catch(() => {
          navigate(`/industries/${eduInd.publicId}`, { replace: true });
        });
      }
    }
  }, [path, industriesData, navigate]);

  // Render product details custom if matching path
  if (path === '/product-details') {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: theme.bgColor }}>
        <Header settings={headerSettings} theme={theme} isAdminLoggedIn={isAdminLoggedIn} pages={pages} />
        <main className="flex-grow">
          <BreadcrumbStrip path={path} />
          <ProductDetails theme={theme} />
        </main>
        <Footer settings={footerSettings} theme={theme} pages={pages} />
      </div>
    );
  }

  // Find exact match or default to '/'
  const matchedPage = pages.find((p) => p.slug === path) || pages.find((p) => p.slug === '/');

  if (!matchedPage) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <span className="text-sm font-semibold text-gray-400">Rendering CMS Pages...</span>
      </div>
    );
  }

  const isPreviewMode = new URLSearchParams(location.search).get('preview') === 'true';
  let displaySections = (isPreviewMode && matchedPage.draftSections && matchedPage.draftSections.length > 0)
    ? matchedPage.draftSections
    : matchedPage.sections;

  // Dynamically inject default home-our-solutions if missing on homepage
  if (matchedPage.slug === '/' && displaySections && !displaySections.some(s => s.id === 'home-our-solutions')) {
    const solutionProcessIdx = displaySections.findIndex(s => s.id === 'home-solution-process');
    const insertIdx = solutionProcessIdx !== -1 ? solutionProcessIdx + 1 : 5;
    const copied = [...displaySections];
    copied.splice(insertIdx, 0, {
      id: 'home-our-solutions',
      name: 'Our Solutions',
      type: 'OurSolutions',
      visible: true,
      content: {
        sectionHeader: {
          badgeNumber: "05",
          badgeText: "OUR SOLUTIONS",
          badgeColor: "#16A34A",
          headingColor: "#1e293b"
        },
        cards: [
          { id: "sol-1", title: "NX Sentinel", subtitle: "Smart Security", icon: "Binoculars", order: 1, status: true },
          { id: "sol-2", title: "NX Visitor", subtitle: "Visitor Management", icon: "Contact", order: 2, status: true },
          { id: "sol-3", title: "NX Access", subtitle: "Access Control", icon: "Lock", order: 3, status: true },
          { id: "sol-4", title: "NX Vision", subtitle: "Video Intelligence", icon: "Eye", order: 4, status: true },
          { id: "sol-5", title: "NX Attendance", subtitle: "Attendance System", icon: "CalendarCheck", order: 5, status: true },
          { id: "sol-6", title: "NX Fleet", subtitle: "Fleet Management", icon: "Truck", order: 6, status: true },
          { id: "sol-7", title: "NX Facility", subtitle: "Facility Management", icon: "Building2", order: 7, status: true },
          { id: "sol-8", title: "NX Environment", subtitle: "Environmental Monitoring", icon: "Leaf", order: 8, status: true },
          { id: "sol-9", title: "NX Command Center", subtitle: "Centralized Operations", icon: "Monitor", order: 9, status: true }
        ],
        settings: {
          backgroundColor: "#ffffff",
          containerWidth: "max-w-7xl",
          topPadding: "60",
          bottomPadding: "60",
          alignment: "left"
        },
        status: "published"
      },
      styles: {
        paddingTop: '60px',
        paddingBottom: '60px',
        marginTop: '0px',
        marginBottom: '0px',
        backgroundColor: '#FFFFFF',
        alignment: 'center',
        animation: 'fade',
        visibility: 'all'
      }
    });
    displaySections = copied;
  }

  // Dynamically inject default home-our-current-work if missing on homepage
  if (matchedPage.slug === '/' && displaySections && !displaySections.some(s => s.id === 'home-our-current-work')) {
    const ourSolutionsIdx = displaySections.findIndex(s => s.id === 'home-our-solutions');
    const insertIdx = ourSolutionsIdx !== -1 ? ourSolutionsIdx + 1 : 6;
    const copied = [...displaySections];
    copied.splice(insertIdx, 0, {
      id: 'home-our-current-work',
      name: 'Our Current Work',
      type: 'OurCurrentWork',
      visible: true,
      content: {
        sectionHeader: {
          badgeNumber: "07",
          badgeText: "OUR CURRENT WORK",
          badgeColor: "#16A34A",
          headingColor: "#1e293b"
        },
        cards: [
          {
            id: "work-1",
            title: "Smart Campus Security Ecosystem",
            subtitle: "Indore, MP",
            image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
            statusText: "Active Project",
            statusColor: "#16A34A"
          },
          {
            id: "work-2",
            title: "Hospital Operation Intelligence",
            subtitle: "Indore, MP",
            image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
            statusText: "Under Development",
            statusColor: "#1D4ED8"
          },
          {
            id: "work-3",
            title: "Manufacturing Automation Solutions",
            subtitle: "Pithampur, MP",
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
            statusText: "Active Research",
            statusColor: "#EA580C"
          },
          {
            id: "work-4",
            title: "Corporate Workplace Intelligence",
            subtitle: "Indore, MP",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
            statusText: "Design Phase",
            statusColor: "#7C3AED"
          },
          {
            id: "work-5",
            title: "Logistics & Warehouse Operations",
            subtitle: "Indore, MP",
            image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
            statusText: "Prototype",
            statusColor: "#1E3A8A"
          },
          {
            id: "work-6",
            title: "Smart Infrastructure Solutions",
            subtitle: "Indore, MP",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
            statusText: "Planning",
            statusColor: "#0D9488"
          }
        ],
        exploreText: "Explore All Projects",
        exploreUrl: "/projects",
        settings: {
          backgroundColor: "#ffffff",
          containerWidth: "max-w-7xl",
          topPadding: "60",
          bottomPadding: "60",
          alignment: "left"
        }
      },
      styles: {
        paddingTop: '60px',
        paddingBottom: '60px',
        marginTop: '0px',
        marginBottom: '0px',
        backgroundColor: '#FFFFFF',
        alignment: 'center',
        animation: 'fade',
        visibility: 'all'
      }
    });
    displaySections = copied;
  }

  // Dynamically inject default home-technology-ecosystem if missing on homepage
  if (matchedPage.slug === '/' && displaySections && !displaySections.some(s => s.id === 'home-technology-ecosystem')) {
    const currentWorkIdx = displaySections.findIndex(s => s.id === 'home-our-current-work');
    const insertIdx = currentWorkIdx !== -1 ? currentWorkIdx + 1 : 7;
    const copied = [...displaySections];
    copied.splice(insertIdx, 0, {
      id: 'home-technology-ecosystem',
      name: 'Technology Ecosystem',
      type: 'TechnologyEcosystem',
      visible: true,
      content: {
        sectionHeader: {
          badgeNumber: "08",
          badgeText: "TECHNOLOGY ECOSYSTEM",
          badgeColor: "#16A34A",
          headingColor: "#1e293b"
        },
        captionText: "Compatible with leading enterprise hardware and software technologies based on project requirements.",
        logosTopRow: [
          { id: "tech-1", name: "HIKVISION" },
          { id: "tech-2", name: "dahua" },
          { id: "tech-3", name: "MATRIX" },
          { id: "tech-4", name: "suprema" },
          { id: "tech-5", name: "AXIS" },
          { id: "tech-6", name: "BOSCH" },
          { id: "tech-7", name: "Honeywell" },
          { id: "tech-8", name: "CP PLUS" }
        ],
        logosBottomRow: [
          { id: "tech-9", name: "ZKTeco" },
          { id: "tech-10", name: "eSSL" },
          { id: "tech-11", name: "MANTRA" },
          { id: "tech-12", name: "D-Link" },
          { id: "tech-13", name: "tp-link" },
          { id: "tech-14", name: "UBIQUITI NETWORKS" },
          { id: "tech-15", name: "Microsoft" },
          { id: "tech-16", name: "aws" },
          { id: "tech-17", name: "Google Cloud" },
          { id: "tech-18", name: "ONVIF" },
          { id: "tech-19", name: "MQTT" }
        ],
        settings: {
          backgroundColor: "#ffffff",
          containerWidth: "max-w-7xl",
          topPadding: "40",
          bottomPadding: "60",
          alignment: "left"
        },
        status: "published"
      },
      styles: {
        paddingTop: '40px',
        paddingBottom: '60px',
        marginTop: '0px',
        marginBottom: '0px',
        backgroundColor: '#FFFFFF',
        alignment: 'center',
        animation: 'fade',
        visibility: 'all'
      }
    });
    displaySections = copied;
  }

  const displaySeo = (isPreviewMode && matchedPage.draftSeo) ? matchedPage.draftSeo : matchedPage.seo;

  useEffect(() => {
    if (displaySeo?.title) {
      document.title = displaySeo.title;
    }
  }, [displaySeo]);

  // If page is marked inactive, block public users but allow admins
  if (matchedPage.visible === false && !isAdminLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-[#030e17] text-slate-300 justify-center items-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex items-center justify-center mb-6 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-pulse">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Temporarily Offline</h1>
        <p className="text-sm text-slate-400 mb-6 max-w-md">This page is temporarily unavailable. Please check back later.</p>
        <Link to="/" className="bg-[#0066FF] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-all shadow-[0_4px_12px_rgba(0,102,255,0.3)]">
          Return to Home
        </Link>
      </div>
    );
  }

  const hasBreadcrumbSection = displaySections && displaySections.some(section => section.type === 'Breadcrumb');

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: theme.bgColor }}>
      <Header settings={headerSettings} theme={theme} isAdminLoggedIn={isAdminLoggedIn} pages={pages} />
      
      {/* Dynamic Content Sections */}
      <main className="flex-grow">
        {!hasBreadcrumbSection && path !== '/' && (
          <BreadcrumbStrip path={path} />
        )}
        {isPreviewMode && (
          <div className="bg-amber-500 text-slate-900 py-2 px-4 text-center text-xs font-bold uppercase tracking-wider relative z-50 flex items-center justify-center gap-2">
            <span>⚠️ You are viewing a DRAFT preview of the Home Page.</span>
            <button onClick={() => window.close()} className="underline ml-2 hover:text-slate-700">Close Preview</button>
          </div>
        )}
        {displaySections && displaySections.map((section) => (
          <div key={section.id}>
            <SectionRenderer
              section={section}
              theme={theme}
              products={products}
              onFormSubmit={() => onRefresh()}
            />
          </div>
        ))}

        {displaySections?.length === 0 && (
          <div className="text-center py-20 text-gray-500 text-xs">
            This page has no visual sections. Open the Super Admin panel to build it!
          </div>
        )}
      </main>

      <Footer settings={footerSettings} theme={theme} pages={pages} />
    </div>
  );
}

// Developer Environment Indicator Dock - only shown on admin pages, hidden on public website
function DeveloperDock() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin');

  if (!isAdminPath) {
    return null;
  }

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-[11px] text-gray-300 px-4 py-2.5 flex items-center justify-between relative z-50">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block animate-ping"></span>
        <span className="font-semibold text-slate-200">Interactive Preview Dock</span>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/" className="hover:text-white font-medium">Public View</Link>
        <span className="text-gray-600">|</span>
        <Link to="/admin" className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Open Admin Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all initial schemas from MongoDB
  const loadCMSData = async () => {
    try {
      // Load schemas sequentially rather than in parallel to avoid transient 429 rate limits
      const t = await apiService.getTheme();
      const h = await apiService.getHeader();
      const f = await apiService.getFooter();
      const p = await apiService.getPages();
      const pr = await apiService.getProducts();

      setTheme(t);
      setHeaderSettings(h);
      setFooterSettings(f);
      setPages(p);
      setProducts(pr);
    } catch (err) {
      console.error('Failed to load full-stack CMS schemas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCMSData();

    // Check existing staff session
    const token = localStorage.getItem('nx_admin_token');
    const userStr = localStorage.getItem('nx_admin_user');
    if (token && userStr) {
      setIsAdminLoggedIn(true);
      setAdminUser(JSON.parse(userStr));
    }
  }, []);

  const handleLoginSuccess = (token: string, user: any) => {
    setIsAdminLoggedIn(true);
    setAdminUser(user);
  };

  if (loading || !theme || !headerSettings || !footerSettings) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="flex items-center space-x-2 animate-pulse">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Cpu className="w-6 h-6" />
          </div>
          <span className="font-extrabold tracking-wide text-lg">NX SOLUTION</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Synchronizing visual layers from MongoDB...</span>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <DeveloperDock />

      <Routes>
        {/* Admin Login portal */}
        <Route
          path="/admin/login"
          element={
            isAdminLoggedIn ? (
              <Navigate to="/admin" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route
          path="/superadmin/login"
          element={
            isAdminLoggedIn ? (
              <Navigate to="/admin" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Super Admin Panel Workspace */}
        <Route
          path="/admin"
          element={
            isAdminLoggedIn ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/superadmin/admin/home-page"
          element={
            isAdminLoggedIn ? (
              <HomePageAdmin theme={theme} onRefresh={loadCMSData} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/superadmin/admin/website-management"
          element={
            isAdminLoggedIn ? (
              <WebsiteManagement />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/superadmin/admin/about-us"
          element={
            isAdminLoggedIn ? (
              <AboutUsManagement />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/superadmin/admin/industries"
          element={
            isAdminLoggedIn ? (
              <IndustryManagement />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/superadmin/admin/industries/:industryId/institutions"
          element={
            isAdminLoggedIn ? (
              <InstitutionManagement />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/superadmin/admin/institutions/:institutionId/areas"
          element={
            isAdminLoggedIn ? (
              <AreaManagement />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/superadmin/admin/areas/:areaId/problems"
          element={
            isAdminLoggedIn ? (
              <ProblemManagement />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/superadmin/admin/problems/:problemId/modules"
          element={
            isAdminLoggedIn ? (
              <ModuleManagement />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/superadmin/admin/modules/:moduleId/solution"
          element={
            isAdminLoggedIn ? (
              <SolutionManagement />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/superadmin/admin/technology-ecosystem"
          element={
            isAdminLoggedIn ? (
              <TechnologyManagement />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/superadmin/admin/testimonials"
          element={
            isAdminLoggedIn ? (
              <TestimonialsManagement />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        {/* Dynamic Industry and Institution Category System Routing */}
        <Route
          path="/industries/:industryPublicId"
          element={
            <DynamicIndustryView
              theme={theme}
              headerSettings={headerSettings}
              footerSettings={footerSettings}
              pages={pages}
              products={products}
              isAdminLoggedIn={isAdminLoggedIn}
              onRefresh={loadCMSData}
            />
          }
        />

        <Route
          path="/industries/:industryPublicId/:institutionPublicId"
          element={
            <DynamicInstitutionView
              theme={theme}
              headerSettings={headerSettings}
              footerSettings={footerSettings}
              pages={pages}
              products={products}
              isAdminLoggedIn={isAdminLoggedIn}
              onRefresh={loadCMSData}
            />
          }
        />

        <Route
          path="/industries/:industryPublicId/:institutionPublicId/:areaPublicId"
          element={
            <DynamicZoneView
              theme={theme}
              headerSettings={headerSettings}
              footerSettings={footerSettings}
              pages={pages}
              products={products}
              isAdminLoggedIn={isAdminLoggedIn}
              onRefresh={loadCMSData}
            />
          }
        />

        <Route
          path="/industries/:industryPublicId/:institutionPublicId/:areaPublicId/:problemPublicId"
          element={
            <DynamicProblemModulesView
              theme={theme}
              headerSettings={headerSettings}
              footerSettings={footerSettings}
              isAdminLoggedIn={isAdminLoggedIn}
            />
          }
        />

        <Route
          path="/industries/:industryPublicId/:institutionPublicId/:areaPublicId/:problemPublicId/:modulePublicId"
          element={
            <DynamicSolutionView
              theme={theme}
              headerSettings={headerSettings}
              footerSettings={footerSettings}
              isAdminLoggedIn={isAdminLoggedIn}
            />
          }
        />

        <Route
          path="/industries/:industryPublicId/:institutionPublicId/:areaPublicId/:problemPublicId/:modulePublicId/:solutionPublicId"
          element={
            <DynamicSolutionView
              theme={theme}
              headerSettings={headerSettings}
              footerSettings={footerSettings}
              isAdminLoggedIn={isAdminLoggedIn}
            />
          }
        />

        {/* Catch all to render CMS page layers */}
        <Route
          path="*"
          element={
            <MainLayout
              theme={theme}
              headerSettings={headerSettings}
              footerSettings={footerSettings}
              pages={pages}
              products={products}
              isAdminLoggedIn={isAdminLoggedIn}
              onRefresh={loadCMSData}
            />
          }
        />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  );
}

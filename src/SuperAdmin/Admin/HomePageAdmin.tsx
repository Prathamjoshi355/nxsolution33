import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff,
  Star,
  Send, 
  Layers, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Settings2, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Info,
  Upload,
  X,
  Copy,
  RotateCcw,
  Image as ImageIcon,
  Search,
  MessageSquareQuote
} from 'lucide-react';
import { apiService } from '../../Public/Services/api';
import { Page, SectionComponent, CaseStudy, TestimonialItem, HomeTestimonialSelectedRef } from '../../types';
import ImageUploader from '../../Public/Components/ImageUploader';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import * as Icons from 'lucide-react';

interface HomePageAdminProps {
  theme: any;
  onRefresh: () => void;
}

export default function HomePageAdmin({ theme, onRefresh }: HomePageAdminProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Shared Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    onConfirmAction: (() => void) | null;
  }>({
    isOpen: false,
    title: 'Confirm Delete',
    itemName: '',
    onConfirmAction: null,
  });

  const promptDelete = (title: string, itemName: string, action: () => void) => {
    setDeleteModal({
      isOpen: true,
      title,
      itemName,
      onConfirmAction: () => action,
    });
  };

  // Home Page State
  const [pageData, setPageData] = useState<Page | null>(null);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Sections State (Working Draft Copy)
  const [sections, setSections] = useState<SectionComponent[]>([]);
  const [allIndustries, setAllIndustries] = useState<any[]>([]);
  const [allSolutions, setAllSolutions] = useState<any[]>([]);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [allProblems, setAllProblems] = useState<any[]>([]);
  const [allCaseStudies, setAllCaseStudies] = useState<CaseStudy[]>([]);
  const [allTestimonials, setAllTestimonials] = useState<TestimonialItem[]>([]);

  // Selected Section for Editing
  const [selectedSectionId, setSelectedSectionId] = useState<string>('home-hero');

  // About NX section states
  const [aboutActiveTab, setAboutActiveTab] = useState<'content' | 'cards' | 'layout' | 'buttons' | 'preview' | 'history'>('content');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [aboutHistory, setAboutHistory] = useState<Array<{ timestamp: string; content: any; styles: any }>>([]);

  // From Challenges to Solutions states
  const [challengesActiveTab, setChallengesActiveTab] = useState<'header' | 'col1' | 'col2' | 'col3' | 'styling' | 'arrows' | 'history'>('header');
  const [editingItemType, setEditingItemType] = useState<'challenge' | 'step' | 'outcome' | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [challengesHistory, setChallengesHistory] = useState<Array<{ timestamp: string; content: any; styles: any }>>([]);

  // Solution Engineering Process states
  const [solutionProcessActiveTab, setSolutionProcessActiveTab] = useState<'header' | 'steps' | 'settings' | 'history'>('header');
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [solutionProcessHistory, setSolutionProcessHistory] = useState<Array<{ timestamp: string; content: any; styles: any }>>([]);

  // Our Solutions states
  const [ourSolutionsActiveTab, setOurSolutionsActiveTab] = useState<'header' | 'cards' | 'settings' | 'history'>('header');
  const [editingOurSolutionCardId, setEditingOurSolutionCardId] = useState<string | null>(null);
  const [ourSolutionsHistory, setOurSolutionsHistory] = useState<Array<{ timestamp: string; content: any; styles: any }>>([]);
  const [ourSolutionsSearch, setOurSolutionsSearch] = useState('');
  const [ourSolutionsModuleFilter, setOurSolutionsModuleFilter] = useState('');
  const [ourSolutionsIndustryFilter, setOurSolutionsIndustryFilter] = useState('');
  const [editingSelectedSolId, setEditingSelectedSolId] = useState<string | null>(null);

  // Our Current Work states
  const [ourCurrentWorkActiveTab, setOurCurrentWorkActiveTab] = useState<'header' | 'cards' | 'settings'>('header');
  const [editingOurCurrentWorkCardId, setEditingOurCurrentWorkCardId] = useState<string | null>(null);
  const [ourCurrentWorkSearch, setOurCurrentWorkSearch] = useState('');
  const [ourCurrentWorkIndustryFilter, setOurCurrentWorkIndustryFilter] = useState('');

  // Clients Trust Us states
  const [clientsTrustUsActiveTab, setClientsTrustUsActiveTab] = useState<'header' | 'testimonials' | 'carousel' | 'settings'>('header');
  const [clientsTrustUsSearch, setClientsTrustUsSearch] = useState('');
  const [clientsTrustUsIndustryFilter, setClientsTrustUsIndustryFilter] = useState('');

  // Load Home Page data
  const loadHomePage = async () => {
    setLoading(true);
    try {
      let csList: any[] = [];
      try {
        const [indList, solList, modList, probList, fetchedCsList, testiList] = await Promise.all([
          apiService.getAdminIndustries().catch(() => []),
          apiService.getSolutions().catch(() => []),
          apiService.getModules().catch(() => []),
          apiService.getProblems().catch(() => []),
          apiService.getCaseStudies().catch(() => []),
          apiService.getAdminTestimonials().catch(() => [])
        ]);
        csList = fetchedCsList || [];
        setAllIndustries(indList || []);
        setAllSolutions(solList || []);
        setAllModules(modList || []);
        setAllProblems(probList || []);
        setAllCaseStudies(csList);
        setAllTestimonials(testiList || []);
      } catch (err) {
        console.error('Failed to load catalogs:', err);
      }
      const data = await apiService.getPageBySlug('/');
      if (data) {
        setPageData(data);
        setIsPageVisible(data.visible !== false);
        
        // Use draft SEO/sections if available, else fall back to published
        const currentSeo = data.draftSeo || data.seo || { title: '', description: '', keywords: '' };
        setSeoTitle(currentSeo.title || '');
        setSeoDescription(currentSeo.description || '');
        setSeoKeywords(currentSeo.keywords || '');

        const currentSections = data.draftSections && data.draftSections.length > 0 
          ? data.draftSections 
          : data.sections || [];
        
        // If no sections exist at all, build a default structure
        let finalSections = [...currentSections];
        if (finalSections.length === 0) {
          finalSections.push(
            {
              id: 'home-hero',
              name: 'Home Hero Section',
              type: 'Hero',
              visible: true,
              content: {
                backgroundImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9pO5Y1ow4MdXwejzbNoQpKc8kKIgBfcmqj0uiUy_jli6aPXxXe2mxzYQIS7BSBa7REo2COHvEOAXcTBmFCY6240FnJpRGFDGI3efzXqT3wyhSh7HWHCIZwSBg5KMa24Z9CtkU2HEk0oPgZddCSkyq2hH6ltaV7Hp3YZ5whP8GhHutnu19UlDL4Y3ppGX9_zbP2D1jUCYI5tz2nBGEXauOtziro2JnOF69Pq7Ol0HgYpxQ_Rs3GnUXLpH9YLdijgSq047e6Gu7FKI',
                smallBadge: 'OFFLINE',
                gradientText: 'MINIMALIST',
                title: 'Engineering <br />Intelligent <span className="text-[#5bdf8c]">Solutions</span> <br />for Modern Operations',
                subtitle: 'AI & IoT powered ecosystems that solve real-world operational challenges and make operations smarter, faster, safer, and more efficient.',
                ctaText: 'Explore Industries',
                ctaUrl: '/industries',
                showCta: true,
                secondaryCtaText: 'Schedule Consultation',
                secondaryCtaUrl: '/contact',
                showSecondaryCta: true,
                trustedText: 'Trusted by 500+ Organizations',
                logos: ['Google', 'Microsoft', 'NVIDIA', 'Amazon', 'Intel'],
                badges: [
                  { text: 'AI Powered' },
                  { text: 'Smart Automation' },
                  { text: 'Real-time Monitoring' },
                  { text: 'Data-Driven Insights' },
                  { text: 'Scalable Solutions' },
                  { text: 'End-to-End Support' }
                ]
              },
              styles: {
                paddingTop: '64px',
                paddingBottom: '64px',
                marginTop: '0px',
                marginBottom: '0px',
                backgroundColor: '#02050d',
                alignment: 'center',
                animation: 'fade',
                visibility: 'all'
              }
            },
            {
              id: 'home-features',
              name: 'Key Feature Cards',
              type: 'Industries',
              visible: true,
              content: {
                title: 'OUR ADVANTAGES',
                subtitle: 'Tailored solutions designed for rapid enterprise deployment and seamless integration.',
                items: [
                  {
                    id: 'feat-1',
                    title: 'Edge Integration',
                    desc: 'Run sub-second inference local to camera rigs and security points.',
                    icon: 'Cpu',
                    link: '/solution'
                  },
                  {
                    id: 'feat-2',
                    title: 'Cloud Dashboard',
                    desc: 'Aggregate high-throughput analytics and generate monthly reports.',
                    icon: 'Layers',
                    link: '/industries'
                  },
                  {
                    id: 'feat-3',
                    title: 'Enterprise Security',
                    desc: 'AES-256 state encryption and multi-factor role authentication.',
                    icon: 'ShieldCheck',
                    link: '/contact'
                  }
                ]
              },
              styles: {
                paddingTop: '64px',
                paddingBottom: '64px',
                marginTop: '0px',
                marginBottom: '0px',
                backgroundColor: '#FFFFFF',
                alignment: 'center',
                animation: 'slide-up',
                visibility: 'all'
              }
            },
            {
              id: 'home-cta',
              name: 'Bottom Call to Action',
              type: 'CTA',
              visible: true,
              content: {
                title: 'Ready to Secure Your Premises?',
                subtitle: 'Connect with an systems integration architect today to customize your setup.',
                ctaText: 'Get in Touch',
                ctaUrl: '/contact'
              },
              styles: {
                paddingTop: '64px',
                paddingBottom: '64px',
                marginTop: '0px',
                marginBottom: '0px',
                backgroundColor: '#0066FF',
                headingColor: '#FFFFFF',
                alignment: 'center',
                animation: 'scale-up',
                visibility: 'all'
              }
            }
          );
        }

        // Ensure home-about-nx is present
        const hasAboutNX = finalSections.some(s => s.id === 'home-about-nx');
        if (!hasAboutNX && finalSections.length > 0) {
          const heroIdx = finalSections.findIndex(s => s.id === 'home-hero');
          const insertIdx = heroIdx !== -1 ? heroIdx + 1 : 1;
          finalSections.splice(insertIdx, 0, {
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
          });
        }

        // Ensure home-challenges-to-solutions is present
        const hasChallengesToSolutions = finalSections.some(s => s.id === 'home-challenges-to-solutions');
        if (!hasChallengesToSolutions && finalSections.length > 0) {
          const aboutIdx = finalSections.findIndex(s => s.id === 'home-about-nx');
          const insertIdx = aboutIdx !== -1 ? aboutIdx + 1 : 2;
          finalSections.splice(insertIdx, 0, {
            id: 'home-challenges-to-solutions',
            name: 'From Challenges to Solutions',
            type: 'ChallengesToSolutions',
            visible: true,
            content: {
              badge: '03',
              title: 'FROM CHALLENGES TO SOLUTIONS',
              badgeBgColor: '#15803D',
              badgeTextColor: '#FFFFFF',
              headingColor: '#0F172A',
              cardGap: '1rem',
              containerWidth: 'max-w-7xl',
              showArrows: true,
              showConnectors: true,
              arrowIcon: 'ArrowRight',
              arrowColor: '#64748B',
              arrowSize: '24px',
              arrowAnimation: 'animate-pulse',
              borderRadius: '12px',
              shadow: 'sm',
              hoverEffect: true,
              layoutDesktop: '3',
              layoutTablet: '2',
              layoutMobile: '1',

              col1Title: 'OPERATIONAL CHALLENGES',
              col1Color: '#B91C1C',
              col1BorderColor: '#FEE2E2',
              col1CardBg: '#FFF8F8',
              challenges: [
                { id: 'ch-1', title: 'Manual Processes', icon: 'ClipboardList', description: 'Labor-intensive activities with high latency and slow feedback loops.', status: true, order: 1 },
                { id: 'ch-2', title: 'Security Risks', icon: 'ShieldAlert', description: 'Unmonitored assets and high vulnerability to data or physical breaches.', status: true, order: 2 },
                { id: 'ch-3', title: 'Human Errors', icon: 'UserMinus', description: 'Fatigue-driven oversight causing systemic service interruptions.', status: true, order: 3 },
                { id: 'ch-4', title: 'Operational Delays', icon: 'Clock', description: 'Bottlenecks in workflow approvals and event handling protocols.', status: true, order: 4 },
                { id: 'ch-5', title: 'Lack of Visibility', icon: 'Search', description: 'Fragmented streams of operations offering no centralized view.', status: true, order: 5 },
                { id: 'ch-6', title: 'Compliance Issues', icon: 'FileWarning', description: 'Non-conformity to regional safety guidelines and audit trails.', status: true, order: 6 },
                { id: 'ch-7', title: 'Resource Inefficiency', icon: 'AlertTriangle', description: 'Sub-optimal asset allocations leading to excessive expenditures.', status: true, order: 7 }
              ],

              col2Title: 'OUR ENGINEERING APPROACH',
              col2Color: '#1D4ED8',
              col2BorderColor: '#DBEAFE',
              col2CardBg: '#F0F7FF',
              engineeringSteps: [
                { id: 'eng-1', title: 'Observe', icon: 'Eye', description: 'We map operational workflows and identify major operational challenges.', stepNumber: '01', status: true, order: 1 },
                { id: 'eng-2', title: 'Analyze', icon: 'LineChart', description: 'Continuous data tracking to locate inefficiencies and risk surfaces.', stepNumber: '02', status: true, order: 2 },
                { id: 'eng-3', title: 'Design', icon: 'PenTool', description: 'Engineering edge intelligence, secure sensor logic, and dashboards.', stepNumber: '03', status: true, order: 3 },
                { id: 'eng-4', title: 'Integrate', icon: 'Cpu', description: 'Unifying software platforms and peripheral devices into a single grid.', stepNumber: '04', status: true, order: 4 },
                { id: 'eng-5', title: 'Deploy', icon: 'Server', description: 'Launching highly resilient local networks with cloud synchronization.', stepNumber: '05', status: true, order: 5 },
                { id: 'eng-6', title: 'Optimize', icon: 'Sparkles', description: 'Iterative tuning via machine learning algorithms for seamless performance.', stepNumber: '06', status: true, order: 6 }
              ],

              col3Title: 'INTELLIGENT OUTCOMES',
              col3Color: '#15803D',
              col3BorderColor: '#D1FAE5',
              col3CardBg: '#F4FBF7',
              outcomes: [
                { id: 'out-1', title: 'Smarter Operations', icon: 'Brain', description: 'Contextual automation layers driving high throughput decisions.', status: true, order: 1 },
                { id: 'out-2', title: 'Automation', icon: 'RefreshCw', description: 'Zero-touch triggers optimizing recurring compliance workflows.', status: true, order: 2 },
                { id: 'out-3', title: 'Real-time Visibility', icon: 'Tv', description: 'Centralized live map displaying telemetry updates on unified terminals.', status: true, order: 3 },
                { id: 'out-4', title: 'Better Decisions', icon: 'BarChart3', description: 'Algorithmic forecasting based on high precision operational trends.', status: true, order: 4 },
                { id: 'out-5', title: 'Higher Productivity', icon: 'Zap', description: 'Releasing engineering teams from manual logging workflows.', status: true, order: 5 },
                { id: 'out-6', title: 'Cost Optimization', icon: 'DollarSign', description: 'Substantial decrease in energy, waste, and audit remediation fees.', status: true, order: 6 },
                { id: 'out-7', title: 'Safer Environment', icon: 'ShieldCheck', description: 'Intelligent security barriers proactively guarding operational safety.', status: true, order: 7 }
              ]
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
        }

        // Ensure home-industries-serve is present
        const hasIndustriesServe = finalSections.some(s => s.id === 'home-industries-serve');
        if (!hasIndustriesServe && finalSections.length > 0) {
          const challengesIdx = finalSections.findIndex(s => s.id === 'home-challenges-to-solutions');
          const insertIdx = challengesIdx !== -1 ? challengesIdx + 1 : 3;
          finalSections.splice(insertIdx, 0, {
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
          });
        }

        // Ensure home-solution-process is present
        const hasSolutionProcess = finalSections.some(s => s.id === 'home-solution-process');
        if (!hasSolutionProcess && finalSections.length > 0) {
          const industriesIdx = finalSections.findIndex(s => s.id === 'home-industries-serve');
          const insertIdx = industriesIdx !== -1 ? industriesIdx + 1 : 4;
          finalSections.splice(insertIdx, 0, {
            id: 'home-solution-process',
            name: 'Solution Engineering Process',
            type: 'SolutionProcess',
            visible: true,
            content: {
              sectionHeader: {
                badgeNumber: "05",
                badgeText: "OUR SOLUTION ENGINEERING PROCESS",
                badgeColor: "#22c55e",
                headingColor: "#1e293b"
              },
              processSteps: [
                { id: "step-1", icon: "Binoculars", title: "Observe Operations", subtitle: "Observe", description: "Analyze and document operational activities", order: 1, status: true, iconColor: "#059669", iconBgColor: "#ffffff", circleBorderColor: "#e2e8f0", circleSize: "90", iconSize: "36", titleColor: "#1e293b", subtitleColor: "#64748b" },
                { id: "step-2", icon: "Search", title: "Understand Challenges", subtitle: "Understand", description: "Understand critical bottlenecks and gaps", order: 2, status: true, iconColor: "#059669", iconBgColor: "#ffffff", circleBorderColor: "#e2e8f0", circleSize: "90", iconSize: "36", titleColor: "#1e293b", subtitleColor: "#64748b" },
                { id: "step-3", icon: "LineChart", title: "Analyze Environment", subtitle: "Analyze", description: "Assess environment data and telemetry", order: 3, status: true, iconColor: "#059669", iconBgColor: "#ffffff", circleBorderColor: "#e2e8f0", circleSize: "90", iconSize: "36", titleColor: "#1e293b", subtitleColor: "#64748b" },
                { id: "step-4", icon: "PenTool", title: "Design Ecosystem", subtitle: "Design", description: "Draft smart interconnected platforms", order: 4, status: true, iconColor: "#059669", iconBgColor: "#ffffff", circleBorderColor: "#e2e8f0", circleSize: "90", iconSize: "36", titleColor: "#1e293b", subtitleColor: "#64748b" },
                { id: "step-5", icon: "Cpu", title: "Select Technologies", subtitle: "Select", description: "Select chips, edge networks, models", order: 5, status: true, iconColor: "#059669", iconBgColor: "#ffffff", circleBorderColor: "#e2e8f0", circleSize: "90", iconSize: "36", titleColor: "#1e293b", subtitleColor: "#64748b" },
                { id: "step-6", icon: "Rocket", title: "Deploy Solution", subtitle: "Deploy", description: "Launch cloud containers and edge services", order: 6, status: true, iconColor: "#059669", iconBgColor: "#ffffff", circleBorderColor: "#e2e8f0", circleSize: "90", iconSize: "36", titleColor: "#1e293b", subtitleColor: "#64748b" },
                { id: "step-7", icon: "RefreshCw", title: "Optimize Continuously", subtitle: "Optimize", description: "Monitor and retrain feedback loops", order: 7, status: true, iconColor: "#059669", iconBgColor: "#ffffff", circleBorderColor: "#e2e8f0", circleSize: "90", iconSize: "36", titleColor: "#1e293b", subtitleColor: "#64748b" }
              ],
              settings: {
                backgroundColor: "#ffffff",
                connectorColor: "#22c55e",
                connectorStyle: "dotted",
                connectorEnabled: true,
                connectorAnimation: "none",
                connectorThickness: "1.5",
                containerWidth: "max-w-7xl",
                gap: 40,
                enabled: true,
                topPadding: "60",
                bottomPadding: "60",
                stepGap: "12",
                iconGap: "16",
                alignment: "center"
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
        }

        // Ensure home-our-solutions is present
        const hasOurSolutions = finalSections.some(s => s.id === 'home-our-solutions');
        if (!hasOurSolutions && finalSections.length > 0) {
          const solutionProcessIdx = finalSections.findIndex(s => s.id === 'home-solution-process');
          const insertIdx = solutionProcessIdx !== -1 ? solutionProcessIdx + 1 : 5;
          finalSections.splice(insertIdx, 0, {
            id: 'home-our-solutions',
            name: 'Our Solutions',
            type: 'OurSolutions',
            visible: true,
            content: {
              sectionHeader: {
                badgeNumber: "06",
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
        }

        // Ensure home-our-current-work is present
        const hasOurCurrentWork = finalSections.some(s => s.id === 'home-our-current-work');
        if (!hasOurCurrentWork && finalSections.length > 0) {
          const ourSolutionsIdx = finalSections.findIndex(s => s.id === 'home-our-solutions');
          const insertIdx = ourSolutionsIdx !== -1 ? ourSolutionsIdx + 1 : 6;
          finalSections.splice(insertIdx, 0, {
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
        }

        // Ensure home-technology-ecosystem is present
        const hasTechEco = finalSections.some(s => s.id === 'home-technology-ecosystem');
        if (!hasTechEco && finalSections.length > 0) {
          const ourWorkIdx = finalSections.findIndex(s => s.id === 'home-our-current-work');
          const insertIdx = ourWorkIdx !== -1 ? ourWorkIdx + 1 : 7;
          finalSections.splice(insertIdx, 0, {
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
        }

        // Ensure home-clients-trust-us is present
        const hasClientsTrustUs = finalSections.some(s => s.id === 'home-clients-trust-us');
        if (!hasClientsTrustUs && finalSections.length > 0) {
          const techEcoIdx = finalSections.findIndex(s => s.id === 'home-technology-ecosystem');
          const insertIdx = techEcoIdx !== -1 ? techEcoIdx + 1 : 8;
          finalSections.splice(insertIdx, 0, {
            id: 'home-clients-trust-us',
            name: 'Clients Trust Us',
            type: 'ClientsTrustUs',
            visible: true,
            content: {
              sectionHeader: {
                badgeNumber: "09",
                badgeText: "CLIENTS TRUST US",
                badgeColor: "#16A34A",
                headingColor: "#1e293b"
              },
              selectedTestimonials: [
                { testimonialId: "testi-1", order: 1, featured: true, enabled: true },
                { testimonialId: "testi-2", order: 2, featured: true, enabled: true },
                { testimonialId: "testi-3", order: 3, featured: true, enabled: true },
                { testimonialId: "testi-4", order: 4, featured: true, enabled: true }
              ],
              carouselSettings: {
                autoPlay: true,
                speedMs: 5000,
                showDots: true,
                showArrows: true,
                loop: true
              },
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
        }

        setSections(finalSections);

        const solutionProcessSec = finalSections.find(s => s.id === 'home-solution-process');
        if (solutionProcessSec) {
          setSolutionProcessHistory([
            {
              timestamp: new Date().toLocaleTimeString() + ' (Initial Load)',
              content: JSON.parse(JSON.stringify(solutionProcessSec.content || {})),
              styles: JSON.parse(JSON.stringify(solutionProcessSec.styles || {}))
            }
          ]);
        }

        const ourSolutionsSec = finalSections.find(s => s.id === 'home-our-solutions');
        if (ourSolutionsSec) {
          setOurSolutionsHistory([
            {
              timestamp: new Date().toLocaleTimeString() + ' (Initial Load)',
              content: JSON.parse(JSON.stringify(ourSolutionsSec.content || {})),
              styles: JSON.parse(JSON.stringify(ourSolutionsSec.styles || {}))
            }
          ]);
        }

        const aboutSec = finalSections.find(s => s.id === 'home-about-nx');
        if (aboutSec) {
          setAboutHistory([
            {
              timestamp: new Date().toLocaleTimeString() + ' (Initial Load)',
              content: JSON.parse(JSON.stringify(aboutSec.content || {})),
              styles: JSON.parse(JSON.stringify(aboutSec.styles || {}))
            }
          ]);
        }

        const challengesSec = finalSections.find(s => s.id === 'home-challenges-to-solutions');
        if (challengesSec) {
          setChallengesHistory([
            {
              timestamp: new Date().toLocaleTimeString() + ' (Initial Load)',
              content: JSON.parse(JSON.stringify(challengesSec.content || {})),
              styles: JSON.parse(JSON.stringify(challengesSec.styles || {}))
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to load home page admin structure:', err);
      showMsg('Failed to sync page data. Please check MongoDB connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomePage();
  }, []);

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Section Content Mutators
  const updateHeroContent = (fields: any) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === 'home-hero') {
        return {
          ...sec,
          content: { ...sec.content, ...fields }
        };
      }
      return sec;
    }));
  };

  const updateFeaturesContent = (fields: any) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === 'home-features') {
        return {
          ...sec,
          content: { ...sec.content, ...fields }
        };
      }
      return sec;
    }));
  };

  const updateCtaContent = (fields: any) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === 'home-cta') {
        return {
          ...sec,
          content: { ...sec.content, ...fields }
        };
      }
      return sec;
    }));
  };

  const updateAboutNXContent = (fields: any) => {
    setSections(prev => {
      const updated = prev.map(sec => {
        if (sec.id === 'home-about-nx') {
          return {
            ...sec,
            content: { ...sec.content, ...fields }
          };
        }
        return sec;
      });
      return updated;
    });
  };

  const updateAboutNXStyles = (fields: any) => {
    setSections(prev => {
      const updated = prev.map(sec => {
        if (sec.id === 'home-about-nx') {
          return {
            ...sec,
            styles: { ...sec.styles, ...fields }
          };
        }
        return sec;
      });
      return updated;
    });
  };

  const updateIndustriesServeContent = (fields: any) => {
    setSections(prev => {
      const updated = prev.map(sec => {
        if (sec.id === 'home-industries-serve') {
          return {
            ...sec,
            content: { ...sec.content, ...fields }
          };
        }
        return sec;
      });
      return updated;
    });
  };

  const updateIndustriesServeStyles = (fields: any) => {
    setSections(prev => {
      const updated = prev.map(sec => {
        if (sec.id === 'home-industries-serve') {
          return {
            ...sec,
            styles: { ...sec.styles, ...fields }
          };
        }
        return sec;
      });
      return updated;
    });
  };

  const updateSolutionProcessContent = (fields: any) => {
    setSections(prev => {
      const updated = prev.map(sec => {
        if (sec.id === 'home-solution-process') {
          return {
            ...sec,
            content: { ...sec.content, ...fields }
          };
        }
        return sec;
      });
      return updated;
    });
  };

  const updateSolutionProcessStyles = (fields: any) => {
    setSections(prev => {
      const updated = prev.map(sec => {
        if (sec.id === 'home-solution-process') {
          return {
            ...sec,
            styles: { ...sec.styles, ...fields }
          };
        }
        return sec;
      });
      return updated;
    });
  };

  // Solution Process steps management helpers
  const handleSolutionProcessAddItem = () => {
    const solSec = sections.find(s => s.id === 'home-solution-process');
    if (!solSec) return;
    recordSolutionProcessHistory('Add Step');
    const stepsList = [...(solSec.content.processSteps || [])];
    stepsList.push({
      id: 'step-' + Date.now(),
      icon: 'Sparkles',
      title: 'New Process Step',
      subtitle: 'Optional Subtitle',
      description: 'Short description for this step',
      order: stepsList.length + 1,
      status: true,
      iconColor: '#059669',
      iconBgColor: '#ffffff',
      circleBorderColor: '#e2e8f0',
      circleSize: '90',
      iconSize: '36',
      titleColor: '#1e293b',
      subtitleColor: '#64748b'
    });
    updateSolutionProcessContent({ processSteps: stepsList });
  };

  const handleSolutionProcessDuplicateItem = (step: any) => {
    const solSec = sections.find(s => s.id === 'home-solution-process');
    if (!solSec) return;
    recordSolutionProcessHistory('Duplicate Step');
    const stepsList = [...(solSec.content.processSteps || [])];
    stepsList.push({
      ...JSON.parse(JSON.stringify(step)),
      id: 'step-' + Date.now(),
      title: step.title + ' (Copy)',
      order: stepsList.length + 1
    });
    updateSolutionProcessContent({ processSteps: stepsList });
  };

  const handleSolutionProcessDeleteItem = (id: string) => {
    const solSec = sections.find(s => s.id === 'home-solution-process');
    if (!solSec) return;
    recordSolutionProcessHistory('Delete Step');
    const stepsList = (solSec.content.processSteps || [])
      .filter((s: any) => s.id !== id)
      .map((s: any, idx: number) => ({ ...s, order: idx + 1 }));
    updateSolutionProcessContent({ processSteps: stepsList });
    if (editingStepId === id) {
      setEditingStepId(null);
    }
  };

  const handleSolutionProcessMoveItem = (idx: number, direction: 'up' | 'down') => {
    const solSec = sections.find(s => s.id === 'home-solution-process');
    if (!solSec) return;
    const stepsList = [...(solSec.content.processSteps || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === stepsList.length - 1) return;
    recordSolutionProcessHistory('Move Step Order');

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = stepsList[idx];
    stepsList[idx] = stepsList[targetIdx];
    stepsList[targetIdx] = temp;

    // Re-assign exact sequential order fields
    const reordered = stepsList.map((s, i) => ({ ...s, order: i + 1 }));
    updateSolutionProcessContent({ processSteps: reordered });
  };

  const handleSolutionProcessFileUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      recordSolutionProcessHistory('Upload Custom Icon Image');
      updateSolutionProcessStepField(id, { icon: base64 });
    };
    reader.readAsDataURL(file);
  };

  const updateSolutionProcessStepField = (id: string, fields: any) => {
    const solSec = sections.find(s => s.id === 'home-solution-process');
    if (!solSec) return;
    const stepsList = (solSec.content.processSteps || []).map((s: any) => {
      if (s.id === id) {
        return { ...s, ...fields };
      }
      return s;
    });
    updateSolutionProcessContent({ processSteps: stepsList });
  };

  const recordSolutionProcessHistory = (description: string) => {
    const sec = sections.find(s => s.id === 'home-solution-process');
    if (!sec) return;
    setSolutionProcessHistory(prev => [
      {
        timestamp: new Date().toLocaleTimeString() + ' - ' + description,
        content: JSON.parse(JSON.stringify(sec.content || {})),
        styles: JSON.parse(JSON.stringify(sec.styles || {}))
      },
      ...prev
    ]);
  };

  const handleSolutionProcessRestoreVersion = (ver: any) => {
    recordSolutionProcessHistory('Pre-Restore Backup');
    setSections(prev => prev.map(sec => {
      if (sec.id === 'home-solution-process') {
        return {
          ...sec,
          content: JSON.parse(JSON.stringify(ver.content || {})),
          styles: JSON.parse(JSON.stringify(ver.styles || {}))
        };
      }
      return sec;
    }));
    showMsg('Restored historical version successfully.', 'success');
  };

  // Our Solutions Custom Helpers
  const updateOurSolutionsContent = (fields: any) => {
    setSections(prev => {
      const updated = prev.map(sec => {
        if (sec.id === 'home-our-solutions') {
          return {
            ...sec,
            content: { ...sec.content, ...fields }
          };
        }
        return sec;
      });
      return updated;
    });
  };

  const updateOurSolutionsStyles = (fields: any) => {
    setSections(prev => {
      const updated = prev.map(sec => {
        if (sec.id === 'home-our-solutions') {
          return {
            ...sec,
            styles: { ...sec.styles, ...fields }
          };
        }
        return sec;
      });
      return updated;
    });
  };

  const recordOurSolutionsHistory = (description: string) => {
    const sec = sections.find(s => s.id === 'home-our-solutions');
    if (!sec) return;
    setOurSolutionsHistory(prev => [
      {
        timestamp: new Date().toLocaleTimeString() + ' - ' + description,
        content: JSON.parse(JSON.stringify(sec.content || {})),
        styles: JSON.parse(JSON.stringify(sec.styles || {}))
      },
      ...prev
    ]);
  };

  const handleOurSolutionsRestoreVersion = (ver: any) => {
    recordOurSolutionsHistory('Pre-Restore Backup');
    setSections(prev => prev.map(sec => {
      if (sec.id === 'home-our-solutions') {
        return {
          ...sec,
          content: JSON.parse(JSON.stringify(ver.content || {})),
          styles: JSON.parse(JSON.stringify(ver.styles || {}))
        };
      }
      return sec;
    }));
    showMsg('Restored historical version successfully.', 'success');
  };

  const updateOurSolutionsCardField = (id: string, fields: any) => {
    const solSec = sections.find(s => s.id === 'home-our-solutions');
    if (!solSec) return;
    const cardsList = (solSec.content.cards || []).map((c: any) => {
      if (c.id === id) {
        return { ...c, ...fields };
      }
      return c;
    });
    updateOurSolutionsContent({ cards: cardsList });
  };

  // Our Current Work Custom Helpers
  const updateOurCurrentWorkContent = (fields: any) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === 'home-our-current-work') {
        return {
          ...sec,
          content: { ...sec.content, ...fields }
        };
      }
      return sec;
    }));
  };

  const updateOurCurrentWorkStyles = (fields: any) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === 'home-our-current-work') {
        return {
          ...sec,
          styles: { ...sec.styles, ...fields }
        };
      }
      return sec;
    }));
  };

  const updateOurCurrentWorkCardField = (id: string, fields: any) => {
    const workSec = sections.find(s => s.id === 'home-our-current-work');
    if (!workSec) return;
    const cardsList = (workSec.content.cards || []).map((c: any) => {
      if (c.id === id) {
        return { ...c, ...fields };
      }
      return c;
    });
    updateOurCurrentWorkContent({ cards: cardsList });
  };

  const updateOurCurrentWorkSelectedProject = (projectId: string, fields: any) => {
    const workSec = sections.find(s => s.id === 'home-our-current-work');
    if (!workSec) return;
    const list = (workSec.content.selectedProjects || []).map((sp: any) => {
      if (sp.projectId === projectId) {
        return { ...sp, ...fields };
      }
      return sp;
    });
    updateOurCurrentWorkContent({ selectedProjects: list });
  };

  const toggleOurCurrentWorkProjectSelection = (cs: CaseStudy) => {
    const workSec = sections.find(s => s.id === 'home-our-current-work');
    if (!workSec) return;
    const currentList = workSec.content.selectedProjects || [];
    const exists = currentList.some((sp: any) => sp.projectId === cs.id);
    if (exists) {
      updateOurCurrentWorkContent({
        selectedProjects: currentList.filter((sp: any) => sp.projectId !== cs.id)
      });
    } else {
      const newItem = {
        projectId: cs.id,
        homeImage: cs.image || '',
        customTitle: '',
        subtitle: cs.clientName || cs.industry || '',
        statusText: 'Active Project',
        statusColor: '#16A34A',
        featured: true,
        enabled: true,
        order: currentList.length + 1
      };
      updateOurCurrentWorkContent({
        selectedProjects: [...currentList, newItem]
      });
    }
  };

  const moveOurCurrentWorkProjectOrder = (index: number, direction: 'up' | 'down') => {
    const workSec = sections.find(s => s.id === 'home-our-current-work');
    if (!workSec) return;
    const currentList = [...(workSec.content.selectedProjects || [])];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentList.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = currentList[index];
    currentList[index] = currentList[targetIdx];
    currentList[targetIdx] = temp;
    const reordered = currentList.map((item: any, idx: number) => ({ ...item, order: idx + 1 }));
    updateOurCurrentWorkContent({ selectedProjects: reordered });
  };

  // Industries Serve Custom Helpers
  const addIndustryToSection = (industryId: string) => {
    const indSec = sections.find(s => s.id === 'home-industries-serve');
    if (!indSec) return;
    const currentItems = indSec.content.items || [];
    if (currentItems.some((item: any) => item.id === industryId)) return;
    const newItem = { id: industryId, featured: false, visible: true };
    updateIndustriesServeContent({ items: [...currentItems, newItem] });
  };

  const removeIndustryFromSection = (industryId: string) => {
    const indSec = sections.find(s => s.id === 'home-industries-serve');
    if (!indSec) return;
    const currentItems = indSec.content.items || [];
    updateIndustriesServeContent({ items: currentItems.filter((item: any) => item.id !== industryId) });
  };

  const toggleIndustryFeatured = (industryId: string) => {
    const indSec = sections.find(s => s.id === 'home-industries-serve');
    if (!indSec) return;
    const currentItems = indSec.content.items || [];
    const updated = currentItems.map((item: any) => {
      if (item.id === industryId) {
        return { ...item, featured: !item.featured };
      }
      return item;
    });
    updateIndustriesServeContent({ items: updated });
  };

  const toggleIndustryVisible = (industryId: string) => {
    const indSec = sections.find(s => s.id === 'home-industries-serve');
    if (!indSec) return;
    const currentItems = indSec.content.items || [];
    const updated = currentItems.map((item: any) => {
      if (item.id === industryId) {
        return { ...item, visible: item.visible !== false ? false : true };
      }
      return item;
    });
    updateIndustriesServeContent({ items: updated });
  };

  const moveIndustryOrder = (index: number, direction: 'up' | 'down') => {
    const indSec = sections.find(s => s.id === 'home-industries-serve');
    if (!indSec) return;
    const currentItems = [...(indSec.content.items || [])];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentItems.length - 1) return;
    
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = currentItems[index];
    currentItems[index] = currentItems[targetIdx];
    currentItems[targetIdx] = temp;
    updateIndustriesServeContent({ items: currentItems });
  };

  const updateChallengesToSolutionsContent = (fields: any) => {
    setSections(prev => {
      const updated = prev.map(sec => {
        if (sec.id === 'home-challenges-to-solutions') {
          return {
            ...sec,
            content: { ...sec.content, ...fields }
          };
        }
        return sec;
      });
      return updated;
    });
  };

  const updateChallengesToSolutionsStyles = (fields: any) => {
    setSections(prev => {
      const updated = prev.map(sec => {
        if (sec.id === 'home-challenges-to-solutions') {
          return {
            ...sec,
            styles: { ...sec.styles, ...fields }
          };
        }
        return sec;
      });
      return updated;
    });
  };

  const recordAboutHistory = (label: string, customSec?: any) => {
    setSections(prev => {
      const target = customSec || prev.find(s => s.id === 'home-about-nx');
      if (target) {
        setAboutHistory(h => {
          // Prevent infinite loops or redundant identical logs
          const lastEntry = h[0];
          const newContentStr = JSON.stringify(target.content || {});
          const newStylesStr = JSON.stringify(target.styles || {});
          if (lastEntry && JSON.stringify(lastEntry.content) === newContentStr && JSON.stringify(lastEntry.styles) === newStylesStr) {
            return h;
          }
          return [
            {
              timestamp: `${new Date().toLocaleTimeString()} - ${label}`,
              content: JSON.parse(newContentStr),
              styles: JSON.parse(newStylesStr)
            },
            ...h.slice(0, 19) // Limit to 20 historical entries
          ];
        });
      }
      return prev;
    });
  };

  const recordChallengesHistory = (label: string, customSec?: any) => {
    setSections(prev => {
      const target = customSec || prev.find(s => s.id === 'home-challenges-to-solutions');
      if (target) {
        setChallengesHistory(h => {
          const lastEntry = h[0];
          const newContentStr = JSON.stringify(target.content || {});
          const newStylesStr = JSON.stringify(target.styles || {});
          if (lastEntry && JSON.stringify(lastEntry.content) === newContentStr && JSON.stringify(lastEntry.styles) === newStylesStr) {
            return h;
          }
          return [
            {
              timestamp: `${new Date().toLocaleTimeString()} - ${label}`,
              content: JSON.parse(newContentStr),
              styles: JSON.parse(newStylesStr)
            },
            ...h.slice(0, 19)
          ];
        });
      }
      return prev;
    });
  };

  // Helper functions for Clients Trust Us section
  const updateClientsTrustUsContent = (newContent: any) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === 'home-clients-trust-us') {
        return {
          ...sec,
          content: {
            ...sec.content,
            ...newContent
          }
        };
      }
      return sec;
    }));
  };

  const updateClientsTrustUsStyles = (newStyles: any) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === 'home-clients-trust-us') {
        return {
          ...sec,
          styles: {
            ...sec.styles,
            ...newStyles
          }
        };
      }
      return sec;
    }));
  };

  const toggleClientsTrustUsTestimonialSelection = (testimonialId: string) => {
    const section = sections.find(s => s.id === 'home-clients-trust-us');
    if (!section) return;
    const selected: HomeTestimonialSelectedRef[] = section.content.selectedTestimonials || [];
    const exists = selected.some(item => item.testimonialId === testimonialId);

    let updated: HomeTestimonialSelectedRef[];
    if (exists) {
      updated = selected.filter(item => item.testimonialId !== testimonialId);
    } else {
      updated = [
        ...selected,
        {
          testimonialId,
          order: selected.length + 1,
          featured: false,
          enabled: true
        }
      ];
    }
    updateClientsTrustUsContent({ selectedTestimonials: updated });
  };

  const updateClientsTrustUsSelectedTestimonial = (testimonialId: string, updates: Partial<HomeTestimonialSelectedRef>) => {
    const section = sections.find(s => s.id === 'home-clients-trust-us');
    if (!section) return;
    const selected: HomeTestimonialSelectedRef[] = section.content.selectedTestimonials || [];
    const updated = selected.map(item => {
      if (item.testimonialId === testimonialId) {
        return { ...item, ...updates };
      }
      return item;
    });
    updateClientsTrustUsContent({ selectedTestimonials: updated });
  };

  const moveClientsTrustUsTestimonialOrder = (index: number, direction: 'up' | 'down') => {
    const section = sections.find(s => s.id === 'home-clients-trust-us');
    if (!section) return;
    const selected: HomeTestimonialSelectedRef[] = [...(section.content.selectedTestimonials || [])];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selected.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = selected[index];
    selected[index] = selected[targetIdx];
    selected[targetIdx] = temp;

    const reordered = selected.map((item, idx) => ({ ...item, order: idx + 1 }));
    updateClientsTrustUsContent({ selectedTestimonials: reordered });
  };

  // Section Visibility Toggle
  const toggleSectionVisibility = (id: string) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === id) {
        return { ...sec, visible: !sec.visible };
      }
      return sec;
    }));
  };

  // Section Sorting Order
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...sections];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setSections(reordered);
  };

  // Logo Array Helpers
  const addLogo = (logoText: string) => {
    const hero = sections.find(s => s.id === 'home-hero');
    if (!hero) return;
    const currentLogos = hero.content.logos || [];
    if (!logoText.trim()) return;
    updateHeroContent({ logos: [...currentLogos, logoText.trim()] });
  };

  const removeLogo = (idx: number) => {
    const hero = sections.find(s => s.id === 'home-hero');
    if (!hero) return;
    const currentLogos = hero.content.logos || [];
    updateHeroContent({ logos: currentLogos.filter((_: any, i: number) => i !== idx) });
  };

  // Bottom Bento Badge Helpers
  const addBadge = (badgeText: string) => {
    const hero = sections.find(s => s.id === 'home-hero');
    if (!hero) return;
    const currentBadges = hero.content.badges || [];
    if (!badgeText.trim()) return;
    updateHeroContent({ badges: [...currentBadges, { text: badgeText.trim() }] });
  };

  const removeBadge = (idx: number) => {
    const hero = sections.find(s => s.id === 'home-hero');
    if (!hero) return;
    const currentBadges = hero.content.badges || [];
    updateHeroContent({ badges: currentBadges.filter((_: any, i: number) => i !== idx) });
  };

  // Feature Card helpers (CRUD)
  const addFeatureCard = () => {
    const featSection = sections.find(s => s.id === 'home-features');
    if (!featSection) return;
    const currentItems = featSection.content.items || [];
    const newItem = {
      id: `feat-${Date.now()}`,
      title: 'New Dynamic Advantage',
      desc: 'Advantage card description edit me from the admin portal.',
      icon: 'Sparkles',
      link: '/industries'
    };
    updateFeaturesContent({ items: [...currentItems, newItem] });
  };

  const updateFeatureCard = (cardId: string, fields: any) => {
    const featSection = sections.find(s => s.id === 'home-features');
    if (!featSection) return;
    const currentItems = featSection.content.items || [];
    const updatedItems = currentItems.map((item: any) => {
      if (item.id === cardId) {
        return { ...item, ...fields };
      }
      return item;
    });
    updateFeaturesContent({ items: updatedItems });
  };

  const removeFeatureCard = (cardId: string) => {
    const featSection = sections.find(s => s.id === 'home-features');
    if (!featSection) return;
    const currentItems = featSection.content.items || [];
    updateFeaturesContent({ items: currentItems.filter((item: any) => item.id !== cardId) });
  };

  const moveFeatureCard = (index: number, direction: 'up' | 'down') => {
    const featSection = sections.find(s => s.id === 'home-features');
    if (!featSection) return;
    const currentItems = [...(featSection.content.items || [])];
    
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentItems.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = currentItems[index];
    currentItems[index] = currentItems[targetIdx];
    currentItems[targetIdx] = temp;
    updateFeaturesContent({ items: currentItems });
  };

  const validateSolutionProcess = (): boolean => {
    const solSec = sections.find(s => s.id === 'home-solution-process');
    if (solSec) {
      const header = solSec.content.sectionHeader || {};
      if (!header.badgeText?.trim()) {
        showMsg('Validation Error: Section Heading (Badge Text) is required for Solution Engineering Process.', 'error');
        return false;
      }
      const steps = solSec.content.processSteps || [];
      if (steps.length === 0) {
        showMsg('Validation Error: At least one step is required in Solution Engineering Process.', 'error');
        return false;
      }
      for (let idx = 0; idx < steps.length; idx++) {
        const step = steps[idx];
        if (!step.title?.trim()) {
          showMsg(`Validation Error: Step ${idx + 1} must have a Title.`, 'error');
          return false;
        }
        if (!step.icon?.trim()) {
          showMsg(`Validation Error: Step "${step.title}" must have an Icon chosen or uploaded.`, 'error');
          return false;
        }
      }
    }
    return true;
  };

  const validateChallengesToSolutions = (): boolean => {
    const chalSec = sections.find(s => s.id === 'home-challenges-to-solutions');
    if (chalSec) {
      const content = chalSec.content || {};
      const badgeText = content.badgeText || 'FROM CHALLENGES TO SOLUTIONS';
      if (!badgeText.trim()) {
        showMsg('Validation Error: Section Heading (Badge Text) is required for "From Challenges to Solutions".', 'error');
        return false;
      }
      const challenges = content.challenges || [];
      if (challenges.length === 0) {
        showMsg('Validation Error: Column 1 requires at least one Operational Challenge item.', 'error');
        return false;
      }
      const steps = content.engineeringSteps || [];
      if (steps.length === 0) {
        showMsg('Validation Error: Column 2 requires at least one Engineering Approach step.', 'error');
        return false;
      }
      const outcomes = content.outcomes || [];
      if (outcomes.length === 0) {
        showMsg('Validation Error: Column 3 requires at least one Intelligent Outcome item.', 'error');
        return false;
      }
    }
    return true;
  };

  // API Operation: Save Draft
  const handleSaveDraft = async () => {
    if (!pageData) return;
    if (!validateSolutionProcess() || !validateChallengesToSolutions()) return;
    setSavingDraft(true);
    try {
      const draftSeo = { title: seoTitle, description: seoDescription, keywords: seoKeywords };
      
      // We store draft versions by calling our extended /api/pages/:slug/sections route 
      // with sections state kept in draftSections, draftSeo in draftSeo.
      await apiService.savePageSections('root', {
        name: pageData.name,
        visible: isPageVisible,
        sections: pageData.sections, // preserve published intact
        seo: pageData.seo,           // preserve published intact
        draftSections: sections,     // save latest edits as draft
        draftSeo: draftSeo           // save latest SEO as draft
      });

      showMsg('Draft saved successfully! Click "Preview Changes" to test locally.', 'success');
      onRefresh();
    } catch (err) {
      console.error(err);
      showMsg('Failed to save draft content.', 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  // API Operation: Publish
  const handlePublish = async () => {
    if (!pageData) return;
    if (!validateSolutionProcess() || !validateChallengesToSolutions()) return;
    setPublishing(true);
    try {
      const publishedSeo = { title: seoTitle, description: seoDescription, keywords: seoKeywords };
      
      // Copying the current draft sections and draft SEO parameters to published ones
      await apiService.savePageSections('root', {
        name: pageData.name,
        visible: isPageVisible,
        sections: sections,          // Copy draft -> published
        seo: publishedSeo,           // Copy draft -> published
        draftSections: sections,     // Keep in sync
        draftSeo: publishedSeo       // Keep in sync
      });

      showMsg('Home Page published live successfully! All viewers see changes.', 'success');
      onRefresh();
    } catch (err) {
      console.error(err);
      showMsg('Failed to publish home page edits.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  // Open Preview in New Tab
  const handlePreview = () => {
    // Open home page with ?preview=true flag
    window.open('/?preview=true', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading Home Page dynamic fields from MongoDB...</p>
      </div>
    );
  }

  const heroSec = sections.find(s => s.id === 'home-hero');
  const featSec = sections.find(s => s.id === 'home-features');
  const ctaSec = sections.find(s => s.id === 'home-cta');
  const aboutNXSec = sections.find(s => s.id === 'home-about-nx');
  const challengesToSolutionsSec = sections.find(s => s.id === 'home-challenges-to-solutions');
  const industriesServeSec = sections.find(s => s.id === 'home-industries-serve');
  const solutionProcessSec = sections.find(s => s.id === 'home-solution-process');
  const ourSolutionsSec = sections.find(s => s.id === 'home-our-solutions');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Dynamic Alert Banner */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border text-xs font-bold transition-all duration-300 animate-slide-up ${
          message.type === 'success' 
            ? 'bg-emerald-950/95 border-emerald-500/30 text-emerald-400 shadow-emerald-950/20' 
            : 'bg-rose-950/95 border-rose-500/30 text-rose-400 shadow-rose-950/20'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Top action header bar */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-6 py-4 sticky top-0 z-40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/50"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Core Modules
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">Home Page Panel</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-white mt-0.5">
              Landing Page CMS
            </h1>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active status */}
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-400 font-semibold">Status:</span>
            <button
              onClick={() => setIsPageVisible(!isPageVisible)}
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded transition-all ${
                isPageVisible 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-700 text-slate-400 border border-slate-600/40'
              }`}
            >
              {isPageVisible ? 'Active' : 'Offline'}
            </button>
          </div>

          <button
            onClick={handlePreview}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Changes</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-950/50 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingDraft ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-blue-600/15"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{publishing ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Left column: Sections Outline, Sorting, Visibility */}
        <aside className="w-full lg:w-72 bg-slate-900/40 border-r border-slate-900 p-6 space-y-6 flex-shrink-0">
          <div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              Section Structure
            </h3>
            <div className="space-y-2">
              {sections.map((section, idx) => {
                const isSelected = selectedSectionId === section.id;
                return (
                  <div
                    key={section.id}
                    className={`group flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-600/10 border-indigo-500/30 text-white' 
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-900/85 hover:text-slate-200'
                    }`}
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-slate-600">0{idx + 1}</span>
                      <span className="truncate">{section.name}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-65 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      {/* Up Order button */}
                      <button 
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-30"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      {/* Down Order button */}
                      <button 
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === sections.length - 1}
                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-30"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      {/* Toggle status indicator */}
                      <button 
                        onClick={() => toggleSectionVisibility(section.id)}
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                          section.visible 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                        }`}
                        title={section.visible ? 'Visible' : 'Hidden'}
                      >
                        {section.visible ? '✓' : '✗'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              SEO Parameters
            </h3>
            <button
              onClick={() => setSelectedSectionId('seo-settings')}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                selectedSectionId === 'seo-settings'
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-900/85 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Search Engine Details</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900/50 border border-slate-900 rounded-xl p-4 space-y-2.5">
            <div className="flex gap-2 text-slate-400">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                Sections modified here affect only the Landing page. Use <strong>Publish</strong> to copy edits live. Use <strong>Save Draft</strong> for offline storage.
              </p>
            </div>
          </div>
        </aside>

        {/* Right column: Form Editors */}
        <main className="flex-grow p-6 md:p-8 bg-slate-950 max-w-4xl">
          {/* SEO SETTINGS PANEL */}
          {selectedSectionId === 'seo-settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-900 pb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-400" />
                  <span>SEO & Metadata Configuration</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Configure search parameters, bookmarks, and index keywords for the dynamic home page.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Page Browser Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    placeholder="Enter meta title of page"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Meta Description</label>
                  <textarea
                    rows={4}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    placeholder="Provide keywords description for search crawlers..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Search Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    placeholder="e.g. AI, automation, security, b2b"
                  />
                </div>
              </div>
            </div>
          )}

          {/* HOME HERO SECTION EDITOR */}
          {selectedSectionId === 'home-hero' && heroSec && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Dynamic Home Hero Editor</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Refine badges, titles, multi-tag blue highlights, button labels, and organization icons.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                  <span className="text-[10px] font-semibold text-slate-400">Render:</span>
                  <button
                    onClick={() => toggleSectionVisibility('home-hero')}
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      heroSec.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {heroSec.visible ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Badges and titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Hero Background Image URL</span>
                    <span className="text-[10px] font-normal text-emerald-400 font-mono">Unsplash or static image asset link</span>
                  </label>
                  <input
                    type="text"
                    value={heroSec.content.backgroundImage || ''}
                    onChange={(e) => updateHeroContent({ backgroundImage: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Hero Headline Title</span>
                    <span className="text-[10px] font-normal text-emerald-400 font-mono">Supports HTML tags e.g. &lt;br /&gt; or &lt;span class="text-[#5bdf8c]"&gt;green text&lt;/span&gt;</span>
                  </label>
                  <input
                    type="text"
                    value={heroSec.content.title || ''}
                    onChange={(e) => updateHeroContent({ title: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                    placeholder="Engineering <br />Intelligent <span class='text-[#5bdf8c]'>Solutions</span> <br />for Modern Operations"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Hero Subtitle Description</span>
                    <span className="text-[10px] font-normal text-emerald-400 font-mono">Supports HTML tags e.g. &lt;br class="hidden md:block" /&gt;</span>
                  </label>
                  <textarea
                    rows={3}
                    value={heroSec.content.subtitle || ''}
                    onChange={(e) => updateHeroContent({ subtitle: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                    placeholder="AI & IoT powered ecosystems that solve real-world operational challenges..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-900 pt-5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Call to Action Buttons (Up to 2)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary CTA */}
                  <div className="bg-slate-900/35 border border-slate-900 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Button 1 (Primary Blue)</span>
                      <button
                        onClick={() => updateHeroContent({ showCta: heroSec.content.showCta !== false ? false : true })}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          heroSec.content.showCta !== false ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {heroSec.content.showCta !== false ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400">Button Label</label>
                        <input
                          type="text"
                          value={heroSec.content.ctaText || ''}
                          onChange={(e) => updateHeroContent({ ctaText: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          placeholder="Explore Solutions"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400">Button Redirect URL</label>
                        <input
                          type="text"
                          value={heroSec.content.ctaUrl || ''}
                          onChange={(e) => updateHeroContent({ ctaUrl: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          placeholder="/industries"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary CTA */}
                  <div className="bg-slate-900/35 border border-slate-900 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Button 2 (Glass Backdrop)</span>
                      <button
                        onClick={() => updateHeroContent({ showSecondaryCta: heroSec.content.showSecondaryCta !== false ? false : true })}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          heroSec.content.showSecondaryCta !== false ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {heroSec.content.showSecondaryCta !== false ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400">Button Label</label>
                        <input
                          type="text"
                          value={heroSec.content.secondaryCtaText || ''}
                          onChange={(e) => updateHeroContent({ secondaryCtaText: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          placeholder="Book a Demo"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400">Button Redirect URL</label>
                        <input
                          type="text"
                          value={heroSec.content.secondaryCtaUrl || ''}
                          onChange={(e) => updateHeroContent({ secondaryCtaUrl: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          placeholder="/contact"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trusted by Organizations */}
              <div className="border-t border-slate-900 pt-5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Trusted by Organizations
                </h3>
                <div className="space-y-3 bg-slate-900/30 border border-slate-900 p-4 rounded-xl">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Section Title Text</label>
                    <input
                      type="text"
                      value={heroSec.content.trustedText || ''}
                      onChange={(e) => updateHeroContent({ trustedText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      placeholder="Trusted by 500+ Organizations"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-2">Partner Logotypes / Text Labels</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(heroSec.content.logos || []).map((logo: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-300">
                          <span>{logo}</span>
                          <button 
                            onClick={() => removeLogo(idx)}
                            className="text-rose-500 hover:text-rose-400 ml-1 hover:bg-rose-500/10 rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="new-logo-input"
                        placeholder="Add organization name..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.currentTarget as HTMLInputElement).value;
                            if (val) {
                              addLogo(val);
                              (e.currentTarget as HTMLInputElement).value = '';
                            }
                          }
                        }}
                        className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const el = document.getElementById('new-logo-input') as HTMLInputElement;
                          if (el && el.value) {
                            addLogo(el.value);
                            el.value = '';
                          }
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-1.5 rounded-xl border border-slate-700/50 font-bold"
                      >
                        Add Logo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Bento Badges */}
              <div className="border-t border-slate-900 pt-5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Bottom Bento Feature Badges</span>
                  <span className="text-[10px] font-normal text-slate-500 font-mono">Exactly 6 suggested for layout spacing</span>
                </h3>
                <div className="space-y-3 bg-slate-900/30 border border-slate-900 p-4 rounded-xl">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(heroSec.content.badges || []).map((badge: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-300">
                        <span>{badge.text}</span>
                        <button 
                          onClick={() => removeBadge(idx)}
                          className="text-rose-500 hover:text-rose-400 ml-1 hover:bg-rose-500/10 rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="new-badge-input"
                      placeholder="Add custom feature (e.g. AI Powered, Cloud Sync)..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.currentTarget as HTMLInputElement).value;
                          if (val) {
                            addBadge(val);
                            (e.currentTarget as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('new-badge-input') as HTMLInputElement;
                        if (el && el.value) {
                          addBadge(el.value);
                          el.value = '';
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-1.5 rounded-xl border border-slate-700/50 font-bold"
                    >
                      Add Badge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT NX SECTION EDITOR */}
          {selectedSectionId === 'home-about-nx' && aboutNXSec && (() => {
            // Raw arrays mapping with solid fallbacks
            const rawParagraphs = aboutNXSec.content.paragraphs || [
              aboutNXSec.content.paragraph1 || "NX Solution is an AI & IoT Solution Engineering company that designs and deploys intelligent ecosystems to solve complex operational challenges across industries.",
              aboutNXSec.content.paragraph2 || "We don't sell products. We engineer complete solutions around real operational challenges.",
              aboutNXSec.content.paragraph3 || "Every organization is unique. Every challenge is different. That's why every solution we build is designed specifically for your operational environment."
            ].filter(Boolean);

            const rawCards = aboutNXSec.content.featureCards || [
              {
                id: 'card-mission',
                title: aboutNXSec.content.missionTitle || 'MISSION',
                description: aboutNXSec.content.missionDesc || 'Simplifying complex operations through intelligent technology ecosystems.',
                icon: aboutNXSec.content.missionIcon || 'Target',
                status: true,
                order: 1,
                styles: {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  iconColor: '#16A34A',
                  hoverEffect: true,
                  shadow: true,
                  borderRadius: '1rem'
                }
              },
              {
                id: 'card-vision',
                title: aboutNXSec.content.visionTitle || 'VISION',
                description: aboutNXSec.content.visionDesc || 'Building smarter, safer and future-ready organizations.',
                icon: aboutNXSec.content.visionIcon || 'Eye',
                status: true,
                order: 2,
                styles: {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  iconColor: '#16A34A',
                  hoverEffect: true,
                  shadow: true,
                  borderRadius: '1rem'
                }
              },
              {
                id: 'card-philosophy',
                title: aboutNXSec.content.philosophyTitle || 'CORE PHILOSOPHY',
                description: aboutNXSec.content.philosophyDesc || "We don't sell products. We engineer complete solutions around real operational challenges.",
                icon: aboutNXSec.content.philosophyIcon || 'Lightbulb',
                status: true,
                order: 3,
                styles: {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  iconColor: '#16A34A',
                  hoverEffect: true,
                  shadow: true,
                  borderRadius: '1rem'
                }
              }
            ];

            // Validation Checks
            const errors = [];
            const badgeTxt = aboutNXSec.content.badgeText || 'ABOUT NX SOLUTION';
            const mainTitle = aboutNXSec.content.title || 'ABOUT NX SOLUTION';
            if (!badgeTxt.trim()) errors.push("Badge text is required.");
            if (!mainTitle.trim()) errors.push("Main title is required.");
            if (rawParagraphs.length === 0) errors.push("At least one Paragraph is required.");
            if (!aboutNXSec.content.image) errors.push("Section Image is required.");
            if (rawCards.length === 0) errors.push("At least one Feature Card is required.");

            // Card Operations
            const addCard = () => {
              const newCard = {
                id: `card-${Date.now()}`,
                title: 'NEW COMPONENT',
                description: 'Briefly summarize the feature or competency of your operations team.',
                icon: 'Cpu',
                status: true,
                order: rawCards.length + 1,
                styles: {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  iconColor: '#16A34A',
                  hoverEffect: true,
                  shadow: true,
                  borderRadius: '1rem'
                }
              };
              updateAboutNXContent({ featureCards: [...rawCards, newCard] });
              setEditingCardId(newCard.id);
              recordAboutHistory('Added Advantage Card');
            };

            const duplicateCard = (card: any) => {
              const duplicated = JSON.parse(JSON.stringify(card));
              duplicated.id = `card-${Date.now()}`;
              duplicated.title = `${card.title} (Copy)`;
              duplicated.order = rawCards.length + 1;
              updateAboutNXContent({ featureCards: [...rawCards, duplicated] });
              recordAboutHistory(`Duplicated Card: ${card.title}`);
            };

            const deleteCard = (id: string) => {
              const filtered = rawCards.filter((c: any) => c.id !== id);
              updateAboutNXContent({ featureCards: filtered });
              if (editingCardId === id) setEditingCardId(null);
              recordAboutHistory('Deleted Advantage Card');
            };

            const toggleCardStatus = (id: string) => {
              const updated = rawCards.map((c: any) => {
                if (c.id === id) return { ...c, status: !c.status };
                return c;
              });
              updateAboutNXContent({ featureCards: updated });
              recordAboutHistory('Toggled Advantage Card Visibility');
            };

            const moveCard = (idx: number, direction: 'up' | 'down') => {
              if (direction === 'up' && idx === 0) return;
              if (direction === 'down' && idx === rawCards.length - 1) return;
              const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
              const copy = [...rawCards];
              const temp = copy[idx];
              copy[idx] = copy[targetIdx];
              copy[targetIdx] = temp;
              // Update orders
              const reordered = copy.map((c, i) => ({ ...c, order: i + 1 }));
              updateAboutNXContent({ featureCards: reordered });
              recordAboutHistory('Reordered Advantage Cards');
            };

            const updateCardFields = (id: string, fields: any) => {
              const updated = rawCards.map((c: any) => {
                if (c.id === id) {
                  const cardStyles = c.styles || {};
                  return {
                    ...c,
                    ...fields,
                    styles: fields.styles ? { ...cardStyles, ...fields.styles } : cardStyles
                  };
                }
                return c;
              });
              updateAboutNXContent({ featureCards: updated });
            };

            // Paragraph operations
            const updateParagraphAt = (idx: number, text: string) => {
              const copy = [...rawParagraphs];
              copy[idx] = text;
              updateAboutNXContent({ paragraphs: copy });
            };

            const addParagraph = () => {
              updateAboutNXContent({ paragraphs: [...rawParagraphs, 'New paragraphs element loaded and editable. Write your company overview here.'] });
              recordAboutHistory('Added Paragraph');
            };

            const removeParagraph = (idx: number) => {
              const copy = rawParagraphs.filter((_: any, i: number) => i !== idx);
              updateAboutNXContent({ paragraphs: copy });
              recordAboutHistory('Removed Paragraph');
            };

            const moveParagraph = (idx: number, direction: 'up' | 'down') => {
              if (direction === 'up' && idx === 0) return;
              if (direction === 'down' && idx === rawParagraphs.length - 1) return;
              const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
              const copy = [...rawParagraphs];
              const temp = copy[idx];
              copy[idx] = copy[targetIdx];
              copy[targetIdx] = temp;
              updateAboutNXContent({ paragraphs: copy });
              recordAboutHistory('Reordered Paragraphs');
            };

            // Preset images
            const imagePresets = [
              { name: "Collaboration", url: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=800&auto=format&fit=crop" },
              { name: "Smart Office", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop" },
              { name: "Technology Lab", url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop" },
              { name: "Server Network", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop" },
            ];

            const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 10 * 1024 * 1024) {
                  showMsg("Maximum file size is 10 MB.", "error");
                  return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    updateAboutNXContent({ image: event.target.result as string });
                    recordAboutHistory('Uploaded Custom Image');
                    showMsg("Image optimized and loaded successfully!", "success");
                  }
                };
                reader.readAsDataURL(file);
              }
            };

            // Standard Lucide Icon set for cards
            const lucideIconPresets = ['Target', 'Eye', 'Lightbulb', 'Cpu', 'ShieldCheck', 'Layers', 'Activity', 'Database', 'Network', 'Cloud', 'Zap', 'TrendingUp', 'Users', 'Award'];

            return (
              <div className="space-y-6 animate-fade-in text-slate-300">
                {/* Header Row */}
                <div className="border-b border-slate-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#16A34A]" />
                      <span>About NX Solution Section CMS Architect</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Configure section headers, multiple body text paragraphs, responsive cards, layout grids and dynamic button targets.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                      <span className="text-[10px] font-semibold text-slate-400">Render:</span>
                      <button
                        onClick={() => toggleSectionVisibility('home-about-nx')}
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          aboutNXSec.visible ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {aboutNXSec.visible ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Diagnostics Warnings if any */}
                {errors.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-400 space-y-1">
                    <p className="font-bold">⚠️ CMS Validation Warnings:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tab Navigation Pill Layout */}
                <div className="flex flex-wrap gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-900 font-sans">
                  {(['content', 'cards', 'layout', 'buttons', 'preview', 'history'] as const).map((tab) => {
                    const isActive = aboutActiveTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setAboutActiveTab(tab)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                          isActive 
                            ? 'bg-indigo-600 text-white shadow' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                      >
                        {tab === 'layout' ? 'Layout & Styles' : tab === 'preview' ? 'Live Preview 👁️' : tab}
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: MAIN CONTENT */}
                {aboutActiveTab === 'content' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Badge Configuration */}
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900/65 pb-2">
                        1. Header Badge
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Badge Number</label>
                          <input
                            type="text"
                            value={aboutNXSec.content.badge || '02'}
                            onChange={(e) => updateAboutNXContent({ badge: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                            placeholder="02"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Badge Text</label>
                          <input
                            type="text"
                            value={aboutNXSec.content.badgeText || ''}
                            onChange={(e) => updateAboutNXContent({ badgeText: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                            placeholder="ABOUT NX SOLUTION"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Badge Background</label>
                          <input
                            type="color"
                            value={aboutNXSec.content.badgeBgColor || '#16A34A'}
                            onChange={(e) => updateAboutNXContent({ badgeBgColor: e.target.value })}
                            className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-1 py-1 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Badge Text Color</label>
                          <input
                            type="color"
                            value={aboutNXSec.content.badgeTextColor || '#FFFFFF'}
                            onChange={(e) => updateAboutNXContent({ badgeTextColor: e.target.value })}
                            className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-1 py-1 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Title Configuration */}
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900/65 pb-2">
                        2. Main Title (Rich Text / HTML Supported)
                      </h3>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Supports tags like &lt;br /&gt;, &lt;span class="text-[#16A34A]"&gt;</label>
                        <textarea
                          rows={2}
                          value={aboutNXSec.content.title || ''}
                          onChange={(e) => updateAboutNXContent({ title: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none leading-relaxed font-mono"
                          placeholder="ABOUT NX SOLUTION"
                        />
                      </div>
                    </div>

                    {/* Paragraphs Configuration */}
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-900/65 pb-2">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          3. Main Description Paragraphs ({rawParagraphs.length})
                        </h3>
                        <button
                          onClick={addParagraph}
                          className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Paragraph</span>
                        </button>
                      </div>

                      {rawParagraphs.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3 text-center">No paragraphs configured. Click Add Paragraph above to enter content.</p>
                      ) : (
                        <div className="space-y-4">
                          {rawParagraphs.map((para, pIdx) => (
                            <div key={pIdx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-indigo-400 font-bold">Paragraph #{pIdx + 1}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => moveParagraph(pIdx, 'up')}
                                    disabled={pIdx === 0}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-30"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => moveParagraph(pIdx, 'down')}
                                    disabled={pIdx === rawParagraphs.length - 1}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-30"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => removeParagraph(pIdx)}
                                    className="p-1 hover:bg-rose-950/40 rounded text-rose-500 hover:text-rose-400 ml-2"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <textarea
                                rows={3}
                                value={para}
                                onChange={(e) => updateParagraphAt(pIdx, e.target.value)}
                                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/45 leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Image Area with Simulator */}
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900/65 pb-2">
                        4. Section Media & Image Upload
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Direct URL Paste and Files */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Direct Image URL</label>
                            <input
                              type="text"
                              value={aboutNXSec.content.image || ''}
                              onChange={(e) => {
                                updateAboutNXContent({ image: e.target.value });
                                recordAboutHistory('Changed Image URL');
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none"
                              placeholder="Direct HTTP link..."
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Alternative Text (SEO Alt)</label>
                            <input
                              type="text"
                              value={aboutNXSec.content.imageAlt || ''}
                              onChange={(e) => updateAboutNXContent({ imageAlt: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                              placeholder="About NX Solution Team Office"
                            />
                          </div>

                          {/* Beautiful Upload Simulator */}
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Custom Image (PNG, JPG, WebP &lt; 10 MB)</label>
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-900/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <span className="text-indigo-400 text-lg mb-1">📁</span>
                                  <p className="text-xs text-slate-300 font-bold">Click to Upload Image</p>
                                  <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, JPEG, WebP (Max 10 MB)</p>
                                </div>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleImageFileChange} 
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Presets and Preview */}
                        <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-xl space-y-4">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Live Media Preview</label>
                          <div className="aspect-[16/10] bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                            {aboutNXSec.content.image ? (
                              <img 
                                src={aboutNXSec.content.image} 
                                alt="Live preview" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-xs text-slate-600">No Image Configured</span>
                            )}
                          </div>

                          {/* Quick Corporate Presets */}
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Studio Corporate Presets</label>
                            <div className="grid grid-cols-2 gap-2">
                              {imagePresets.map((preset) => (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => {
                                    updateAboutNXContent({ image: preset.url });
                                    recordAboutHistory(`Assigned Preset: ${preset.name}`);
                                    showMsg(`Preset Image "${preset.name}" assigned successfully!`, "success");
                                  }}
                                  className="text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 truncate"
                                >
                                  📷 {preset.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: FEATURE CARDS */}
                {aboutActiveTab === 'cards' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Advantage / Feature Cards ({rawCards.length})
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Manage unlimited feature cards, icons, color styles and hover shadows.</p>
                      </div>
                      <button
                        onClick={addCard}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Advantage Card</span>
                      </button>
                    </div>

                    {/* Cards Manager Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Cards List */}
                      <div className="space-y-2.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Configure Card List</label>
                        {rawCards.length === 0 ? (
                          <div className="p-8 text-center bg-slate-900/10 border border-slate-900 rounded-2xl text-xs text-slate-500">
                            No feature cards found. Click Add Advantage Card to start.
                          </div>
                        ) : (
                          rawCards.map((card: any, idx: number) => {
                            const isSelected = editingCardId === card.id;
                            const isCardStatusOn = card.status !== false;
                            return (
                              <div
                                key={card.id || idx}
                                onClick={() => setEditingCardId(card.id)}
                                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-indigo-600/15 border-indigo-500 text-white'
                                    : 'bg-slate-900/35 border-slate-900 text-slate-300 hover:bg-slate-900/50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="text-[10px] font-mono text-slate-600">0{idx + 1}</span>
                                    <div className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono">
                                      {card.icon && card.icon.startsWith('<svg') ? 'S' : card.icon && (card.icon.startsWith('http') || card.icon.startsWith('data:')) ? 'I' : card.icon || '★'}
                                    </div>
                                    <div className="truncate text-xs font-bold">
                                      {card.title || 'Untitled Card'}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    {/* Order moves */}
                                    <button
                                      onClick={() => moveCard(idx, 'up')}
                                      disabled={idx === 0}
                                      className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-30"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => moveCard(idx, 'down')}
                                      disabled={idx === rawCards.length - 1}
                                      className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-30"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                    {/* Duplicate */}
                                    <button
                                      onClick={() => duplicateCard(card)}
                                      className="p-1 hover:bg-indigo-950/40 rounded text-indigo-400 hover:text-indigo-300 ml-1 text-[11px]"
                                      title="Duplicate"
                                    >
                                      ⎘
                                    </button>
                                    {/* Visibility Toggle */}
                                    <button
                                      onClick={() => toggleCardStatus(card.id)}
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold border ${
                                        isCardStatusOn
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                          : 'bg-slate-800 text-slate-500 border-slate-700/50'
                                      }`}
                                      title={isCardStatusOn ? 'Card Enabled' : 'Card Disabled'}
                                    >
                                      {isCardStatusOn ? '✓' : '✗'}
                                    </button>
                                    {/* Delete */}
                                    <button
                                      onClick={() => deleteCard(card.id)}
                                      className="p-1 hover:bg-rose-950/40 rounded text-rose-500 hover:text-rose-400"
                                      title="Delete Card"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Right: Card Detail Subform Editor */}
                      <div>
                        {editingCardId && rawCards.find((c: any) => c.id === editingCardId) ? (() => {
                          const card = rawCards.find((c: any) => c.id === editingCardId);
                          const cardStyle = card.styles || {};
                          return (
                            <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4 animate-fade-in text-xs">
                              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                                <span className="font-extrabold text-indigo-400">Card Overrides Editor</span>
                                <span className="text-[10px] font-mono text-slate-500">ID: {card.id}</span>
                              </div>

                              {/* Title & Desc */}
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Title</label>
                                  <input
                                    type="text"
                                    value={card.title || ''}
                                    onChange={(e) => updateCardFields(card.id, { title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-sans"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Description</label>
                                  <textarea
                                    rows={3}
                                    value={card.description || ''}
                                    onChange={(e) => updateCardFields(card.id, { description: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white leading-relaxed font-sans"
                                  />
                                </div>
                              </div>

                              {/* Icons - 4 Supported Options */}
                              <div className="space-y-2 border-t border-slate-900 pt-3 font-sans">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Icon Selection (4 Formats)</label>
                                
                                <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-900">
                                  {/* Quick lucide icons list */}
                                  <div>
                                    <span className="text-[9px] text-slate-500 font-bold block mb-1">Option 1: Choose from Lucide Presets</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {lucideIconPresets.map((iconName) => (
                                        <button
                                          key={iconName}
                                          type="button"
                                          onClick={() => {
                                            updateCardFields(card.id, { icon: iconName });
                                            recordAboutHistory(`Set Card Icon: ${iconName}`);
                                          }}
                                          className={`px-2 py-1 rounded text-[9px] font-bold transition-all border ${
                                            card.icon === iconName
                                              ? 'bg-indigo-600 border-indigo-500 text-white'
                                              : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
                                          }`}
                                        >
                                          {iconName}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Custom input for SVG / URL */}
                                  <div>
                                    <span className="text-[9px] text-slate-500 font-bold block mb-1">Option 2, 3 & 4: Custom SVG / PNG / WebP url</span>
                                    <textarea
                                      rows={2}
                                      value={card.icon || ''}
                                      onChange={(e) => updateCardFields(card.id, { icon: e.target.value })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                                      placeholder="Paste raw <svg...>...</svg> or http://example.com/image.png"
                                    />
                                    <p className="text-[9px] text-slate-600 mt-1">If input starts with &lt;svg, it renders as raw vector. Otherwise, it loads as standard image tag.</p>
                                  </div>
                                </div>
                              </div>

                              {/* Styling Overrides */}
                              <div className="border-t border-slate-900 pt-3 space-y-3">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Card Styling Overrides</label>
                                
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <span className="text-[9px] text-slate-500 block mb-1">Background</span>
                                    <input
                                      type="color"
                                      value={cardStyle.backgroundColor || '#FFFFFF'}
                                      onChange={(e) => updateCardFields(card.id, { styles: { backgroundColor: e.target.value } })}
                                      className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-500 block mb-1">Border Color</span>
                                    <input
                                      type="color"
                                      value={cardStyle.borderColor || '#E2E8F0'}
                                      onChange={(e) => updateCardFields(card.id, { styles: { borderColor: e.target.value } })}
                                      className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-500 block mb-1">Icon Color</span>
                                    <input
                                      type="color"
                                      value={cardStyle.iconColor || '#16A34A'}
                                      onChange={(e) => updateCardFields(card.id, { styles: { iconColor: e.target.value } })}
                                      className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1.5 font-sans">
                                  <div>
                                    <span className="text-[9px] text-slate-500 block mb-1">Border Radius</span>
                                    <select
                                      value={cardStyle.borderRadius || '1rem'}
                                      onChange={(e) => updateCardFields(card.id, { styles: { borderRadius: e.target.value } })}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-white"
                                    >
                                      <option value="0px">0px (Sharp)</option>
                                      <option value="0.375rem">6px (Small)</option>
                                      <option value="0.5rem">8px (Standard)</option>
                                      <option value="1rem">16px (Comfortable)</option>
                                      <option value="1.5rem">24px (Large)</option>
                                      <option value="9999px">Pill / Circle</option>
                                    </select>
                                  </div>
                                  <div className="flex flex-col justify-end space-y-1">
                                    <label className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                      <input
                                        type="checkbox"
                                        checked={cardStyle.hoverEffect !== false}
                                        onChange={(e) => updateCardFields(card.id, { styles: { hoverEffect: e.target.checked } })}
                                        className="rounded border-slate-800 bg-slate-950 focus:ring-0"
                                      />
                                      <span>Hover Effect</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                      <input
                                        type="checkbox"
                                        checked={cardStyle.shadow !== false}
                                        onChange={(e) => updateCardFields(card.id, { styles: { shadow: e.target.checked } })}
                                        className="rounded border-slate-800 bg-slate-950 focus:ring-0"
                                      />
                                      <span>Card Shadow</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })() : (
                          <div className="p-8 text-center bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl text-xs text-slate-500">
                            Select a card from the left panel list to edit details, custom overrides, and colors.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: LAYOUT & STYLES */}
                {aboutActiveTab === 'layout' && (
                  <div className="space-y-6 animate-fade-in text-slate-300 font-sans">
                    {/* Grid Positioning */}
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900/65 pb-2">
                        1. Media & Text Placement
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Image Position</label>
                          <select
                            value={aboutNXSec.content.imagePosition || 'right'}
                            onChange={(e) => {
                              updateAboutNXContent({ imagePosition: e.target.value });
                              recordAboutHistory('Changed Image Position');
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="right">Right (Default - Clean Layout)</option>
                            <option value="left">Left (Alternative layout)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Content Alignment</label>
                          <select
                            value={aboutNXSec.content.alignment || 'left'}
                            onChange={(e) => {
                              updateAboutNXContent({ alignment: e.target.value });
                              recordAboutHistory('Changed Content Alignment');
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="left">Left Align (Default Swiss Style)</option>
                            <option value="center">Center Align (Editorial style)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Responsive Columns Settings */}
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900/65 pb-2">
                        2. Feature Cards Grid Layout settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Desktop Columns</label>
                          <select
                            value={aboutNXSec.content.cardsLayoutDesktop || '3'}
                            onChange={(e) => {
                              updateAboutNXContent({ cardsLayoutDesktop: e.target.value });
                              recordAboutHistory('Changed Cards Layout (Desktop)');
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="3">3 Columns (Standard Grid)</option>
                            <option value="4">4 Columns (Dense Grid)</option>
                            <option value="2">2 Columns (Spacious layout)</option>
                            <option value="1">1 Column (Vertical Stack)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tablet Columns</label>
                          <select
                            value={aboutNXSec.content.cardsLayoutTablet || '2'}
                            onChange={(e) => {
                              updateAboutNXContent({ cardsLayoutTablet: e.target.value });
                              recordAboutHistory('Changed Cards Layout (Tablet)');
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="2">2 Columns (Standard Tab)</option>
                            <option value="3">3 Columns</option>
                            <option value="1">1 Column (Vertical Stack)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Columns</label>
                          <select
                            value={aboutNXSec.content.cardsLayoutMobile || '1'}
                            onChange={(e) => {
                              updateAboutNXContent({ cardsLayoutMobile: e.target.value });
                              recordAboutHistory('Changed Cards Layout (Mobile)');
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="1">1 Column (Standard Phone)</option>
                            <option value="2">2 Columns (Dense mobile list)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section Sizing & Padding */}
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900/65 pb-2">
                        3. Section Width & Padding Overrides
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Container Width</label>
                          <select
                            value={aboutNXSec.content.containerWidth || 'max-w-7xl'}
                            onChange={(e) => {
                              updateAboutNXContent({ containerWidth: e.target.value });
                              recordAboutHistory('Changed Container Width');
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="max-w-7xl">max-w-7xl (Default Enterprise - 1280px)</option>
                            <option value="max-w-6xl">max-w-6xl (Modern Compact - 1152px)</option>
                            <option value="max-w-5xl">max-w-5xl (Editorial Focused - 1024px)</option>
                            <option value="max-w-full px-6">max-w-full (Full Screen with margins)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Top Padding</label>
                          <input
                            type="text"
                            value={aboutNXSec.styles.paddingTop || '60px'}
                            onChange={(e) => updateAboutNXStyles({ paddingTop: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                            placeholder="e.g. 60px"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bottom Padding</label>
                          <input
                            type="text"
                            value={aboutNXSec.styles.paddingBottom || '60px'}
                            onChange={(e) => updateAboutNXStyles({ paddingBottom: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                            placeholder="e.g. 60px"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section Colors */}
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900/65 pb-2">
                        4. Section Color Palette Overrides
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Background Color</label>
                          <input
                            type="color"
                            value={aboutNXSec.styles.backgroundColor || '#FFFFFF'}
                            onChange={(e) => {
                              updateAboutNXStyles({ backgroundColor: e.target.value });
                              recordAboutHistory('Changed Background Color');
                            }}
                            className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-1 py-1 cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Main Title Color</label>
                          <input
                            type="color"
                            value={aboutNXSec.styles.headingColor || '#0F172A'}
                            onChange={(e) => {
                              updateAboutNXStyles({ headingColor: e.target.value });
                              recordAboutHistory('Changed Heading Color');
                            }}
                            className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-1 py-1 cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description Color</label>
                          <input
                            type="color"
                            value={aboutNXSec.styles.textColor || '#1E293B'}
                            onChange={(e) => {
                              updateAboutNXStyles({ textColor: e.target.value });
                              recordAboutHistory('Changed Text Color');
                            }}
                            className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-1 py-1 cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Accent Theme Color</label>
                          <input
                            type="color"
                            value={aboutNXSec.styles.accentColor || '#16A34A'}
                            onChange={(e) => {
                              updateAboutNXStyles({ accentColor: e.target.value });
                              recordAboutHistory('Changed Accent Color');
                            }}
                            className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-1 py-1 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: BUTTONS (FUTURE READY) */}
                {aboutActiveTab === 'buttons' && (
                  <div className="space-y-6 animate-fade-in text-xs font-sans">
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-900/65 pb-2">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          1. Primary Button Override
                        </h3>
                        <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={aboutNXSec.content.showPrimaryBtn === true}
                            onChange={(e) => {
                              updateAboutNXContent({ showPrimaryBtn: e.target.checked });
                              recordAboutHistory('Toggled Primary Button');
                            }}
                            className="rounded border-slate-800 bg-slate-950 focus:ring-0"
                          />
                          <span>Enable Primary Button</span>
                        </label>
                      </div>

                      {aboutNXSec.content.showPrimaryBtn && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Button Text</label>
                            <input
                              type="text"
                              value={aboutNXSec.content.primaryBtnText || 'Explore Industries'}
                              onChange={(e) => updateAboutNXContent({ primaryBtnText: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Button URL</label>
                            <input
                              type="text"
                              value={aboutNXSec.content.primaryBtnUrl || '/industries'}
                              onChange={(e) => updateAboutNXContent({ primaryBtnUrl: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target</label>
                            <select
                              value={aboutNXSec.content.primaryBtnTarget || '_self'}
                              onChange={(e) => updateAboutNXContent({ primaryBtnTarget: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                            >
                              <option value="_self">Same Window (_self)</option>
                              <option value="_blank">New Tab (_blank)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-900/65 pb-2">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          2. Secondary Button Override
                        </h3>
                        <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={aboutNXSec.content.showSecondaryBtn === true}
                            onChange={(e) => {
                              updateAboutNXContent({ showSecondaryBtn: e.target.checked });
                              recordAboutHistory('Toggled Secondary Button');
                            }}
                            className="rounded border-slate-800 bg-slate-950 focus:ring-0"
                          />
                          <span>Enable Secondary Button</span>
                        </label>
                      </div>

                      {aboutNXSec.content.showSecondaryBtn && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Button Text</label>
                            <input
                              type="text"
                              value={aboutNXSec.content.secondaryBtnText || 'Contact Advisor'}
                              onChange={(e) => updateAboutNXContent({ secondaryBtnText: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Button URL</label>
                            <input
                              type="text"
                              value={aboutNXSec.content.secondaryBtnUrl || '/contact'}
                              onChange={(e) => updateAboutNXContent({ secondaryBtnUrl: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target</label>
                            <select
                              value={aboutNXSec.content.secondaryBtnTarget || '_self'}
                              onChange={(e) => updateAboutNXContent({ secondaryBtnTarget: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                            >
                              <option value="_self">Same Window (_self)</option>
                              <option value="_blank">New Tab (_blank)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: LIVE PREVIEW INSIDE EDITOR */}
                {aboutActiveTab === 'preview' && (
                  <div className="space-y-4 animate-fade-in text-slate-900 font-sans">
                    <div className="flex justify-between items-center bg-indigo-950 border border-indigo-900 rounded-xl p-3 text-xs text-indigo-300">
                      <span>👁️ You are viewing a live local render of the AboutNX section using your draft parameters!</span>
                      <button
                        onClick={() => {
                          setAboutActiveTab('content');
                          showMsg('Returned to Content editor.', 'success');
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2.5 py-1 rounded-lg text-[10px]"
                      >
                        Return to Editor
                      </button>
                    </div>

                    <div 
                      className="border border-slate-200/80 rounded-2xl p-8 overflow-hidden transition-all shadow-sm"
                      style={{ 
                        backgroundColor: aboutNXSec.styles.backgroundColor || '#FFFFFF',
                        paddingTop: aboutNXSec.styles.paddingTop || '60px',
                        paddingBottom: aboutNXSec.styles.paddingBottom || '60px'
                      }}
                    >
                      <div className={`w-full max-w-7xl mx-auto space-y-12 text-left`}>
                        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center`}>
                          <div className={`space-y-6 lg:col-span-7 ${aboutNXSec.content.imagePosition === 'left' ? 'lg:order-last' : ''}`}>
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm flex-shrink-0"
                                style={{ 
                                  backgroundColor: aboutNXSec.content.badgeBgColor || '#16A34A', 
                                  color: aboutNXSec.content.badgeTextColor || '#FFFFFF' 
                                }}
                              >
                                {aboutNXSec.content.badge || '02'}
                              </div>
                              <h2 
                                className="text-xl md:text-2xl font-extrabold tracking-wide uppercase"
                                style={{ color: aboutNXSec.styles.headingColor || '#0F172A' }}
                              >
                                {aboutNXSec.content.badgeText || 'ABOUT NX SOLUTION'}
                              </h2>
                            </div>

                            <div className="space-y-5 text-sm md:text-[15px] leading-relaxed font-normal" style={{ color: aboutNXSec.styles.textColor || '#475569' }}>
                              {rawParagraphs.map((para: string, pIdx: number) => (
                                <p key={pIdx} className="leading-relaxed font-normal" dangerouslySetInnerHTML={{ __html: para }} />
                              ))}
                            </div>
                          </div>

                          <div className="lg:col-span-5">
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 shadow-md bg-slate-100">
                              {aboutNXSec.content.image ? (
                                <img
                                  src={aboutNXSec.content.image}
                                  alt={aboutNXSec.content.imageAlt || "Preview image"}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">No Image Configured</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {rawCards.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                            {rawCards.filter((c: any) => c.status !== false).map((card: any, index: number) => (
                              <div
                                key={card.id || index}
                                className="p-6 border border-slate-200 bg-white rounded-2xl shadow-sm min-h-[140px] flex flex-col justify-between"
                                style={{
                                  backgroundColor: card.styles?.backgroundColor || '#FFFFFF',
                                  borderColor: card.styles?.borderColor || '#E2E8F0',
                                  borderRadius: card.styles?.borderRadius || '1rem'
                                }}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                      style={{ 
                                        backgroundColor: `${card.styles?.iconColor || '#16A34A'}15`,
                                        color: card.styles?.iconColor || '#16A34A'
                                      }}
                                    >
                                      ★
                                    </div>
                                    <h3 
                                      className="font-extrabold text-slate-950 text-xs md:text-sm uppercase"
                                      style={{ color: aboutNXSec.styles.headingColor || '#0F172A' }}
                                    >
                                      {card.title}
                                    </h3>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{card.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: VERSION REVISION HISTORY */}
                {aboutActiveTab === 'history' && (
                  <div className="space-y-4 animate-fade-in text-xs font-sans">
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                      <div className="border-b border-slate-900 pb-2 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Session Revision History ({aboutHistory.length})
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono">Restores local state prior to draft/publish</span>
                      </div>

                      {aboutHistory.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">No edits recorded in this session yet.</p>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                          {aboutHistory.map((hist, hIdx) => {
                            const isCurrent = hIdx === 0;
                            return (
                              <div key={hIdx} className="bg-slate-950 p-4 border border-slate-900 rounded-xl flex items-center justify-between gap-4">
                                <div>
                                  <p className="font-bold text-slate-300 font-mono text-[10px]">{hist.timestamp}</p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    {hist.content.paragraphs?.length || 0} Paragraphs • {hist.content.featureCards?.length || 0} Feature Cards • Color: {hist.styles.backgroundColor || '#FFF'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[9px] uppercase">
                                      Latest
                                    </span>
                                  )}
                                  <button
                                    onClick={() => {
                                      // Restore history copy
                                      updateAboutNXContent(JSON.parse(JSON.stringify(hist.content)));
                                      updateAboutNXStyles(JSON.parse(JSON.stringify(hist.styles)));
                                      showMsg(`Restored version from ${hist.timestamp}!`, "success");
                                    }}
                                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded"
                                  >
                                    Restore Version
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

              {/* FROM CHALLENGES TO SOLUTIONS SECTION EDITOR */}
          {selectedSectionId === 'home-challenges-to-solutions' && challengesToSolutionsSec && (() => {
            const content = challengesToSolutionsSec.content || {};
            const styles = challengesToSolutionsSec.styles || {};

            // Items lists
            const challengesList = content.challenges || [];
            const engineeringStepsList = content.engineeringSteps || [];
            const outcomesList = content.outcomes || [];

            // Generic update helper
            const updateItemField = (itemType: 'challenge' | 'step' | 'outcome', id: string, fields: any) => {
              if (itemType === 'challenge') {
                const list = challengesList.map((item: any) => item.id === id ? { ...item, ...fields } : item);
                updateChallengesToSolutionsContent({ challenges: list });
              } else if (itemType === 'step') {
                const list = engineeringStepsList.map((item: any) => item.id === id ? { ...item, ...fields } : item);
                updateChallengesToSolutionsContent({ engineeringSteps: list });
              } else if (itemType === 'outcome') {
                const list = outcomesList.map((item: any) => item.id === id ? { ...item, ...fields } : item);
                updateChallengesToSolutionsContent({ outcomes: list });
              }
            };

            const handleAddItem = (itemType: 'challenge' | 'step' | 'outcome') => {
              recordChallengesHistory(`Add ${itemType}`);
              if (itemType === 'challenge') {
                const newList = [...challengesList];
                newList.push({
                  id: 'ch-' + Date.now(),
                  title: 'New Operational Challenge',
                  icon: 'ClipboardList',
                  description: 'Description of the bottleneck or operational challenge.',
                  status: true,
                  order: newList.length + 1
                });
                updateChallengesToSolutionsContent({ challenges: newList });
              } else if (itemType === 'step') {
                const newList = [...engineeringStepsList];
                newList.push({
                  id: 'eng-' + Date.now(),
                  title: 'New Engineering Step',
                  icon: 'Eye',
                  description: 'Detailed description of this engineering process phase.',
                  stepNumber: String(newList.length + 1).padStart(2, '0'),
                  status: true,
                  order: newList.length + 1
                });
                updateChallengesToSolutionsContent({ engineeringSteps: newList });
              } else if (itemType === 'outcome') {
                const newList = [...outcomesList];
                newList.push({
                  id: 'out-' + Date.now(),
                  title: 'New Intelligent Outcome',
                  icon: 'Brain',
                  description: 'Description of positive B2B business outcomes and results.',
                  status: true,
                  order: newList.length + 1
                });
                updateChallengesToSolutionsContent({ outcomes: newList });
              }
            };

            const handleDuplicateItem = (itemType: 'challenge' | 'step' | 'outcome', item: any) => {
              recordChallengesHistory(`Duplicate ${itemType}`);
              if (itemType === 'challenge') {
                const newList = [...challengesList];
                newList.push({
                  ...item,
                  id: 'ch-' + Date.now(),
                  title: item.title + ' (Copy)',
                  order: newList.length + 1
                });
                updateChallengesToSolutionsContent({ challenges: newList });
              } else if (itemType === 'step') {
                const newList = [...engineeringStepsList];
                newList.push({
                  ...item,
                  id: 'eng-' + Date.now(),
                  title: item.title + ' (Copy)',
                  stepNumber: String(newList.length + 1).padStart(2, '0'),
                  order: newList.length + 1
                });
                updateChallengesToSolutionsContent({ engineeringSteps: newList });
              } else if (itemType === 'outcome') {
                const newList = [...outcomesList];
                newList.push({
                  ...item,
                  id: 'out-' + Date.now(),
                  title: item.title + ' (Copy)',
                  order: newList.length + 1
                });
                updateChallengesToSolutionsContent({ outcomes: newList });
              }
            };

            const handleMoveItem = (itemType: 'challenge' | 'step' | 'outcome', idx: number, dir: 'up' | 'down') => {
              recordChallengesHistory(`Reorder ${itemType} items`);
              let list = itemType === 'challenge' 
                ? [...challengesList] 
                : itemType === 'step' 
                  ? [...engineeringStepsList] 
                  : [...outcomesList];
              
              const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
              if (targetIdx < 0 || targetIdx >= list.length) return;
              
              const temp = list[idx];
              list[idx] = list[targetIdx];
              list[targetIdx] = temp;

              // Re-assign orders
              list = list.map((item, index) => ({ ...item, order: index + 1 }));

              if (itemType === 'challenge') {
                updateChallengesToSolutionsContent({ challenges: list });
              } else if (itemType === 'step') {
                updateChallengesToSolutionsContent({ engineeringSteps: list });
              } else if (itemType === 'outcome') {
                updateChallengesToSolutionsContent({ outcomes: list });
              }
            };

            const handleDeleteItem = (itemType: 'challenge' | 'step' | 'outcome', id: string) => {
              promptDelete(`Delete ${itemType}`, `${itemType.toUpperCase()} Item`, () => {
                recordChallengesHistory(`Delete ${itemType}`);
                if (itemType === 'challenge') {
                  const list = challengesList.filter((c: any) => c.id !== id);
                  updateChallengesToSolutionsContent({ challenges: list });
                } else if (itemType === 'step') {
                  const list = engineeringStepsList.filter((s: any) => s.id !== id);
                  updateChallengesToSolutionsContent({ engineeringSteps: list });
                } else if (itemType === 'outcome') {
                  const list = outcomesList.filter((o: any) => o.id !== id);
                  updateChallengesToSolutionsContent({ outcomes: list });
                }
                if (editingItemId === id) {
                  setEditingItemId(null);
                  setEditingItemType(null);
                }
                showMsg(`Deleted ${itemType} item.`, 'success');
              });
            };

            const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, itemType: 'challenge' | 'step' | 'outcome', id: string) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result as string;
                recordChallengesHistory('Upload Custom Icon File');
                updateItemField(itemType, id, { icon: base64 });
              };
              reader.readAsDataURL(file);
            };

            const handleRestoreVersion = (ver: any) => {
              recordChallengesHistory('Pre-Restore Backup');
              setSections(prev => prev.map(sec => {
                if (sec.id === 'home-challenges-to-solutions') {
                  return {
                    ...sec,
                    content: JSON.parse(JSON.stringify(ver.content || {})),
                    styles: JSON.parse(JSON.stringify(ver.styles || {}))
                  };
                }
                return sec;
              }));
              showMsg('Restored historical config successfully.', 'success');
            };

            const currentlyEditingItem = (() => {
              if (!editingItemId || !editingItemType) return null;
              if (editingItemType === 'challenge') return challengesList.find((c: any) => c.id === editingItemId);
              if (editingItemType === 'step') return engineeringStepsList.find((s: any) => s.id === editingItemId);
              if (editingItemType === 'outcome') return outcomesList.find((o: any) => o.id === editingItemId);
              return null;
            })();

            // Common Lucide Icon catalog for picker
            const defaultIcons = [
              'ClipboardList', 'ShieldAlert', 'UserMinus', 'Clock', 'Search', 'FileWarning', 'AlertTriangle',
              'Eye', 'LineChart', 'PenTool', 'Cpu', 'Server', 'Sparkles', 'Brain', 'RefreshCw', 'Tv', 'BarChart3',
              'Zap', 'DollarSign', 'ShieldCheck', 'HelpCircle', 'Activity', 'Settings', 'Database', 'Layout'
            ];

            return (
              <div className="space-y-6 animate-fade-in text-slate-200">
                <div className="border-b border-slate-900 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>From Challenges to Solutions Editor</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure badge headers, dynamic lists, columns configurations, styling settings, and custom flow lines.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 self-start md:self-auto">
                    <span className="text-[10px] font-semibold text-slate-400">Render Section:</span>
                    <button
                      onClick={() => toggleSectionVisibility('home-challenges-to-solutions')}
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded transition-all ${
                        challengesToSolutionsSec.visible ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                      }`}
                    >
                      {challengesToSolutionsSec.visible ? 'Active' : 'Offline'}
                    </button>
                  </div>
                </div>

                {/* Tab Navigation buttons */}
                <div className="flex flex-wrap gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-900">
                  {[
                    { id: 'header', label: 'Header & Columns' },
                    { id: 'col1', label: 'Col 1 (Challenges)' },
                    { id: 'col2', label: 'Col 2 (Approach)' },
                    { id: 'col3', label: 'Col 3 (Outcomes)' },
                    { id: 'styling', label: 'Grid Layout & Styles' },
                    { id: 'arrows', label: 'Flow & Connectors' },
                    { id: 'history', label: 'Backup History' }
                  ].map((tb) => (
                    <button
                      key={tb.id}
                      onClick={() => {
                        setChallengesActiveTab(tb.id as any);
                        setEditingItemId(null);
                        setEditingItemType(null);
                      }}
                      className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                        challengesActiveTab === tb.id
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {tb.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: HEADER & COLUMNS DETAILS */}
                {challengesActiveTab === 'header' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-6">
                      <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <span>Section Header Setup</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Badge Number</label>
                          <input
                            type="text"
                            value={content.badge || '03'}
                            onChange={(e) => {
                              recordChallengesHistory('Edit Badge Number');
                              updateChallengesToSolutionsContent({ badge: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                            placeholder="e.g., 03"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Badge Label Text</label>
                          <input
                            type="text"
                            value={content.badgeText || 'FROM CHALLENGES TO SOLUTIONS'}
                            onChange={(e) => {
                              recordChallengesHistory('Edit Badge Label Text');
                              updateChallengesToSolutionsContent({ badgeText: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                            placeholder="e.g., FROM CHALLENGES TO SOLUTIONS"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Badge Background</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={content.badgeBgColor || '#15803D'}
                              onChange={(e) => {
                                recordChallengesHistory('Edit Badge Background Color');
                                updateChallengesToSolutionsContent({ badgeBgColor: e.target.value });
                              }}
                              className="w-10 h-10 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                            />
                            <input
                              type="text"
                              value={content.badgeBgColor || '#15803D'}
                              onChange={(e) => updateChallengesToSolutionsContent({ badgeBgColor: e.target.value })}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Badge Text Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={content.badgeTextColor || '#FFFFFF'}
                              onChange={(e) => {
                                recordChallengesHistory('Edit Badge Text Color');
                                updateChallengesToSolutionsContent({ badgeTextColor: e.target.value });
                              }}
                              className="w-10 h-10 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                            />
                            <input
                              type="text"
                              value={content.badgeTextColor || '#FFFFFF'}
                              onChange={(e) => updateChallengesToSolutionsContent({ badgeTextColor: e.target.value })}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Heading Text Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={content.headingColor || '#0F172A'}
                              onChange={(e) => {
                                recordChallengesHistory('Edit Heading Text Color');
                                updateChallengesToSolutionsContent({ headingColor: e.target.value });
                              }}
                              className="w-10 h-10 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                            />
                            <input
                              type="text"
                              value={content.headingColor || '#0F172A'}
                              onChange={(e) => updateChallengesToSolutionsContent({ headingColor: e.target.value })}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-6">
                      <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <span>Column General Settings</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Col 1 Settings */}
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3.5">
                          <h4 className="text-[11px] font-black text-red-400 uppercase tracking-wider">Column 1 (Operational Challenges)</h4>
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Header Title</label>
                            <input
                              type="text"
                              value={content.col1Title || 'OPERATIONAL CHALLENGES'}
                              onChange={(e) => updateChallengesToSolutionsContent({ col1Title: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Color Theme</label>
                            <input
                              type="color"
                              value={content.col1Color || '#B91C1C'}
                              onChange={(e) => updateChallengesToSolutionsContent({ col1Color: e.target.value })}
                              className="w-full h-8 bg-transparent cursor-pointer rounded overflow-hidden border border-slate-800"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-slate-500 font-bold uppercase">Card Bg</label>
                              <input
                                type="text"
                                value={content.col1CardBg || '#FFF8F8'}
                                onChange={(e) => updateChallengesToSolutionsContent({ col1CardBg: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 font-bold uppercase">Border Color</label>
                              <input
                                type="text"
                                value={content.col1BorderColor || '#FEE2E2'}
                                onChange={(e) => updateChallengesToSolutionsContent({ col1BorderColor: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Col 2 Settings */}
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3.5">
                          <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-wider">Column 2 (Our Approach)</h4>
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Header Title</label>
                            <input
                              type="text"
                              value={content.col2Title || 'OUR ENGINEERING APPROACH'}
                              onChange={(e) => updateChallengesToSolutionsContent({ col2Title: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Color Theme</label>
                            <input
                              type="color"
                              value={content.col2Color || '#1D4ED8'}
                              onChange={(e) => updateChallengesToSolutionsContent({ col2Color: e.target.value })}
                              className="w-full h-8 bg-transparent cursor-pointer rounded overflow-hidden border border-slate-800"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-slate-500 font-bold uppercase">Card Bg</label>
                              <input
                                type="text"
                                value={content.col2CardBg || '#F0F7FF'}
                                onChange={(e) => updateChallengesToSolutionsContent({ col2CardBg: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 font-bold uppercase">Border Color</label>
                              <input
                                type="text"
                                value={content.col2BorderColor || '#DBEAFE'}
                                onChange={(e) => updateChallengesToSolutionsContent({ col2BorderColor: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Col 3 Settings */}
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3.5">
                          <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Column 3 (Intelligent Outcomes)</h4>
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Header Title</label>
                            <input
                              type="text"
                              value={content.col3Title || 'INTELLIGENT OUTCOMES'}
                              onChange={(e) => updateChallengesToSolutionsContent({ col3Title: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Color Theme</label>
                            <input
                              type="color"
                              value={content.col3Color || '#15803D'}
                              onChange={(e) => updateChallengesToSolutionsContent({ col3Color: e.target.value })}
                              className="w-full h-8 bg-transparent cursor-pointer rounded overflow-hidden border border-slate-800"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-slate-500 font-bold uppercase">Card Bg</label>
                              <input
                                type="text"
                                value={content.col3CardBg || '#F4FBF7'}
                                onChange={(e) => updateChallengesToSolutionsContent({ col3CardBg: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 font-bold uppercase">Border Color</label>
                              <input
                                type="text"
                                value={content.col3BorderColor || '#D1FAE5'}
                                onChange={(e) => updateChallengesToSolutionsContent({ col3BorderColor: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 2, 3, 4: LISTS CONFIGURATION PANEL */}
                {(challengesActiveTab === 'col1' || challengesActiveTab === 'col2' || challengesActiveTab === 'col3') && (() => {
                  const currentItemType = challengesActiveTab === 'col1' ? 'challenge' : challengesActiveTab === 'col2' ? 'step' : 'outcome';
                  const currentList = challengesActiveTab === 'col1' ? challengesList : challengesActiveTab === 'col2' ? engineeringStepsList : outcomesList;
                  const labelTitle = challengesActiveTab === 'col1' ? 'Operational Challenges' : challengesActiveTab === 'col2' ? 'Engineering Approach Steps' : 'Intelligent Outcomes';

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Interactive List */}
                      <div className="lg:col-span-7 bg-slate-900/40 border border-slate-900/80 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">{labelTitle}</h3>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Manage list content, status, and custom vector icons.</p>
                          </div>
                          <button
                            onClick={() => handleAddItem(currentItemType)}
                            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Item</span>
                          </button>
                        </div>

                        {currentList.length === 0 ? (
                          <div className="bg-slate-950/60 p-8 rounded-xl border border-dashed border-slate-800 text-center text-slate-500">
                            No items exist. Click &quot;Add Item&quot; to build your dynamic list.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                            {currentList.map((item: any, idx: number) => {
                              const isEditing = editingItemId === item.id;
                              return (
                                <div
                                  key={item.id || idx}
                                  onClick={() => {
                                    setEditingItemId(item.id);
                                    setEditingItemType(currentItemType);
                                  }}
                                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                    isEditing 
                                      ? 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-md' 
                                      : 'bg-slate-950/80 border-slate-900 text-slate-300 hover:bg-slate-900/60'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 font-bold text-[11px] text-slate-400">
                                      {item.stepNumber || idx + 1}
                                    </div>
                                    <div className="truncate text-left">
                                      <div className="font-bold text-xs">{item.title || 'Untitled Item'}</div>
                                      <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{item.description || 'No description added'}</div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    {/* Order Up */}
                                    <button
                                      disabled={idx === 0}
                                      onClick={() => handleMoveItem(currentItemType, idx, 'up')}
                                      className="p-1 text-slate-500 hover:text-indigo-400 disabled:opacity-20 transition-colors"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    {/* Order Down */}
                                    <button
                                      disabled={idx === currentList.length - 1}
                                      onClick={() => handleMoveItem(currentItemType, idx, 'down')}
                                      className="p-1 text-slate-500 hover:text-indigo-400 disabled:opacity-20 transition-colors"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    {/* Toggle Active Status */}
                                    <button
                                      onClick={() => {
                                        recordChallengesHistory(`Toggle ${currentItemType} status`);
                                        updateItemField(currentItemType, item.id, { status: item.status === false ? true : false });
                                      }}
                                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] border font-black transition-all ${
                                        item.status !== false
                                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                          : 'bg-slate-800 border-slate-750 text-slate-500'
                                      }`}
                                      title={item.status !== false ? 'Active' : 'Hidden'}
                                    >
                                      {item.status !== false ? '✓' : '✗'}
                                    </button>
                                    {/* Duplicate */}
                                    <button
                                      onClick={() => handleDuplicateItem(currentItemType, item)}
                                      className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                                      title="Duplicate"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4l2 2v2M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h5a2 2 0 002-2v-3" /></svg>
                                    </button>
                                    {/* Delete */}
                                    <button
                                      onClick={() => handleDeleteItem(currentItemType, item.id)}
                                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right: Inline Item Editor */}
                      <div className="lg:col-span-5">
                        {currentlyEditingItem ? (
                          <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-5 space-y-4 text-left animate-fade-in">
                            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                                Editing Item Specs
                              </span>
                              <button
                                onClick={() => {
                                  setEditingItemId(null);
                                  setEditingItemType(null);
                                }}
                                className="text-slate-400 hover:text-white text-[11px] font-bold"
                              >
                                Close
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Item Title</label>
                                <input
                                  type="text"
                                  value={currentlyEditingItem.title || ''}
                                  onChange={(e) => updateItemField(currentItemType, currentlyEditingItem.id, { title: e.target.value })}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Item Description</label>
                                <textarea
                                  value={currentlyEditingItem.description || ''}
                                  onChange={(e) => updateItemField(currentItemType, currentlyEditingItem.id, { description: e.target.value })}
                                  className="w-full h-16 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white resize-none"
                                  placeholder="Provide optional contextual info"
                                />
                              </div>

                              {currentItemType === 'step' && (
                                <div>
                                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Step Badge Number (e.g., 01)</label>
                                  <input
                                    type="text"
                                    value={currentlyEditingItem.stepNumber || ''}
                                    onChange={(e) => updateItemField(currentItemType, currentlyEditingItem.id, { stepNumber: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white font-mono"
                                  />
                                </div>
                              )}

                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Vector Icon identifier</label>
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={currentlyEditingItem.icon || ''}
                                      onChange={(e) => updateItemField(currentItemType, currentlyEditingItem.id, { icon: e.target.value })}
                                      className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white font-mono"
                                      placeholder="e.g. ClipboardList, material:speed, or raw <svg>"
                                    />
                                    <label className="bg-indigo-900/60 hover:bg-indigo-850 border border-indigo-700/40 text-indigo-300 text-[10px] font-bold px-3 py-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                                      <span>Upload File</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, currentItemType, currentlyEditingItem.id)}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                  <p className="text-[9px] text-slate-500 leading-normal">
                                    Supports <strong>Lucide names</strong> (e.g., <code>Eye</code>), <strong>Google Material Icons</strong> starting with <code>material:</code> (e.g., <code>material:lock</code>), raw inline <strong>&lt;svg&gt;</strong> strings, or dynamic file uploads!
                                  </p>

                                  {/* Lucide Grid Picker */}
                                  <div className="pt-2">
                                    <span className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5">Quick Select Catalog:</span>
                                    <div className="grid grid-cols-7 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-900 max-h-[110px] overflow-y-auto">
                                      {defaultIcons.map((ic) => (
                                        <button
                                          key={ic}
                                          onClick={() => updateItemField(currentItemType, currentlyEditingItem.id, { icon: ic })}
                                          className={`p-1 bg-slate-900 border hover:bg-indigo-950 hover:border-indigo-500/40 text-slate-400 rounded flex items-center justify-center transition-colors ${currentlyEditingItem.icon === ic ? 'border-indigo-500 bg-indigo-900/20 text-indigo-400' : 'border-slate-850'}`}
                                          title={ic}
                                        >
                                          {/* Mini SVG proxy representation */}
                                          <span className="text-[8px] font-mono leading-none truncate select-none">{ic.substring(0,3)}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-900/10 border border-dashed border-slate-900 rounded-2xl p-8 text-center text-slate-500 text-xs">
                            Select any list item from the left pane to edit its comprehensive content specs, upload icons, or manage order.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* TAB 5: LAYOUT & STYLES */}
                {challengesActiveTab === 'styling' && (
                  <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Section Grid Styling & Margins</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Control desktop column modes, margins, paddings, card spacing and aesthetics.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-1">Layout Coordinates</h4>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Desktop Columns Configuration</label>
                          <select
                            value={content.layoutDesktop || '3'}
                            onChange={(e) => {
                              recordChallengesHistory('Change Desktop Layout Columns');
                              updateChallengesToSolutionsContent({ layoutDesktop: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="3">3 Columns (Standard Grid: Challenges ➔ Approach ➔ Outcomes)</option>
                            <option value="1">1 Column (Stacked Single List)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Max Container Width</label>
                          <select
                            value={content.containerWidth || 'max-w-7xl'}
                            onChange={(e) => updateChallengesToSolutionsContent({ containerWidth: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="max-w-5xl">Narrow (5xl - 1024px)</option>
                            <option value="max-w-6xl">Medium (6xl - 1152px)</option>
                            <option value="max-w-7xl">Standard (7xl - 1280px)</option>
                            <option value="max-w-none">Full Screen (Width Unlimited)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Card Spacing Gap</label>
                          <input
                            type="text"
                            value={content.cardGap || '1rem'}
                            onChange={(e) => updateChallengesToSolutionsContent({ cardGap: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                            placeholder="e.g. 1rem, 1.5rem, 24px"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-1">Spacing Dimensions</h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Top Padding</label>
                            <input
                              type="text"
                              value={styles.paddingTop || '48px'}
                              onChange={(e) => updateChallengesToSolutionsStyles({ paddingTop: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Bottom Padding</label>
                            <input
                              type="text"
                              value={styles.paddingBottom || '48px'}
                              onChange={(e) => updateChallengesToSolutionsStyles({ paddingBottom: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Top Margin</label>
                            <input
                              type="text"
                              value={styles.marginTop || '0px'}
                              onChange={(e) => updateChallengesToSolutionsStyles({ marginTop: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Bottom Margin</label>
                            <input
                              type="text"
                              value={styles.marginBottom || '0px'}
                              onChange={(e) => updateChallengesToSolutionsStyles({ marginBottom: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Section Background Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={styles.backgroundColor || '#FFFFFF'}
                              onChange={(e) => updateChallengesToSolutionsStyles({ backgroundColor: e.target.value })}
                              className="w-10 h-10 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                            />
                            <input
                              type="text"
                              value={styles.backgroundColor || '#FFFFFF'}
                              onChange={(e) => updateChallengesToSolutionsStyles({ backgroundColor: e.target.value })}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Card Border Radius</label>
                        <input
                          type="text"
                          value={content.borderRadius || '12px'}
                          onChange={(e) => updateChallengesToSolutionsContent({ borderRadius: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                          placeholder="e.g. 12px, 8px, 0px"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Card Elevation Shadow</label>
                        <select
                          value={content.shadow || 'sm'}
                          onChange={(e) => updateChallengesToSolutionsContent({ shadow: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="none">None (Flat outline)</option>
                          <option value="sm">Soft (sm shadow)</option>
                          <option value="md">Medium (md elevation)</option>
                          <option value="lg">High (lg floating)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Item Hover Zoom Effect</label>
                        <select
                          value={content.hoverEffect !== false ? 'true' : 'false'}
                          onChange={(e) => updateChallengesToSolutionsContent({ hoverEffect: e.target.value === 'true' })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="true">Enabled (Micro Zoom & shadow transition)</option>
                          <option value="false">Disabled (Static list cards)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: FLOWS & CONNECTORS */}
                {challengesActiveTab === 'arrows' && (
                  <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Connectors & Animations</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Configure arrow symbols and loop icons positioned between the grid columns.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                          <div>
                            <span className="block text-xs font-bold text-white">Enable Column Flow Arrows</span>
                            <span className="block text-[10px] text-slate-500 leading-normal">Render connector arrows between columns in large viewports.</span>
                          </div>
                          <button
                            onClick={() => updateChallengesToSolutionsContent({ showArrows: content.showArrows === false ? true : false })}
                            className={`w-12 h-6 rounded-full transition-all relative p-0.5 border ${
                              content.showArrows !== false 
                                ? 'bg-indigo-600 border-indigo-500/30 text-white' 
                                : 'bg-slate-850 border-slate-750 text-slate-400'
                            }`}
                          >
                            <span className={`block w-4.5 h-4.5 bg-white rounded-full shadow transition-all transform ${content.showArrows !== false ? 'translate-x-6' : 'translate-x-0'}`}></span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                          <div>
                            <span className="block text-xs font-bold text-white">Enable Column 2 Step Connectors</span>
                            <span className="block text-[10px] text-slate-500 leading-normal">Render connectors between steps inside column 2.</span>
                          </div>
                          <button
                            onClick={() => updateChallengesToSolutionsContent({ showConnectors: content.showConnectors === false ? true : false })}
                            className={`w-12 h-6 rounded-full transition-all relative p-0.5 border ${
                              content.showConnectors !== false 
                                ? 'bg-indigo-600 border-indigo-500/30 text-white' 
                                : 'bg-slate-850 border-slate-750 text-slate-400'
                            }`}
                          >
                            <span className={`block w-4.5 h-4.5 bg-white rounded-full shadow transition-all transform ${content.showConnectors !== false ? 'translate-x-6' : 'translate-x-0'}`}></span>
                          </button>
                        </div>

                        {/* Step Connector Style Options */}
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 space-y-3">
                          <span className="block text-xs font-bold text-white">Step Connector Line Config</span>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Style</label>
                              <select
                                value={content.connectorStyle || 'dotted'}
                                onChange={(e) => updateChallengesToSolutionsContent({ connectorStyle: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                              >
                                <option value="dotted">Dotted</option>
                                <option value="dashed">Dashed</option>
                                <option value="solid">Solid</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Color</label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={content.connectorColor || '#1D4ED8'}
                                  onChange={(e) => updateChallengesToSolutionsContent({ connectorColor: e.target.value })}
                                  className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                                />
                                <input
                                  type="text"
                                  value={content.connectorColor || '#1D4ED8'}
                                  onChange={(e) => updateChallengesToSolutionsContent({ connectorColor: e.target.value })}
                                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1 text-[10px] text-white font-mono"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Thickness (px)</label>
                              <input
                                type="number"
                                min="1"
                                max="8"
                                value={content.connectorThickness || 2}
                                onChange={(e) => updateChallengesToSolutionsContent({ connectorThickness: Number(e.target.value) })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-900 space-y-4 text-left">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Arrow Icon Symbol</label>
                            <select
                              value={content.arrowIcon || 'ArrowRight'}
                              onChange={(e) => updateChallengesToSolutionsContent({ arrowIcon: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            >
                              <option value="ArrowRight">Arrow Right (Standard)</option>
                              <option value="ChevronRight">Chevron Right (Minimalist)</option>
                              <option value="Play">Play (Triangle Arrow)</option>
                              <option value="ArrowRightLeft">Bi-directional Flow</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Arrow Animation Effect</label>
                            <select
                              value={content.arrowAnimation || 'animate-pulse'}
                              onChange={(e) => updateChallengesToSolutionsContent({ arrowAnimation: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            >
                              <option value="none">Static (No Animation)</option>
                              <option value="animate-pulse">Pulse (Breathing Accent)</option>
                              <option value="animate-bounce">Bounce (Vertical Jump)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Arrow Color Accent</label>
                            <input
                              type="color"
                              value={content.arrowColor || '#64748B'}
                              onChange={(e) => updateChallengesToSolutionsContent({ arrowColor: e.target.value })}
                              className="w-full h-8 bg-transparent cursor-pointer rounded overflow-hidden border border-slate-800"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Arrow Frame Size</label>
                            <input
                              type="text"
                              value={content.arrowSize || '24px'}
                              onChange={(e) => updateChallengesToSolutionsContent({ arrowSize: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                              placeholder="e.g. 24px, 16px, 2rem"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 7: BACKUP HISTORY */}
                {challengesActiveTab === 'history' && (
                  <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Historical Configurations Backup</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Review localized edit events captured during your active editing session. Restore previous configurations in one click.</p>
                    </div>

                    {challengesHistory.length === 0 ? (
                      <div className="bg-slate-950/60 p-8 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                        No previous configuration states recorded yet. Modify any setting to capture historical backups.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                        {challengesHistory.map((entry, index) => {
                          return (
                            <div
                              key={index}
                              className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex items-center justify-between text-left hover:bg-slate-950/95 transition-all"
                            >
                              <div className="space-y-1">
                                <span className="block text-xs font-extrabold text-white">{entry.timestamp}</span>
                                <span className="block text-[10px] text-slate-500">
                                  Includes {(entry.content.challenges || []).length} challenges, {(entry.content.engineeringSteps || []).length} approaches, {(entry.content.outcomes || []).length} outcomes.
                                </span>
                              </div>
                              <button
                                onClick={() => handleRestoreVersion(entry)}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-650 text-indigo-400 hover:text-white border border-slate-850 hover:border-transparent rounded-lg text-[10px] font-bold transition-all"
                              >
                                Restore State
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Live Sandbox Card Preview block */}
                <div className="bg-slate-900/10 border border-slate-900/50 rounded-2xl p-5 space-y-3.5">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">
                    Live CMS Sandbox Layout Preview
                  </h3>
                  <div className="border border-slate-100 rounded-xl p-4 bg-white text-slate-800 overflow-hidden text-left shadow-inner">
                    <div className="flex items-center gap-3 mb-6">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                        style={{ backgroundColor: content.badgeBgColor || '#15803D' }}
                      >
                        {content.badge || '03'}
                      </div>
                      <h4 className="text-base font-extrabold tracking-wide uppercase text-slate-900">
                        {content.badgeText || 'FROM CHALLENGES TO SOLUTIONS'}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Column 1 Preview */}
                      <div 
                        className="border rounded-lg overflow-hidden flex flex-col"
                        style={{ backgroundColor: content.col1CardBg || '#FFF8F8', borderColor: content.col1BorderColor || '#FEE2E2' }}
                      >
                        <div 
                          className="text-white font-bold text-[10px] uppercase text-center py-2 px-2"
                          style={{ backgroundColor: content.col1Color || '#B91C1C' }}
                        >
                          {content.col1Title || 'OPERATIONAL CHALLENGES'}
                        </div>
                        <div className="p-3 flex-grow flex flex-col gap-2">
                          {challengesList.slice(0, 4).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-1.5 bg-white rounded border border-red-50/50 text-[10px] text-slate-800">
                              <span className="text-red-600 font-black">●</span>
                              <span className="font-bold truncate">{item.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Column 2 Preview */}
                      <div 
                        className="border rounded-lg overflow-hidden flex flex-col"
                        style={{ backgroundColor: content.col2CardBg || '#F0F7FF', borderColor: content.col2BorderColor || '#DBEAFE' }}
                      >
                        <div 
                          className="text-white font-bold text-[10px] uppercase text-center py-2 px-2"
                          style={{ backgroundColor: content.col2Color || '#1D4ED8' }}
                        >
                          {content.col2Title || 'OUR ENGINEERING APPROACH'}
                        </div>
                        <div className="p-3 flex-grow flex flex-col gap-1.5">
                          {engineeringStepsList.slice(0, 4).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-1.5 bg-white rounded border border-blue-50/50 text-[10px] text-slate-800">
                              <span className="text-blue-600 font-extrabold">{item.stepNumber || idx + 1}.</span>
                              <span className="font-bold truncate">{item.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Column 3 Preview */}
                      <div 
                        className="border rounded-lg overflow-hidden flex flex-col"
                        style={{ backgroundColor: content.col3CardBg || '#F4FBF7', borderColor: content.col3BorderColor || '#D1FAE5' }}
                      >
                        <div 
                          className="text-white font-bold text-[10px] uppercase text-center py-2 px-2"
                          style={{ backgroundColor: content.col3Color || '#15803D' }}
                        >
                          {content.col3Title || 'INTELLIGENT OUTCOMES'}
                        </div>
                        <div className="p-3 flex-grow flex flex-col gap-2">
                          {outcomesList.slice(0, 4).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-1.5 bg-white rounded border border-emerald-50/50 text-[10px] text-slate-800">
                              <span className="text-emerald-600 font-black">✓</span>
                              <span className="font-bold truncate">{item.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* INDUSTRIES WE SERVE SECTION EDITOR */}
          {selectedSectionId === 'home-industries-serve' && industriesServeSec && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Industries We Serve Section Editor</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Configure section headers, badges, custom style settings, and view links to Industry Management.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                  <span className="text-[10px] font-semibold text-slate-400">Render:</span>
                  <button
                    onClick={() => toggleSectionVisibility('home-industries-serve')}
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      industriesServeSec.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {industriesServeSec.visible ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Header Configurations */}
              <div className="bg-slate-900/35 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Header Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section Badge (Numeric/Label)</label>
                    <input
                      type="text"
                      value={industriesServeSec.content.badge || ''}
                      onChange={(e) => updateIndustriesServeContent({ badge: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      placeholder="e.g. 04"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section Title Text</label>
                    <input
                      type="text"
                      value={industriesServeSec.content.title || ''}
                      onChange={(e) => updateIndustriesServeContent({ title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      placeholder="e.g. INDUSTRIES WE SERVE"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">CTA Button Label</label>
                    <input
                      type="text"
                      value={industriesServeSec.content.ctaText || ''}
                      onChange={(e) => updateIndustriesServeContent({ ctaText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      placeholder="Explore All Industries"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">CTA Redirect URL</label>
                    <input
                      type="text"
                      value={industriesServeSec.content.ctaUrl || ''}
                      onChange={(e) => updateIndustriesServeContent({ ctaUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      placeholder="/industries"
                    />
                  </div>
                </div>
              </div>

              {/* Selected Industries Manager */}
              <div className="bg-slate-900/35 border border-slate-900 p-5 rounded-2xl space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Selected Landing Page Industries
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Choose which industries are highlighted on the landing page slider, drag/reorder their position, and highlight key ones.
                    </p>
                  </div>
                </div>

                {/* Add Industry Selector */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-grow">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 font-sans">Add Industry to Home Page</label>
                    <select
                      id="home-industry-select-add"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                      defaultValue=""
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          addIndustryToSection(val);
                          e.target.value = ""; // Reset
                        }
                      }}
                    >
                      <option value="" disabled>-- Select an industry to add --</option>
                      {allIndustries
                        .filter(ind => {
                          const currentItems = industriesServeSec.content.items || [];
                          return !currentItems.some((item: any) => item.id === ind.id);
                        })
                        .map(ind => (
                          <option key={ind.id} value={ind.id}>
                            {ind.name} ({ind.status || 'draft'})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <div className="text-[10px] text-slate-500 italic pb-2">
                    Select an industry to automatically append it to the slider list.
                  </div>
                </div>

                {/* List of currently chosen industries in a Table format */}
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                  {(() => {
                    const chosenItems = industriesServeSec.content.items || [];
                    if (chosenItems.length === 0) {
                      return (
                        <div className="text-center py-8 border-t border-dashed border-slate-800 text-slate-500 text-xs">
                          No industries selected. Choose from the dropdown above to add industries, or they will fallback to all published industries.
                        </div>
                      );
                    }
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              <th className="p-3 pl-4">Industry</th>
                              <th className="p-3">Industry Image</th>
                              <th className="p-3">Home Page Image</th>
                              <th className="p-3 text-center">Featured</th>
                              <th className="p-3 text-center">Visible</th>
                              <th className="p-3 text-right pr-4">Order & Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900 text-xs text-slate-300">
                            {chosenItems.map((item: any, idx: number) => {
                              const indDetails = allIndustries.find(i => i.id === item.id);
                              const isFeatured = !!item.featured;
                              const isVisible = item.visible !== false;
                              const industryImage = indDetails ? (indDetails.cardImage || indDetails.coverImage) : '';
                              const homePageImgUrl = item.homePageImage?.url || '';

                              return (
                                <tr 
                                  key={item.id} 
                                  className={`hover:bg-slate-900/10 transition-colors ${
                                    isFeatured ? 'bg-amber-500/[0.01]' : ''
                                  }`}
                                >
                                  {/* Industry Info */}
                                  <td className="p-3 pl-4 min-w-[150px]">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-xs text-white">
                                        {indDetails ? indDetails.name : `Unknown (${item.id})`}
                                      </span>
                                      {indDetails && (
                                        <span className={`text-[9px] font-bold uppercase px-1 rounded ${
                                          indDetails.status === 'published' 
                                            ? 'bg-emerald-500/10 text-emerald-400' 
                                            : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                          {indDetails.status || 'draft'}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate max-w-[180px] mt-0.5">
                                      {indDetails ? (indDetails.shortDescription || indDetails.description) : 'No details available.'}
                                    </p>
                                  </td>

                                  {/* Industry Image Preview */}
                                  <td className="p-3">
                                    {industryImage ? (
                                      <div className="w-14 h-9 rounded overflow-hidden border border-slate-800 bg-slate-900">
                                        <img 
                                          src={industryImage} 
                                          alt="Industry Card" 
                                          className="w-full h-full object-cover" 
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-600 italic">No Image</span>
                                    )}
                                  </td>

                                  {/* Home Page Image (Upload, Preview, Replace, Remove) */}
                                  <td className="p-3">
                                    <div className="flex items-center gap-3">
                                      {/* Preview current Home Page Image */}
                                      {homePageImgUrl ? (
                                        <div className="w-14 h-9 rounded overflow-hidden border border-emerald-500/30 bg-slate-900 relative group">
                                          <img 
                                            src={homePageImgUrl} 
                                            alt="Home Page custom" 
                                            className="w-full h-full object-cover" 
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-14 h-9 rounded border border-dashed border-slate-800 bg-slate-950/40 flex items-center justify-center text-[9px] text-slate-600 italic">
                                          Fallback
                                        </div>
                                      )}

                                      {/* Action buttons */}
                                      <div className="flex items-center gap-1.5">
                                        <label className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] text-slate-300 font-bold cursor-pointer transition-colors">
                                          <Upload className="w-3 h-3 text-indigo-400" />
                                          <span>{homePageImgUrl ? 'Replace' : 'Upload'}</span>
                                          <input 
                                            type="file" 
                                            accept="image/png, image/jpeg, image/jpg, image/webp" 
                                            className="hidden" 
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                if (file.size > 10 * 1024 * 1024) {
                                                  showMsg("Maximum file size is 10 MB.", "error");
                                                  return;
                                                }
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                  if (ev.target?.result) {
                                                    const updatedItems = chosenItems.map((ci: any) => {
                                                      if (ci.id === item.id) {
                                                        return {
                                                          ...ci,
                                                          homePageImage: {
                                                            url: ev.target.result as string,
                                                            alt: `${indDetails?.name || 'Industry'} Home Page`
                                                          }
                                                        };
                                                      }
                                                      return ci;
                                                    });
                                                    updateIndustriesServeContent({ items: updatedItems });
                                                    showMsg(`Home Page Image for ${indDetails?.name || 'Industry'} updated successfully!`, "success");
                                                  }
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                        </label>

                                        {homePageImgUrl && (
                                          <button
                                            onClick={() => {
                                              const updatedItems = chosenItems.map((ci: any) => {
                                                if (ci.id === item.id) {
                                                  const { homePageImage, ...rest } = ci;
                                                  return rest;
                                                }
                                                return ci;
                                              });
                                              updateIndustriesServeContent({ items: updatedItems });
                                              showMsg(`Home Page Image for ${indDetails?.name || 'Industry'} removed.`, "success");
                                            }}
                                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-400 transition-colors"
                                            title="Remove Home Page Image"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Featured toggle */}
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => toggleIndustryFeatured(item.id)}
                                      className={`p-1.5 rounded-lg border transition-all ${
                                        isFeatured 
                                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                          : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300'
                                      }`}
                                      title={isFeatured ? 'Featured (Click to Unmark)' : 'Mark Featured'}
                                    >
                                      <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-400' : ''}`} />
                                    </button>
                                  </td>

                                  {/* Visibility toggle */}
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => toggleIndustryVisible(item.id)}
                                      className={`p-1.5 rounded-lg border transition-all ${
                                        isVisible 
                                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                      }`}
                                      title={isVisible ? 'Visible in list (Click to Hide)' : 'Hidden (Click to Show)'}
                                    >
                                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </button>
                                  </td>

                                  {/* Order and Actions */}
                                  <td className="p-3 text-right pr-4">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Order sorting numbers */}
                                      <span className="text-[10px] font-mono text-slate-600 font-bold bg-slate-900/60 w-5 h-5 rounded flex items-center justify-center mr-1">
                                        {idx + 1}
                                      </span>

                                      <button
                                        onClick={() => moveIndustryOrder(idx, 'up')}
                                        disabled={idx === 0}
                                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() => moveIndustryOrder(idx, 'down')}
                                        disabled={idx === chosenItems.length - 1}
                                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() => removeIndustryFromSection(item.id)}
                                        className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-500 hover:text-rose-400 border border-transparent hover:border-rose-500/15 transition-all ml-1"
                                        title="Remove from Section"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Connection to Industry Management */}
              <div className="bg-indigo-950/20 border border-indigo-500/20 p-5 rounded-2xl space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                      Connected Dynamic Module
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      This section is dynamically synchronized with your central <strong>Industry Management Database</strong>. 
                      Any changes, cards, custom images, icons, or text descriptions saved there will immediately propagate and update here on the public website.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => navigate('/superadmin/admin/industries')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/15"
                  >
                    <span>Manage Industries Database</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Styles Configurations */}
              <div className="bg-slate-900/35 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Styles & Margins
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Top Padding</label>
                    <input
                      type="text"
                      value={industriesServeSec.styles.paddingTop || '60px'}
                      onChange={(e) => updateIndustriesServeStyles({ paddingTop: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Bottom Padding</label>
                    <input
                      type="text"
                      value={industriesServeSec.styles.paddingBottom || '60px'}
                      onChange={(e) => updateIndustriesServeStyles({ paddingBottom: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Top Margin</label>
                    <input
                      type="text"
                      value={industriesServeSec.styles.marginTop || '0px'}
                      onChange={(e) => updateIndustriesServeStyles({ marginTop: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Bottom Margin</label>
                    <input
                      type="text"
                      value={industriesServeSec.styles.marginBottom || '0px'}
                      onChange={(e) => updateIndustriesServeStyles({ marginBottom: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase font-bold">Section Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={industriesServeSec.styles.backgroundColor || '#F8FAFC'}
                        onChange={(e) => updateIndustriesServeStyles({ backgroundColor: e.target.value })}
                        className="w-10 h-10 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                      />
                      <input
                        type="text"
                        value={industriesServeSec.styles.backgroundColor || '#F8FAFC'}
                        onChange={(e) => updateIndustriesServeStyles({ backgroundColor: e.target.value })}
                        className="flex-grow bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 uppercase font-bold">Section Alignment</label>
                    <select
                      value={industriesServeSec.styles.alignment || 'center'}
                      onChange={(e) => updateIndustriesServeStyles({ alignment: e.target.value })}
                      className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="left">Left Aligned Heading</option>
                      <option value="center">Center Aligned Heading</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HOME FEATURES SECTION EDITOR */}
          {selectedSectionId === 'home-features' && featSec && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Dynamic Feature Cards Editor</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Manage grid headers, add dynamic B2B card elements, select icons, and redirect paths.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                  <span className="text-[10px] font-semibold text-slate-400">Render:</span>
                  <button
                    onClick={() => toggleSectionVisibility('home-features')}
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      featSec.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {featSec.visible ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Grid headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section Title Tagline</label>
                  <input
                    type="text"
                    value={featSec.content.title || ''}
                    onChange={(e) => updateFeaturesContent({ title: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    placeholder="OUR ADVANTAGES"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section Subheading</label>
                  <input
                    type="text"
                    value={featSec.content.subtitle || ''}
                    onChange={(e) => updateFeaturesContent({ subtitle: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    placeholder="Tailored solutions for rapid deployment."
                  />
                </div>
              </div>

              {/* CRUD feature cards */}
              <div className="border-t border-slate-900 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Features Cards Grid (Max 10)
                  </h3>
                  <button
                    onClick={addFeatureCard}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Card</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(featSec.content.items || []).map((card: any, idx: number) => (
                    <div key={card.id || idx} className="bg-slate-900/35 border border-slate-900 p-5 rounded-2xl space-y-4 relative">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-400">
                            {idx + 1}
                          </span>
                          <span>{card.title || 'Untitled Card'}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Reorder Buttons */}
                          <button
                            onClick={() => moveFeatureCard(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveFeatureCard(idx, 'down')}
                            disabled={idx === featSec.content.items.length - 1}
                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Card */}
                          <button
                            onClick={() => removeFeatureCard(card.id)}
                            className="p-1 hover:bg-rose-500/10 rounded text-rose-500 hover:text-rose-400 ml-2"
                            title="Delete Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card form inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={card.title || ''}
                            onChange={(e) => updateFeatureCard(card.id, { title: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Action URL (Link redirect)</label>
                          <input
                            type="text"
                            value={card.link || card.actionUrl || ''}
                            onChange={(e) => updateFeatureCard(card.id, { link: e.target.value, actionUrl: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            placeholder="e.g. /solution, /contact"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Lucide Icon (e.g. Cpu, ShieldCheck)</label>
                          <select
                            value={card.icon || 'Sparkles'}
                            onChange={(e) => updateFeatureCard(card.id, { icon: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          >
                            <option value="Cpu">Cpu</option>
                            <option value="ShieldCheck">ShieldCheck</option>
                            <option value="Layers">Layers</option>
                            <option value="Brain">Brain</option>
                            <option value="Network">Network</option>
                            <option value="Server">Server</option>
                            <option value="Sparkles">Sparkles</option>
                            <option value="Activity">Activity</option>
                            <option value="Globe">Globe</option>
                            <option value="Zap">Zap</option>
                          </select>
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Advantage Description text</label>
                          <textarea
                            rows={2}
                            value={card.desc || ''}
                            onChange={(e) => updateFeatureCard(card.id, { desc: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(featSec.content.items || []).length === 0 && (
                    <div className="text-center py-12 border border-dashed border-slate-800/80 rounded-2xl text-slate-500 text-xs">
                      No advantages feature cards configured. Click "Add Card" to build card grid.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* HOME SOLUTION ENGINEERING PROCESS SECTION EDITOR */}
          {selectedSectionId === 'home-solution-process' && solutionProcessSec && (() => {
            const content = solutionProcessSec.content || {};
            const sectionHeader = content.sectionHeader || {};
            const steps = content.processSteps || [];
            const settings = content.settings || {};
            const styles = solutionProcessSec.styles || {};

            return (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-900 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-emerald-400" />
                      <span>Solution Engineering Process Editor</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Configure section headers, design beautiful process timelines, customize connect lines, and set custom icons or styles.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                    <span className="text-[10px] font-semibold text-slate-400">Section Status:</span>
                    <button
                      onClick={() => toggleSectionVisibility('home-solution-process')}
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        solutionProcessSec.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {solutionProcessSec.visible ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>

                {/* Sub-tabs inside Solution Process */}
                <div className="flex items-center gap-2 bg-slate-900/60 p-1 border border-slate-900 rounded-xl select-none">
                  {[
                    { id: 'header', label: '1. Section Heading' },
                    { id: 'steps', label: '2. Timeline Steps' },
                    { id: 'settings', label: '3. Connecting Lines & Layout' },
                    { id: 'history', label: '4. Revision Backups' }
                  ].map((tb) => (
                    <button
                      key={tb.id}
                      onClick={() => {
                        setSolutionProcessActiveTab(tb.id as any);
                        setEditingStepId(null);
                      }}
                      className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                        solutionProcessActiveTab === tb.id
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/15'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {tb.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: HEADER SETUP */}
                {solutionProcessActiveTab === 'header' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-6">
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <span>Section Header Setup</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Badge Number Prefix</label>
                          <input
                            type="text"
                            value={sectionHeader.badgeNumber || ''}
                            onChange={(e) => {
                              recordSolutionProcessHistory('Update Header Badge Number');
                              updateSolutionProcessContent({
                                sectionHeader: { ...sectionHeader, badgeNumber: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                            placeholder="05"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Badge / Heading Text</label>
                          <input
                            type="text"
                            value={sectionHeader.badgeText || ''}
                            onChange={(e) => {
                              recordSolutionProcessHistory('Update Header Badge Text');
                              updateSolutionProcessContent({
                                sectionHeader: { ...sectionHeader, badgeText: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                            placeholder="OUR SOLUTION ENGINEERING PROCESS"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Badge Background Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={sectionHeader.badgeColor || '#22c55e'}
                              onChange={(e) => {
                                recordSolutionProcessHistory('Update Badge Background Color');
                                updateSolutionProcessContent({
                                  sectionHeader: { ...sectionHeader, badgeColor: e.target.value }
                                });
                              }}
                              className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={sectionHeader.badgeColor || ''}
                              onChange={(e) => {
                                recordSolutionProcessHistory('Update Badge Background Color');
                                updateSolutionProcessContent({
                                  sectionHeader: { ...sectionHeader, badgeColor: e.target.value }
                                });
                              }}
                              className="flex-grow bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                              placeholder="#22c55e"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Badge Text / Heading Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={sectionHeader.headingColor || '#1e293b'}
                              onChange={(e) => {
                                recordSolutionProcessHistory('Update Header Heading Color');
                                updateSolutionProcessContent({
                                  sectionHeader: { ...sectionHeader, headingColor: e.target.value }
                                });
                              }}
                              className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={sectionHeader.headingColor || ''}
                              onChange={(e) => {
                                recordSolutionProcessHistory('Update Header Heading Color');
                                updateSolutionProcessContent({
                                  sectionHeader: { ...sectionHeader, headingColor: e.target.value }
                                });
                              }}
                              className="flex-grow bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                              placeholder="#1e293b"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TIMELINE STEPS MANAGEMENT */}
                {solutionProcessActiveTab === 'steps' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Process Milestones ({steps.length})</span>
                      <button
                        onClick={handleSolutionProcessAddItem}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Process Step</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {steps.map((step: any, idx: number) => {
                        const isExpanded = editingStepId === step.id;
                        return (
                          <div
                            key={step.id || idx}
                            className={`bg-slate-900/40 border rounded-2xl transition-all overflow-hidden ${
                              isExpanded ? 'border-emerald-500/50 shadow-md shadow-emerald-500/5' : 'border-slate-900 hover:border-slate-800'
                            }`}
                          >
                            {/* Summary row */}
                            <div
                              onClick={() => setEditingStepId(isExpanded ? null : step.id)}
                              className="flex items-center justify-between p-4 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="text-xs font-mono font-bold bg-slate-950 text-slate-500 w-6 h-6 rounded flex items-center justify-center">
                                  {idx + 1}
                                </div>
                                <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center bg-slate-950 text-emerald-400">
                                  {step.icon && (step.icon.startsWith('data:') || step.icon.includes('/') || step.icon.startsWith('blob:')) ? (
                                    <img src={step.icon} alt="" className="w-5 h-5 object-contain" />
                                  ) : (
                                    <Sparkles className="w-4 h-4 text-emerald-400" />
                                  )}
                                </div>
                                <div className="truncate">
                                  <span className="text-xs font-bold text-slate-100">{step.title || 'Untitled Step'}</span>
                                  {step.subtitle && (
                                    <span className="block text-[10px] text-slate-500 truncate">{step.subtitle}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                {/* Reordering buttons */}
                                <button
                                  disabled={idx === 0}
                                  onClick={() => handleSolutionProcessMoveItem(idx, 'up')}
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  disabled={idx === steps.length - 1}
                                  onClick={() => handleSolutionProcessMoveItem(idx, 'down')}
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>

                                {/* Duplicate Step */}
                                <button
                                  onClick={() => handleSolutionProcessDuplicateItem(step)}
                                  title="Duplicate"
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete step */}
                                <button
                                  onClick={() => handleSolutionProcessDeleteItem(step.id)}
                                  title="Delete"
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-500 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Enabled toggle */}
                                <button
                                  onClick={() => {
                                    recordSolutionProcessHistory('Toggle Step Visibility');
                                    updateSolutionProcessStepField(step.id, { status: step.status !== false ? false : true });
                                  }}
                                  className={`ml-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                    step.status !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-950 text-slate-500'
                                  }`}
                                >
                                  {step.status !== false ? 'Active' : 'Disabled'}
                                </button>
                              </div>
                            </div>

                            {/* Detail Panel */}
                            {isExpanded && (
                              <div className="border-t border-slate-900 bg-slate-950/60 p-5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Step Title (Required)</label>
                                    <input
                                      type="text"
                                      value={step.title || ''}
                                      onChange={(e) => updateSolutionProcessStepField(step.id, { title: e.target.value })}
                                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                      placeholder="Title text"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Step Subtitle (Optional)</label>
                                    <input
                                      type="text"
                                      value={step.subtitle || ''}
                                      onChange={(e) => updateSolutionProcessStepField(step.id, { subtitle: e.target.value })}
                                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                      placeholder="Subtitle short tag"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Milestone Description</label>
                                  <textarea
                                    value={step.description || ''}
                                    onChange={(e) => updateSolutionProcessStepField(step.id, { description: e.target.value })}
                                    rows={2}
                                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                    placeholder="Explain operations and outcomes for this step..."
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-900/60 pt-4">
                                  {/* Icon custom selection */}
                                  <div>
                                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Icon Picker / Text</label>
                                    <input
                                      type="text"
                                      value={step.icon || ''}
                                      onChange={(e) => updateSolutionProcessStepField(step.id, { icon: e.target.value })}
                                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                      placeholder="Lucide icon string e.g. Binoculars"
                                    />
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {['Binoculars', 'Search', 'LineChart', 'PenTool', 'Cpu', 'Rocket', 'RefreshCw', 'Sparkles', 'Workflow', 'TrendingUp'].map(ic => (
                                        <button
                                          key={ic}
                                          type="button"
                                          onClick={() => updateSolutionProcessStepField(step.id, { icon: ic })}
                                          className={`text-[9px] px-2 py-1 rounded border ${
                                            step.icon === ic ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                                          }`}
                                        >
                                          {ic}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Custom Icon / SVG Base64 upload */}
                                  <div>
                                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Or Upload custom icon/image</label>
                                    <div className="flex items-center gap-3">
                                      <label className="flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] text-slate-300 font-bold cursor-pointer transition-colors">
                                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Upload File</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleSolutionProcessFileUpload(e, step.id)}
                                          className="hidden"
                                        />
                                      </label>
                                      {step.icon && (step.icon.startsWith('data:') || step.icon.includes('/') || step.icon.startsWith('blob:')) && (
                                        <button
                                          type="button"
                                          onClick={() => updateSolutionProcessStepField(step.id, { icon: 'Sparkles' })}
                                          className="text-[9px] text-rose-400 hover:underline"
                                        >
                                          Reset to standard icon
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-[9px] text-slate-500 mt-1">Supports PNG, SVG, WebP. Automatically converted into safe Base64 string for CMS drafts.</p>
                                  </div>
                                </div>

                                <div className="border-t border-slate-900/60 pt-4">
                                  <span className="block text-[10px] text-slate-400 uppercase font-black mb-2">Step Element Style Overrides</span>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Icon Color</label>
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="color"
                                          value={step.iconColor || '#059669'}
                                          onChange={(e) => updateSolutionProcessStepField(step.id, { iconColor: e.target.value })}
                                          className="w-6 h-6 rounded cursor-pointer border border-slate-800"
                                        />
                                        <input
                                          type="text"
                                          value={step.iconColor || ''}
                                          onChange={(e) => updateSolutionProcessStepField(step.id, { iconColor: e.target.value })}
                                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-[10px] text-slate-300"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Icon Circle BG</label>
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="color"
                                          value={step.iconBgColor || '#ffffff'}
                                          onChange={(e) => updateSolutionProcessStepField(step.id, { iconBgColor: e.target.value })}
                                          className="w-6 h-6 rounded cursor-pointer border border-slate-800"
                                        />
                                        <input
                                          type="text"
                                          value={step.iconBgColor || ''}
                                          onChange={(e) => updateSolutionProcessStepField(step.id, { iconBgColor: e.target.value })}
                                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-[10px] text-slate-300"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Circle Border</label>
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="color"
                                          value={step.circleBorderColor || '#e2e8f0'}
                                          onChange={(e) => updateSolutionProcessStepField(step.id, { circleBorderColor: e.target.value })}
                                          className="w-6 h-6 rounded cursor-pointer border border-slate-800"
                                        />
                                        <input
                                          type="text"
                                          value={step.circleBorderColor || ''}
                                          onChange={(e) => updateSolutionProcessStepField(step.id, { circleBorderColor: e.target.value })}
                                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-[10px] text-slate-300"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Title Text Color</label>
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="color"
                                          value={step.titleColor || '#1e293b'}
                                          onChange={(e) => updateSolutionProcessStepField(step.id, { titleColor: e.target.value })}
                                          className="w-6 h-6 rounded cursor-pointer border border-slate-800"
                                        />
                                        <input
                                          type="text"
                                          value={step.titleColor || ''}
                                          onChange={(e) => updateSolutionProcessStepField(step.id, { titleColor: e.target.value })}
                                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-[10px] text-slate-300"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Circle Diameter (px)</label>
                                      <input
                                        type="number"
                                        min="60"
                                        max="140"
                                        value={step.circleSize || '90'}
                                        onChange={(e) => updateSolutionProcessStepField(step.id, { circleSize: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Icon Dimension (px)</label>
                                      <input
                                        type="number"
                                        min="20"
                                        max="64"
                                        value={step.iconSize || '36'}
                                        onChange={(e) => updateSolutionProcessStepField(step.id, { iconSize: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {steps.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-slate-800/80 rounded-2xl text-slate-500 text-xs">
                          No process milestones configured. Click "Add Process Step" to build the timeline.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: CONNECTORS AND GENERAL SETTINGS */}
                {solutionProcessActiveTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-6">
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">General Section Styling</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section Background Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settings.backgroundColor || '#ffffff'}
                              onChange={(e) => {
                                recordSolutionProcessHistory('Update Background Color');
                                updateSolutionProcessContent({
                                  settings: { ...settings, backgroundColor: e.target.value }
                                });
                              }}
                              className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={settings.backgroundColor || ''}
                              onChange={(e) => {
                                recordSolutionProcessHistory('Update Background Color');
                                updateSolutionProcessContent({
                                  settings: { ...settings, backgroundColor: e.target.value }
                                });
                              }}
                              className="flex-grow bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Alignment</label>
                          <select
                            value={settings.alignment || 'center'}
                            onChange={(e) => {
                              recordSolutionProcessHistory('Update Layout Alignment');
                              updateSolutionProcessContent({
                                settings: { ...settings, alignment: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                          >
                            <option value="center">Center-Aligned Header</option>
                            <option value="left">Left-Aligned Header (Matches Solutions)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Top Padding (px)</label>
                          <input
                            type="number"
                            min="20"
                            max="200"
                            value={settings.topPadding || '60'}
                            onChange={(e) => {
                              recordSolutionProcessHistory('Update Top Padding');
                              updateSolutionProcessContent({
                                settings: { ...settings, topPadding: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Bottom Padding (px)</label>
                          <input
                            type="number"
                            min="20"
                            max="200"
                            value={settings.bottomPadding || '60'}
                            onChange={(e) => {
                              recordSolutionProcessHistory('Update Bottom Padding');
                              updateSolutionProcessContent({
                                settings: { ...settings, bottomPadding: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Grid Step Gap Spacing (px)</label>
                          <input
                            type="number"
                            min="4"
                            max="40"
                            value={settings.stepGap || '12'}
                            onChange={(e) => {
                              recordSolutionProcessHistory('Update Step Spacing');
                              updateSolutionProcessContent({
                                settings: { ...settings, stepGap: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Max Width Container</label>
                          <select
                            value={settings.containerWidth || 'max-w-7xl'}
                            onChange={(e) => {
                              recordSolutionProcessHistory('Update Container Width');
                              updateSolutionProcessContent({
                                settings: { ...settings, containerWidth: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                          >
                            <option value="max-w-7xl">Fluid Max-W-7xl</option>
                            <option value="max-w-6xl">Medium Max-W-6xl</option>
                            <option value="max-w-5xl">Tight Max-W-5xl</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Dotted Connector Arrow Styles</h3>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.connectorEnabled !== false}
                            onChange={(e) => {
                              recordSolutionProcessHistory('Toggle Connectors');
                              updateSolutionProcessContent({
                                settings: { ...settings, connectorEnabled: e.target.checked }
                              });
                            }}
                            className="rounded border-slate-800 text-emerald-500 bg-slate-950 focus:ring-0 focus:ring-offset-0"
                          />
                          <span className="text-[11px] text-slate-400 font-bold uppercase">Show Connectors</span>
                        </label>
                      </div>

                      {settings.connectorEnabled !== false && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Connector Arrow Color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={settings.connectorColor || '#22c55e'}
                                onChange={(e) => {
                                  recordSolutionProcessHistory('Update Connector Color');
                                  updateSolutionProcessContent({
                                    settings: { ...settings, connectorColor: e.target.value }
                                  });
                                }}
                                className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                              />
                              <input
                                type="text"
                                value={settings.connectorColor || ''}
                                onChange={(e) => {
                                  recordSolutionProcessHistory('Update Connector Color');
                                  updateSolutionProcessContent({
                                    settings: { ...settings, connectorColor: e.target.value }
                                  });
                                }}
                                className="flex-grow bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                                placeholder="#22c55e"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Connector Style Pattern</label>
                            <select
                              value={settings.connectorStyle || 'dotted'}
                              onChange={(e) => {
                                recordSolutionProcessHistory('Update Connector Style Pattern');
                                updateSolutionProcessContent({
                                  settings: { ...settings, connectorStyle: e.target.value }
                                });
                              }}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                            >
                              <option value="dotted">Dotted Pattern</option>
                              <option value="dashed">Dashed Pattern</option>
                              <option value="solid">Solid Line</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Connector Thickness (px)</label>
                            <select
                              value={settings.connectorThickness || '1.5'}
                              onChange={(e) => {
                                recordSolutionProcessHistory('Update Connector Thickness');
                                updateSolutionProcessContent({
                                  settings: { ...settings, connectorThickness: e.target.value }
                                });
                              }}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                            >
                              <option value="1">1.0px (Fine)</option>
                              <option value="1.5">1.5px (Default)</option>
                              <option value="2">2.0px (Medium)</option>
                              <option value="3">3.0px (Bold)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Connector Animation Effect</label>
                            <select
                              value={settings.connectorAnimation || 'none'}
                              onChange={(e) => {
                                recordSolutionProcessHistory('Update Connector Animation');
                                updateSolutionProcessContent({
                                  settings: { ...settings, connectorAnimation: e.target.value }
                                });
                              }}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                            >
                              <option value="none">No Animation</option>
                              <option value="pulse">Soft Pulsing Glow</option>
                              <option value="bounce">Bouncing Movement</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: REVISION HISTORY BACKUPS */}
                {solutionProcessActiveTab === 'history' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Revision Backups</span>
                        </h3>
                        <span className="text-[10px] text-slate-500 font-bold">{solutionProcessHistory.length} checkpoints cached</span>
                      </div>

                      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {solutionProcessHistory.map((hist, hIdx) => {
                          const hSteps = hist.content?.processSteps || [];
                          return (
                            <div key={hIdx} className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-800 transition-all">
                              <div>
                                <span className="block text-xs text-white font-bold">{hist.timestamp}</span>
                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                                  <span>Steps: <strong className="text-slate-300">{hSteps.length}</strong></span>
                                  <span>Bg: <strong className="text-slate-300">{hist.content?.settings?.backgroundColor || '#fff'}</strong></span>
                                  <span>Connectors: <strong className="text-slate-300">{hist.content?.settings?.connectorEnabled !== false ? 'Yes' : 'No'}</strong></span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSolutionProcessRestoreVersion(hist)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-lg text-[10px] font-bold transition-all"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Restore checkpoint</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {solutionProcessHistory.length === 0 && (
                          <div className="text-center py-12 text-slate-500 text-xs italic">
                            No checkpoint backups cached yet. Edits will automatically snapshot here.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* HOME OUR SOLUTIONS SECTION EDITOR */}
          {selectedSectionId === 'home-our-solutions' && ourSolutionsSec && (() => {
            const content = ourSolutionsSec.content || {};
            const sectionHeader = content.sectionHeader || {};
            const cards = content.cards || [];
            const settings = content.settings || {};
            const styles = ourSolutionsSec.styles || {};

            return (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-900 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-emerald-400" />
                      <span>Our Solutions Section Editor</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Configure section headers, edit card names, customize subtitles and chose icons for each solution.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                    <span className="text-[10px] font-semibold text-slate-400">Section Status:</span>
                    <button
                      onClick={() => toggleSectionVisibility('home-our-solutions')}
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        ourSolutionsSec.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ourSolutionsSec.visible ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>

                {/* Sub-tabs inside Our Solutions */}
                <div className="flex items-center gap-2 bg-slate-900/60 p-1 border border-slate-900 rounded-xl select-none">
                  {[
                    { id: 'header', label: '1. Section Heading' },
                    { id: 'cards', label: '2. Solution Cards' },
                    { id: 'settings', label: '3. Section Styling' },
                    { id: 'history', label: '4. Revision Backups' }
                  ].map((tb) => (
                    <button
                      key={tb.id}
                      onClick={() => {
                        setOurSolutionsActiveTab(tb.id as any);
                        setEditingOurSolutionCardId(null);
                      }}
                      className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                        ourSolutionsActiveTab === tb.id
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/15'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {tb.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: HEADER SETUP */}
                {ourSolutionsActiveTab === 'header' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-6">
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <span>Section Header Setup</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Badge Number Prefix</label>
                          <input
                            type="text"
                            value={sectionHeader.badgeNumber || ''}
                            onChange={(e) => {
                              recordOurSolutionsHistory('Update Header Badge Number');
                              updateOurSolutionsContent({
                                sectionHeader: { ...sectionHeader, badgeNumber: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Badge Color Theme</label>
                          <input
                            type="color"
                            value={sectionHeader.badgeColor || '#16A34A'}
                            onChange={(e) => {
                              recordOurSolutionsHistory('Update Header Badge Color');
                              updateOurSolutionsContent({
                                sectionHeader: { ...sectionHeader, badgeColor: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs h-10 text-slate-100 cursor-pointer focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section Heading Title</label>
                          <input
                            type="text"
                            value={sectionHeader.badgeText || ''}
                            onChange={(e) => {
                              recordOurSolutionsHistory('Update Header Title Text');
                              updateOurSolutionsContent({
                                sectionHeader: { ...sectionHeader, badgeText: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CARDS MANAGEMENT */}
                {ourSolutionsActiveTab === 'cards' && (() => {
                  const selectedSolutions = content.selectedSolutions || [];

                  // Filter database solutions based on search/filters
                  const filteredCatalogSolutions = allSolutions.filter((sol) => {
                    const matchesSearch = sol.title.toLowerCase().includes(ourSolutionsSearch.toLowerCase()) ||
                      sol.slug.toLowerCase().includes(ourSolutionsSearch.toLowerCase());
                    const matchesModule = !ourSolutionsModuleFilter || sol.moduleId === ourSolutionsModuleFilter;
                    const matchesIndustry = !ourSolutionsIndustryFilter || sol.industryId === ourSolutionsIndustryFilter;
                    return matchesSearch && matchesModule && matchesIndustry;
                  });

                  return (
                    <div className="space-y-6">
                      {/* Interactive Selection Catalog Panel */}
                      <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                          <div>
                            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                              <Layers className="w-4 h-4" />
                              <span>1. Solutions Catalog</span>
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Select from your existing Solutions database. Only references are stored—data remains perfectly normalized.
                            </p>
                          </div>
                          
                          {selectedSolutions.length === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                recordOurSolutionsHistory('Auto-migrate pre-seeded solutions');
                                const migrated = allSolutions.slice(0, 9).map((sol, idx) => ({
                                  solutionId: sol.id,
                                  homeIcon: sol.sections?.find((s: any) => s.id === 'hero')?.icon || 'Sparkles',
                                  customTitle: '',
                                  subtitle: sol.title.split(' ').slice(1).join(' ') || 'Operational System',
                                  featured: true,
                                  order: idx + 1,
                                  enabled: true
                                }));
                                updateOurSolutionsContent({ selectedSolutions: migrated });
                              }}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[10px] font-black text-emerald-400 uppercase tracking-wider transition-all duration-300 cursor-pointer"
                            >
                              ⚡ Auto-Populate Database References
                            </button>
                          )}
                        </div>

                        {/* Search & Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={ourSolutionsSearch}
                              onChange={(e) => setOurSolutionsSearch(e.target.value)}
                              placeholder="Search Solutions Catalog..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <select
                              value={ourSolutionsModuleFilter}
                              onChange={(e) => setOurSolutionsModuleFilter(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="">All Modules (None)</option>
                              {allModules.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <select
                              value={ourSolutionsIndustryFilter}
                              onChange={(e) => setOurSolutionsIndustryFilter(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="">All Industries (None)</option>
                              {allIndustries.map((ind) => (
                                <option key={ind.id} value={ind.id}>
                                  {ind.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Solutions Catalog List Table */}
                        <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60 max-h-[250px] overflow-y-auto no-scrollbar">
                          <table className="w-full text-left text-[11px] text-slate-300">
                            <thead className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                              <tr>
                                <th className="px-4 py-2.5">Solution</th>
                                <th className="px-4 py-2.5">Parent Module</th>
                                <th className="px-4 py-2.5">Industry</th>
                                <th className="px-4 py-2.5">Status</th>
                                <th className="px-4 py-2.5 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {filteredCatalogSolutions.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-6 text-slate-500 italic">
                                    No Solutions match your search or filters.
                                  </td>
                                </tr>
                              ) : (
                                filteredCatalogSolutions.map((sol) => {
                                  const isSelected = selectedSolutions.some((s: any) => s.solutionId === sol.id);
                                  const matchedMod = allModules.find((m) => m.id === sol.moduleId);
                                  const matchedInd = allIndustries.find((i) => i.id === sol.industryId);

                                  return (
                                    <tr key={sol.id} className="hover:bg-slate-900/30 transition-colors">
                                      <td className="px-4 py-2.5 font-bold text-slate-100 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-slate-400">
                                          {((Icons as any)[sol.sections?.find((s: any) => s.id === 'hero')?.icon || 'Sparkles'] ? 
                                            React.createElement((Icons as any)[sol.sections?.find((s: any) => s.id === 'hero')?.icon || 'Sparkles'], { className: "w-3 h-3" }) : 
                                            <Sparkles className="w-3 h-3" />)}
                                        </div>
                                        <span>{sol.title}</span>
                                      </td>
                                      <td className="px-4 py-2.5 text-slate-400">{matchedMod?.title || 'None'}</td>
                                      <td className="px-4 py-2.5 text-slate-500">{matchedInd?.name || 'All'}</td>
                                      <td className="px-4 py-2.5">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                          sol.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                          {sol.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 text-right">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            recordOurSolutionsHistory(isSelected ? 'Deselect Solution' : 'Select Solution');
                                            let updatedList;
                                            if (isSelected) {
                                              updatedList = selectedSolutions.filter((s: any) => s.solutionId !== sol.id);
                                            } else {
                                              updatedList = [
                                                ...selectedSolutions,
                                                {
                                                  solutionId: sol.id,
                                                  homeIcon: sol.sections?.find((s: any) => s.id === 'hero')?.icon || 'Sparkles',
                                                  customTitle: '',
                                                  subtitle: sol.title.split(' ').slice(1).join(' ') || 'Smart System',
                                                  featured: true,
                                                  order: selectedSolutions.length + 1,
                                                  enabled: true
                                                }
                                              ];
                                            }
                                            // Reindex order
                                            updatedList = updatedList.map((s: any, idx: number) => ({ ...s, order: idx + 1 }));
                                            updateOurSolutionsContent({ selectedSolutions: updatedList });
                                          }}
                                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                                            isSelected ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                                          } transition-all duration-300 cursor-pointer`}
                                        >
                                          {isSelected ? 'Remove' : 'Select & Add'}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Display Selected Homepage Cards & Detail Override Configuration */}
                      <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-4">
                        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                          <Settings2 className="w-4 h-4" />
                          <span>2. Selected Homepage Cards & Ordering</span>
                        </h3>

                        {selectedSolutions.length === 0 ? (
                          <div className="text-center py-10 bg-slate-950 border border-slate-900 rounded-xl text-slate-500 text-xs italic">
                            No Solutions are active or selected for your Homepage "Our Solutions" row. Select some using the Solutions Catalog above.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedSolutions
                              .sort((a: any, b: any) => a.order - b.order)
                              .map((sel: any, idx: number) => {
                                const matchedSol = allSolutions.find(s => s.id === sel.solutionId);
                                const isEditing = editingSelectedSolId === sel.solutionId;
                                const displayTitle = sel.customTitle || matchedSol?.title || 'NX Solution';
                                const displaySubtitle = sel.subtitle || '';

                                return (
                                  <div key={sel.solutionId || idx} className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-4">
                                    {/* Selection Row Header */}
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded-full bg-slate-900 text-[10px] font-bold text-slate-400 flex items-center justify-center">
                                          {idx + 1}
                                        </span>
                                        
                                        {/* Icon preview */}
                                        <div className="w-8 h-8 rounded bg-slate-900/50 flex items-center justify-center text-emerald-400 flex-shrink-0 border border-slate-800">
                                          {sel.homeIcon ? (
                                            typeof sel.homeIcon === 'string' && (sel.homeIcon.startsWith('http') || sel.homeIcon.startsWith('/') || sel.homeIcon.startsWith('data:')) ? (
                                              <img src={sel.homeIcon} alt="custom-icon" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                                            ) : (
                                              (Icons as any)[sel.homeIcon] ? React.createElement((Icons as any)[sel.homeIcon], { className: "w-4 h-4" }) : <Sparkles className="w-4 h-4" />
                                            )
                                          ) : (
                                            <Sparkles className="w-4 h-4" />
                                          )}
                                        </div>

                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white">{displayTitle}</span>
                                            {sel.featured && (
                                              <span className="flex items-center text-[8px] bg-amber-500/10 text-amber-400 font-extrabold uppercase px-1 py-0.2 rounded border border-amber-500/20">
                                                Featured
                                              </span>
                                            )}
                                            {sel.enabled === false && (
                                              <span className="flex items-center text-[8px] bg-slate-800 text-slate-400 font-extrabold uppercase px-1 py-0.2 rounded">
                                                Disabled
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                            <span>Subtitle: {displaySubtitle || <span className="italic text-slate-600">None</span>}</span>
                                            <span>•</span>
                                            <span className="text-slate-500">Slug: {matchedSol?.slug || '#'}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Order Reorder Actions & Settings toggle */}
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                                          <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() => {
                                              recordOurSolutionsHistory('Move solution position up');
                                              const list = [...selectedSolutions];
                                              const temp = list[idx];
                                              list[idx] = list[idx - 1];
                                              list[idx - 1] = temp;
                                              const reindexed = list.map((s, i) => ({ ...s, order: i + 1 }));
                                              updateOurSolutionsContent({ selectedSolutions: reindexed });
                                            }}
                                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                                            title="Move Up"
                                          >
                                            <ArrowUp className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={idx === selectedSolutions.length - 1}
                                            onClick={() => {
                                              recordOurSolutionsHistory('Move solution position down');
                                              const list = [...selectedSolutions];
                                              const temp = list[idx];
                                              list[idx] = list[idx + 1];
                                              list[idx + 1] = temp;
                                              const reindexed = list.map((s, i) => ({ ...s, order: i + 1 }));
                                              updateOurSolutionsContent({ selectedSolutions: reindexed });
                                            }}
                                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                                            title="Move Down"
                                          >
                                            <ArrowDown className="w-3.5 h-3.5" />
                                          </button>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => setEditingSelectedSolId(isEditing ? null : sel.solutionId)}
                                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
                                            isEditing ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-900 text-indigo-400 border-slate-800 hover:bg-slate-800'
                                          } cursor-pointer`}
                                        >
                                          {isEditing ? 'Close' : 'Configure'}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Selection Row Config Expanded panel */}
                                    {isEditing && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-900 animate-fade-in text-left">
                                        
                                        {/* Custom Display Title override */}
                                        <div>
                                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                            Custom Display Title (Optional)
                                          </label>
                                          <input
                                            type="text"
                                            value={sel.customTitle || ''}
                                            onChange={(e) => {
                                              recordOurSolutionsHistory('Change Custom Title Override');
                                              const list = selectedSolutions.map((s: any) => {
                                                if (s.solutionId === sel.solutionId) {
                                                  return { ...s, customTitle: e.target.value };
                                                }
                                                return s;
                                              });
                                              updateOurSolutionsContent({ selectedSolutions: list });
                                            }}
                                            placeholder={`Default: ${matchedSol?.title || 'Solution Name'}`}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                                          />
                                        </div>

                                        {/* Subtitle override */}
                                        <div>
                                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                            Homepage Card Subtitle
                                          </label>
                                          <input
                                            type="text"
                                            value={sel.subtitle || ''}
                                            onChange={(e) => {
                                              recordOurSolutionsHistory('Change Card Subtitle Override');
                                              const list = selectedSolutions.map((s: any) => {
                                                if (s.solutionId === sel.solutionId) {
                                                  return { ...s, subtitle: e.target.value };
                                                }
                                                return s;
                                              });
                                              updateOurSolutionsContent({ selectedSolutions: list });
                                            }}
                                            placeholder="e.g. Smart Security"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                                          />
                                        </div>

                                        {/* Home Page Icon Config */}
                                        <div className="md:col-span-2 bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-3">
                                          <span className="block text-[11px] font-black text-indigo-400 uppercase tracking-widest">
                                            Independent Homepage Icon
                                          </span>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                                Option A: Select Lucide Icon Name
                                              </label>
                                              <input
                                                type="text"
                                                value={typeof sel.homeIcon === 'string' && !sel.homeIcon.startsWith('data:') && !sel.homeIcon.startsWith('http') ? sel.homeIcon : ''}
                                                onChange={(e) => {
                                                  recordOurSolutionsHistory('Change Lucide Icon Name');
                                                  const list = selectedSolutions.map((s: any) => {
                                                    if (s.solutionId === sel.solutionId) {
                                                      return { ...s, homeIcon: e.target.value };
                                                    }
                                                    return s;
                                                  });
                                                  updateOurSolutionsContent({ selectedSolutions: list });
                                                }}
                                                placeholder="e.g. Shield, Lock, Eye, Binoculars, Contact"
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 mb-1"
                                              />
                                              <span className="text-[9px] text-slate-500 italic block">
                                                Type any valid Lucide icon name. Auto-falls back to standard icon if empty.
                                              </span>
                                            </div>

                                            <div>
                                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                                Option B: Upload Custom Icon File (SVG, PNG, WebP)
                                              </label>
                                              <div className="flex items-center gap-3">
                                                <label className="flex-grow flex items-center justify-center gap-2 border border-dashed border-slate-800 rounded-lg px-4 py-2 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer text-xs">
                                                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                                                  <span>Upload Icon File</span>
                                                  <input
                                                    type="file"
                                                    accept="image/svg+xml, image/png, image/webp"
                                                    onChange={(e) => {
                                                      const file = e.target.files?.[0];
                                                      if (!file) return;
                                                      const reader = new FileReader();
                                                      reader.onloadend = () => {
                                                        const base64 = reader.result as string;
                                                        recordOurSolutionsHistory('Upload Custom Icon Image');
                                                        const list = selectedSolutions.map((s: any) => {
                                                          if (s.solutionId === sel.solutionId) {
                                                            return { ...s, homeIcon: base64 };
                                                          }
                                                          return s;
                                                        });
                                                        updateOurSolutionsContent({ selectedSolutions: list });
                                                      };
                                                      reader.readAsDataURL(file);
                                                    }}
                                                    className="hidden"
                                                  />
                                                </label>
                                                
                                                {sel.homeIcon && typeof sel.homeIcon === 'string' && (sel.homeIcon.startsWith('data:') || sel.homeIcon.startsWith('http')) && (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      recordOurSolutionsHistory('Reset Custom Icon Image');
                                                      const list = selectedSolutions.map((s: any) => {
                                                        if (s.solutionId === sel.solutionId) {
                                                          return { ...s, homeIcon: 'Sparkles' };
                                                        }
                                                        return s;
                                                      });
                                                      updateOurSolutionsContent({ selectedSolutions: list });
                                                    }}
                                                    className="p-2 bg-slate-900 border border-slate-800 text-red-400 hover:bg-slate-850 hover:text-red-300 rounded-lg text-[10px] font-bold cursor-pointer"
                                                    title="Reset to default icon"
                                                  >
                                                    Reset
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Status Settings Row */}
                                        <div className="flex items-center gap-6 py-2 bg-slate-950 px-4 rounded-xl border border-slate-900 col-span-1 md:col-span-2">
                                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              checked={sel.featured !== false}
                                              onChange={(e) => {
                                                recordOurSolutionsHistory('Toggle Solution Featured Status');
                                                const list = selectedSolutions.map((s: any) => {
                                                  if (s.solutionId === sel.solutionId) {
                                                    return { ...s, featured: e.target.checked };
                                                  }
                                                  return s;
                                                });
                                                updateOurSolutionsContent({ selectedSolutions: list });
                                              }}
                                              className="w-3.5 h-3.5 accent-indigo-500 rounded border-slate-800"
                                            />
                                            <span>Featured Solution</span>
                                          </label>

                                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              checked={sel.enabled !== false}
                                              onChange={(e) => {
                                                recordOurSolutionsHistory('Toggle Solution Homepage Visibility');
                                                const list = selectedSolutions.map((s: any) => {
                                                  if (s.solutionId === sel.solutionId) {
                                                    return { ...s, enabled: e.target.checked };
                                                  }
                                                  return s;
                                                });
                                                updateOurSolutionsContent({ selectedSolutions: list });
                                              }}
                                              className="w-3.5 h-3.5 accent-indigo-500 rounded border-slate-800"
                                            />
                                            <span>Visible on Homepage Row</span>
                                          </label>
                                        </div>

                                        {/* Deselect / Remove action */}
                                        <div className="flex justify-end items-center col-span-1 md:col-span-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              recordOurSolutionsHistory('Remove Solution Reference');
                                              const filtered = selectedSolutions.filter((s: any) => s.solutionId !== sel.solutionId);
                                              const reindexed = filtered.map((s, i) => ({ ...s, order: i + 1 }));
                                              updateOurSolutionsContent({ selectedSolutions: reindexed });
                                              setEditingSelectedSolId(null);
                                            }}
                                            className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[10px] font-black uppercase text-red-400 tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Remove Solution Card</span>
                                          </button>
                                        </div>

                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* TAB 3: STYLING & GENERAL SETTINGS */}
                {ourSolutionsActiveTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-6">
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                        Visual Formatting & Spacers
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section Background Color</label>
                          <input
                            type="color"
                            value={styles.backgroundColor || '#ffffff'}
                            onChange={(e) => {
                              recordOurSolutionsHistory('Update Section Background Color');
                              updateOurSolutionsStyles({ backgroundColor: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 h-11 text-slate-100 cursor-pointer focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Header Alignment</label>
                          <select
                            value={styles.alignment || 'left'}
                            onChange={(e) => {
                              recordOurSolutionsHistory('Update Section Alignment');
                              updateOurSolutionsStyles({ alignment: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="left">Left Aligned</option>
                            <option value="center">Centered</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Padding Top (px)</label>
                          <input
                            type="text"
                            value={styles.paddingTop || '60px'}
                            onChange={(e) => {
                              recordOurSolutionsHistory('Update Padding Top');
                              updateOurSolutionsStyles({ paddingTop: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Padding Bottom (px)</label>
                          <input
                            type="text"
                            value={styles.paddingBottom || '60px'}
                            onChange={(e) => {
                              recordOurSolutionsHistory('Update Padding Bottom');
                              updateOurSolutionsStyles({ paddingBottom: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: REVISION BACKUPS */}
                {ourSolutionsActiveTab === 'history' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6">
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1.5">
                        Revision History Checkpoints
                      </h3>
                      <p className="text-[11px] text-slate-400 mb-6">Whenever you change text fields, names, icons, or layouts, a recovery state checkpoint is cached below. Restore any version instantly.</p>

                      <div className="space-y-3.5">
                        {ourSolutionsHistory.map((hist, idx) => {
                          const hCards = hist.content?.cards || [];

                          return (
                            <div key={idx} className="bg-slate-950 border border-slate-900/80 rounded-xl p-4 flex items-center justify-between gap-4">
                              <div>
                                <span className="block text-xs text-white font-bold">{hist.timestamp}</span>
                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                                  <span>Cards: <strong className="text-slate-300">{hCards.length}</strong></span>
                                  <span>Bg: <strong className="text-slate-300">{hist.styles?.backgroundColor || '#fff'}</strong></span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOurSolutionsRestoreVersion(hist)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-lg text-[10px] font-bold transition-all"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Restore checkpoint</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {ourSolutionsHistory.length === 0 && (
                          <div className="text-center py-12 text-slate-500 text-xs italic">
                            No checkpoint backups cached yet. Edits will automatically snapshot here.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* HOME OUR CURRENT WORK SECTION EDITOR */}
          {selectedSectionId === 'home-our-current-work' && (() => {
            const ourCurrentWorkSec = sections.find(s => s.id === 'home-our-current-work');
            if (!ourCurrentWorkSec) return null;
            const content = ourCurrentWorkSec.content || {};
            const sectionHeader = content.sectionHeader || {};
            const cards = content.cards || [];
            const styles = ourCurrentWorkSec.styles || {};

            return (
              <div className="space-y-6 animate-fade-in">
                {/* Header info */}
                <div className="border-b border-slate-900 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Our Current Work Section CMS</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Configure real project cards, locations, image links, and status badges.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                    <span className="text-[10px] font-semibold text-slate-400">Section Active:</span>
                    <button
                      onClick={() => toggleSectionVisibility('home-our-current-work')}
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        ourCurrentWorkSec.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ourCurrentWorkSec.visible ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>

                {/* Sub Tab selection */}
                <div className="flex items-center gap-1.5 border-b border-slate-900 pb-px">
                  {[
                    { id: 'header', label: '1. Section Header' },
                    { id: 'cards', label: '2. Project Cards' },
                    { id: 'settings', label: '3. Alignment & Styles' }
                  ].map(tb => {
                    const isActive = ourCurrentWorkActiveTab === tb.id;
                    return (
                      <button
                        key={tb.id}
                        onClick={() => setOurCurrentWorkActiveTab(tb.id as any)}
                        className={`text-[10px] font-bold tracking-wider uppercase px-4 py-2.5 transition-all ${
                          isActive 
                            ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-900/30' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {tb.label}
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: SECTION HEADER CONFIG */}
                {ourCurrentWorkActiveTab === 'header' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-6">
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                        Header Labels & Branding
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section Number Badge</label>
                          <input
                            type="text"
                            value={sectionHeader.badgeNumber || '07'}
                            onChange={(e) => {
                              updateOurCurrentWorkContent({
                                sectionHeader: { ...sectionHeader, badgeNumber: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Badge Color Accent</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={sectionHeader.badgeColor || '#16A34A'}
                              onChange={(e) => {
                                updateOurCurrentWorkContent({
                                  sectionHeader: { ...sectionHeader, badgeColor: e.target.value }
                                });
                              }}
                              className="w-12 h-11 bg-slate-950 border border-slate-800 rounded-xl p-1 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={sectionHeader.badgeColor || '#16A34A'}
                              onChange={(e) => {
                                updateOurCurrentWorkContent({
                                  sectionHeader: { ...sectionHeader, badgeColor: e.target.value }
                                });
                              }}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Heading Title Text</label>
                          <input
                            type="text"
                            value={sectionHeader.badgeText || ''}
                            onChange={(e) => {
                              updateOurCurrentWorkContent({
                                sectionHeader: { ...sectionHeader, badgeText: e.target.value }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Footer Explore Button Text</label>
                          <input
                            type="text"
                            value={content.exploreText || ''}
                            onChange={(e) => {
                              updateOurCurrentWorkContent({ exploreText: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Explore Link Destination Url</label>
                          <input
                            type="text"
                            value={content.exploreUrl || ''}
                            onChange={(e) => {
                              updateOurCurrentWorkContent({ exploreUrl: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PROJECTS SELECTOR (CONNECTED TO PROJECT DATABASE) */}
                {ourCurrentWorkActiveTab === 'cards' && (() => {
                  const selectedProjects = content.selectedProjects || [];

                  // Filter database projects based on search/filters
                  const filteredCatalogProjects = allCaseStudies.filter((cs) => {
                    const matchesSearch = (cs.title || '').toLowerCase().includes(ourCurrentWorkSearch.toLowerCase()) ||
                      (cs.slug || '').toLowerCase().includes(ourCurrentWorkSearch.toLowerCase()) ||
                      (cs.clientName || '').toLowerCase().includes(ourCurrentWorkSearch.toLowerCase());
                    const matchesIndustry = !ourCurrentWorkIndustryFilter || cs.industry === ourCurrentWorkIndustryFilter;
                    return matchesSearch && matchesIndustry;
                  });

                  return (
                    <div className="space-y-6">
                      {/* Database Connection Notice & Auto Populate */}
                      <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                          <div>
                            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                              <Layers className="w-4 h-4" />
                              <span>1. Projects Catalog (Live Database)</span>
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Connected directly to the Projects Module. Select projects to feature on the Home Page without duplicating database entries.
                            </p>
                          </div>

                          {selectedProjects.length === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const migrated = allCaseStudies.map((cs, idx) => ({
                                  projectId: cs.id,
                                  homeImage: cs.image || '',
                                  customTitle: '',
                                  subtitle: cs.clientName || cs.industry || '',
                                  statusText: idx % 6 === 0 ? 'Active Project' : idx % 6 === 1 ? 'Under Development' : idx % 6 === 2 ? 'Active Research' : idx % 6 === 3 ? 'Design Phase' : idx % 6 === 4 ? 'Prototype' : 'Planning',
                                  statusColor: idx % 6 === 0 ? '#16A34A' : idx % 6 === 1 ? '#1D4ED8' : idx % 6 === 2 ? '#EA580C' : idx % 6 === 3 ? '#7C3AED' : idx % 6 === 4 ? '#1E3A8A' : '#0D9488',
                                  featured: true,
                                  enabled: true,
                                  order: idx + 1
                                }));
                                updateOurCurrentWorkContent({ selectedProjects: migrated });
                              }}
                              className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[10px] font-black text-emerald-400 uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-2"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>⚡ Auto-Populate Database References</span>
                            </button>
                          )}
                        </div>

                        {/* Search & Industry Filter */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={ourCurrentWorkSearch}
                              onChange={(e) => setOurCurrentWorkSearch(e.target.value)}
                              placeholder="Search Projects Catalog by title, client, or slug..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <select
                              value={ourCurrentWorkIndustryFilter}
                              onChange={(e) => setOurCurrentWorkIndustryFilter(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            >
                              <option value="">All Industries (Show All)</option>
                              {allIndustries.map((ind) => (
                                <option key={ind.id} value={ind.name || ind.id}>
                                  {ind.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Database Projects Catalog Table */}
                        <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60 max-h-[220px] overflow-y-auto no-scrollbar">
                          <table className="w-full text-left text-[11px] text-slate-300">
                            <thead className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                              <tr>
                                <th className="px-4 py-2.5">Project Title</th>
                                <th className="px-4 py-2.5">Client / Subtitle</th>
                                <th className="px-4 py-2.5">Industry</th>
                                <th className="px-4 py-2.5">Status</th>
                                <th className="px-4 py-2.5 text-right">Selection</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {filteredCatalogProjects.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-6 text-slate-500 italic">
                                    No Projects match your search or filters.
                                  </td>
                                </tr>
                              ) : (
                                filteredCatalogProjects.map((cs) => {
                                  const isSelected = selectedProjects.some((sp: any) => sp.projectId === cs.id);
                                  return (
                                    <tr key={cs.id} className="hover:bg-slate-900/30 transition-colors">
                                      <td className="px-4 py-2.5 font-bold text-slate-100 flex items-center gap-2.5">
                                        {cs.image ? (
                                          <img src={cs.image} alt="" className="w-6 h-6 object-cover rounded border border-slate-800" referrerPolicy="no-referrer" />
                                        ) : (
                                          <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-slate-500">
                                            <ImageIcon className="w-3 h-3" />
                                          </div>
                                        )}
                                        <span className="truncate max-w-[180px]">{cs.title}</span>
                                      </td>
                                      <td className="px-4 py-2.5 text-slate-400 truncate max-w-[140px]">{cs.clientName || 'N/A'}</td>
                                      <td className="px-4 py-2.5 text-slate-500">{cs.industry || cs.category || 'General'}</td>
                                      <td className="px-4 py-2.5">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                          cs.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                          {cs.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 text-right">
                                        <button
                                          type="button"
                                          onClick={() => toggleOurCurrentWorkProjectSelection(cs)}
                                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                            isSelected 
                                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-500/40' 
                                              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-emerald-500 hover:text-white'
                                          }`}
                                        >
                                          {isSelected ? '✓ Selected' : '+ Select'}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Selected Projects Manager & Custom Overrides */}
                      <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                          <div>
                            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                              2. Selected Home Page Projects ({selectedProjects.length})
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">Reorder, enable/disable, or customize Home Page specific overrides per project.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                          {/* Left: Reorderable List */}
                          <div className="lg:col-span-5 bg-slate-950/60 border border-slate-900 rounded-xl p-3 space-y-2 max-h-[420px] overflow-y-auto no-scrollbar">
                            {selectedProjects.length === 0 ? (
                              <div className="text-center py-10 text-slate-500 text-xs italic">
                                No projects selected yet. Choose projects from the catalog above.
                              </div>
                            ) : (
                              selectedProjects
                                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                                .map((sp: any, idx: number) => {
                                  const matchedCs = allCaseStudies.find(c => c.id === sp.projectId);
                                  const isEditing = editingOurCurrentWorkCardId === sp.projectId;
                                  const displayTitle = sp.customTitle || matchedCs?.title || 'Untitled Project';
                                  const displayImage = sp.homeImage || matchedCs?.image || '';

                                  return (
                                    <div
                                      key={sp.projectId}
                                      onClick={() => setEditingOurCurrentWorkCardId(sp.projectId)}
                                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                        isEditing 
                                          ? 'bg-emerald-950/20 border-emerald-500/40 text-white shadow-md' 
                                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        {displayImage ? (
                                          <img src={displayImage} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-800 flex-shrink-0" referrerPolicy="no-referrer" />
                                        ) : (
                                          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 flex-shrink-0">
                                            <ImageIcon className="w-4 h-4" />
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-black bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">{idx + 1}</span>
                                            <span className="text-xs font-bold truncate block">{displayTitle}</span>
                                          </div>
                                          <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                                            {sp.subtitle || matchedCs?.clientName || 'Home Page Card'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Order & Remove Action Buttons */}
                                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          type="button"
                                          onClick={() => moveOurCurrentWorkProjectOrder(idx, 'up')}
                                          disabled={idx === 0}
                                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                                          title="Move Up"
                                        >
                                          <ArrowUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => moveOurCurrentWorkProjectOrder(idx, 'down')}
                                          disabled={idx === selectedProjects.length - 1}
                                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                                          title="Move Down"
                                        >
                                          <ArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (matchedCs) toggleOurCurrentWorkProjectSelection(matchedCs);
                                            else {
                                              updateOurCurrentWorkContent({
                                                selectedProjects: selectedProjects.filter((p: any) => p.projectId !== sp.projectId)
                                              });
                                            }
                                          }}
                                          className="p-1 hover:bg-rose-900/50 text-slate-500 hover:text-rose-400 rounded"
                                          title="Remove from Home Page"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                            )}
                          </div>

                          {/* Right: Selected Project Custom Overrides Editor */}
                          <div className="lg:col-span-7 bg-slate-950/80 border border-slate-900 rounded-2xl p-5 space-y-4">
                            {(() => {
                              const activeProj = selectedProjects.find((p: any) => p.projectId === editingOurCurrentWorkCardId) || selectedProjects[0];
                              if (!activeProj) {
                                return (
                                  <div className="text-center py-16 text-slate-500 text-xs italic">
                                    Select a project on the left to edit its Home Page specific overrides.
                                  </div>
                                );
                              }

                              const matchedCs = allCaseStudies.find(c => c.id === activeProj.projectId);

                              return (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                                        #{activeProj.order || 1}
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-bold text-white">
                                          {matchedCs?.title || activeProj.customTitle || 'Project Overrides'}
                                        </h4>
                                        <p className="text-[10px] text-slate-500">
                                          Database ID: {activeProj.projectId} • {matchedCs?.category || 'Project'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-slate-400 font-semibold">Home Display:</span>
                                      <button
                                        type="button"
                                        onClick={() => updateOurCurrentWorkSelectedProject(activeProj.projectId, { enabled: activeProj.enabled === false ? true : false })}
                                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                          activeProj.enabled !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                                        }`}
                                      >
                                        {activeProj.enabled !== false ? 'Active' : 'Hidden'}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Home Page Specific Image Upload & URL */}
                                  <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-slate-400">
                                      Home Page Cover Image (Custom Override)
                                    </label>
                                    <ImageUploader
                                      value={activeProj.homeImage || matchedCs?.image || ''}
                                      onChange={(url) => updateOurCurrentWorkSelectedProject(activeProj.projectId, { homeImage: url })}
                                    />
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                                      <span>Original database cover: {matchedCs?.image ? 'Available' : 'None'}</span>
                                      {matchedCs?.image && (
                                        <button
                                          type="button"
                                          onClick={() => updateOurCurrentWorkSelectedProject(activeProj.projectId, { homeImage: matchedCs.image })}
                                          className="text-emerald-400 hover:underline font-bold"
                                        >
                                          Reset to Original Cover
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                    <div>
                                      <label className="block text-xs font-semibold text-slate-400 mb-1">Custom Title Override</label>
                                      <input
                                        type="text"
                                        value={activeProj.customTitle || ''}
                                        onChange={(e) => updateOurCurrentWorkSelectedProject(activeProj.projectId, { customTitle: e.target.value })}
                                        placeholder={matchedCs?.title || 'Project Title'}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-semibold text-slate-400 mb-1">Location / Subtitle Override</label>
                                      <input
                                        type="text"
                                        value={activeProj.subtitle || ''}
                                        onChange={(e) => updateOurCurrentWorkSelectedProject(activeProj.projectId, { subtitle: e.target.value })}
                                        placeholder={matchedCs?.clientName || 'Indore, MP'}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                      />
                                    </div>
                                  </div>

                                  {/* Status Badge Text & Preset Buttons */}
                                  <div className="space-y-2 pt-1">
                                    <label className="block text-xs font-semibold text-slate-400">Status Badge Text</label>
                                    <input
                                      type="text"
                                      value={activeProj.statusText || ''}
                                      onChange={(e) => updateOurCurrentWorkSelectedProject(activeProj.projectId, { statusText: e.target.value })}
                                      placeholder="Active Project"
                                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                                    />
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {[
                                        { text: 'Active Project', color: '#16A34A' },
                                        { text: 'Under Development', color: '#1D4ED8' },
                                        { text: 'Active Research', color: '#EA580C' },
                                        { text: 'Design Phase', color: '#7C3AED' },
                                        { text: 'Prototype', color: '#1E3A8A' },
                                        { text: 'Planning', color: '#0D9488' }
                                      ].map((preset) => (
                                        <button
                                          key={preset.text}
                                          type="button"
                                          onClick={() => updateOurCurrentWorkSelectedProject(activeProj.projectId, { statusText: preset.text, statusColor: preset.color })}
                                          className="px-2 py-0.5 rounded text-[9px] font-bold text-white transition-all hover:opacity-90 cursor-pointer"
                                          style={{ backgroundColor: preset.color }}
                                        >
                                          + {preset.text}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Status Badge Color Accent */}
                                  <div className="pt-1">
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Status Badge Color Accent</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="color"
                                        value={activeProj.statusColor || '#16A34A'}
                                        onChange={(e) => updateOurCurrentWorkSelectedProject(activeProj.projectId, { statusColor: e.target.value })}
                                        className="w-10 h-9 bg-slate-950 border border-slate-800 rounded-lg p-0.5 cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={activeProj.statusColor || '#16A34A'}
                                        onChange={(e) => updateOurCurrentWorkSelectedProject(activeProj.projectId, { statusColor: e.target.value })}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* TAB 3: STYLING & GENERAL SETTINGS */}
                {ourCurrentWorkActiveTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-6">
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                        Visual Formatting & Spacers
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section Background Color</label>
                          <input
                            type="color"
                            value={styles.backgroundColor || '#ffffff'}
                            onChange={(e) => {
                              updateOurCurrentWorkStyles({ backgroundColor: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 h-11 text-slate-100 cursor-pointer focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Header Alignment</label>
                          <select
                            value={styles.alignment || 'left'}
                            onChange={(e) => {
                              updateOurCurrentWorkStyles({ alignment: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="left">Left Aligned</option>
                            <option value="center">Centered</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Padding Top (px)</label>
                          <input
                            type="text"
                            value={styles.paddingTop || '60px'}
                            onChange={(e) => {
                              updateOurCurrentWorkStyles({ paddingTop: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Padding Bottom (px)</label>
                          <input
                            type="text"
                            value={styles.paddingBottom || '60px'}
                            onChange={(e) => {
                              updateOurCurrentWorkStyles({ paddingBottom: e.target.value });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* CLIENTS TRUST US EDITOR */}
          {selectedSectionId === 'home-clients-trust-us' && (() => {
            const sec = sections.find(s => s.id === 'home-clients-trust-us');
            if (!sec) return null;

            const content = sec.content || {};
            const styles = sec.styles || {};
            const sectionHeader = content.sectionHeader || {
              badgeNumber: "09",
              badgeText: "CLIENTS TRUST US",
              badgeColor: "#16A34A",
              headingColor: "#1e293b"
            };
            const selectedRefs: HomeTestimonialSelectedRef[] = content.selectedTestimonials || [];
            const carouselSettings = content.carouselSettings || {
              autoPlay: true,
              speedMs: 5000,
              showDots: true,
              showArrows: true,
              loop: true
            };

            // Filter Centralized Testimonials Catalog
            const filteredCatalogTestimonials = allTestimonials.filter(t => {
              const matchesSearch = !clientsTrustUsSearch || 
                (t.clientName || '').toLowerCase().includes(clientsTrustUsSearch.toLowerCase()) ||
                (t.author || '').toLowerCase().includes(clientsTrustUsSearch.toLowerCase()) ||
                (t.organization || '').toLowerCase().includes(clientsTrustUsSearch.toLowerCase()) ||
                (t.testimonial || '').toLowerCase().includes(clientsTrustUsSearch.toLowerCase());
              const matchesIndustry = !clientsTrustUsIndustryFilter || t.industry === clientsTrustUsIndustryFilter;
              return matchesSearch && matchesIndustry;
            });

            return (
              <div className="space-y-6 animate-fade-in">
                {/* Header Bar */}
                <div className="border-b border-slate-900 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <MessageSquareQuote className="w-5 h-5 text-emerald-400" />
                      <span>Clients Trust Us Section Editor</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure selected testimonials, section badge, carousel options, and layout styling.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400">Section Visibility:</span>
                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility('home-clients-trust-us')}
                      className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded transition-all ${
                        sec.visible ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {sec.visible ? '✓ Visible' : 'Hidden'}
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs Bar */}
                <div className="flex border-b border-slate-800 gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: 'header', label: '1. Section Header', icon: Layers },
                    { id: 'testimonials', label: `2. Selected Testimonials (${selectedRefs.length})`, icon: MessageSquareQuote },
                    { id: 'carousel', label: '3. Carousel Options', icon: Settings2 },
                    { id: 'settings', label: '4. Styling & Padding', icon: Sparkles }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = clientsTrustUsActiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setClientsTrustUsActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                          isActive
                            ? 'bg-slate-900 text-emerald-400 border-emerald-500 shadow-xs'
                            : 'bg-slate-950/40 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: SECTION HEADER */}
                {clientsTrustUsActiveTab === 'header' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-4">
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                        Header Badge & Title Formatting
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Badge Number</label>
                          <input
                            type="text"
                            value={sectionHeader.badgeNumber || '09'}
                            onChange={(e) => updateClientsTrustUsContent({
                              sectionHeader: { ...sectionHeader, badgeNumber: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                            placeholder="09"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Badge Text / Heading</label>
                          <input
                            type="text"
                            value={sectionHeader.badgeText || 'CLIENTS TRUST US'}
                            onChange={(e) => updateClientsTrustUsContent({
                              sectionHeader: { ...sectionHeader, badgeText: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                            placeholder="CLIENTS TRUST US"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Badge Background Accent</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={sectionHeader.badgeColor || '#16A34A'}
                              onChange={(e) => updateClientsTrustUsContent({
                                sectionHeader: { ...sectionHeader, badgeColor: e.target.value }
                              })}
                              className="w-10 h-9 bg-slate-950 border border-slate-800 rounded-lg p-0.5 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={sectionHeader.badgeColor || '#16A34A'}
                              onChange={(e) => updateClientsTrustUsContent({
                                sectionHeader: { ...sectionHeader, badgeColor: e.target.value }
                              })}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Heading Text Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={sectionHeader.headingColor || '#1e293b'}
                              onChange={(e) => updateClientsTrustUsContent({
                                sectionHeader: { ...sectionHeader, headingColor: e.target.value }
                              })}
                              className="w-10 h-9 bg-slate-950 border border-slate-800 rounded-lg p-0.5 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={sectionHeader.headingColor || '#1e293b'}
                              onChange={(e) => updateClientsTrustUsContent({
                                sectionHeader: { ...sectionHeader, headingColor: e.target.value }
                              })}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SELECTED TESTIMONIALS */}
                {clientsTrustUsActiveTab === 'testimonials' && (
                  <div className="space-y-6">
                    {/* Centralized Integration Banner */}
                    <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <MessageSquareQuote className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-emerald-200">Centralized Testimonials Integration</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Testimonials are managed in the Centralized Testimonials Module. Select testimonials here to display on the Home Page without data duplication.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Catalog Picker */}
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                        <div>
                          <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                            1. Select Testimonials from Central Catalog
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">Search and select items from your master Testimonials Module.</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                          {allTestimonials.length} Available in Catalog
                        </span>
                      </div>

                      {/* Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            value={clientsTrustUsSearch}
                            onChange={(e) => setClientsTrustUsSearch(e.target.value)}
                            placeholder="Search by quote, author, or organization..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <select
                            value={clientsTrustUsIndustryFilter}
                            onChange={(e) => setClientsTrustUsIndustryFilter(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">All Industries (Show All)</option>
                            {allIndustries.map((ind) => (
                              <option key={ind.id} value={ind.name || ind.id}>
                                {ind.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Catalog Table */}
                      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60 max-h-[220px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left text-[11px] text-slate-300">
                          <thead className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                            <tr>
                              <th className="px-4 py-2.5">Author & Organization</th>
                              <th className="px-4 py-2.5">Testimonial Quote</th>
                              <th className="px-4 py-2.5">Rating</th>
                              <th className="px-4 py-2.5 text-right">Selection</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {filteredCatalogTestimonials.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="text-center py-6 text-slate-500 italic">
                                  No testimonials match your filter criteria or catalog is empty.
                                </td>
                              </tr>
                            ) : (
                              filteredCatalogTestimonials.map((t) => {
                                const isSelected = selectedRefs.some(r => r.testimonialId === t.id);
                                return (
                                  <tr key={t.id} className="hover:bg-slate-900/30 transition-colors">
                                    <td className="px-4 py-2.5 font-bold text-slate-100">
                                      <div>{t.author || t.clientName || 'Anonymous'}</div>
                                      <div className="text-[10px] text-slate-500 font-normal">{t.organization || t.designation || ''}</div>
                                    </td>
                                    <td className="px-4 py-2.5 text-slate-400 truncate max-w-[240px]">
                                      "{t.testimonial}"
                                    </td>
                                    <td className="px-4 py-2.5 text-amber-400">
                                      {'★'.repeat(t.rating || 5)}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                      <button
                                        type="button"
                                        onClick={() => toggleClientsTrustUsTestimonialSelection(t.id)}
                                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                          isSelected
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-500/40'
                                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-emerald-500 hover:text-white'
                                        }`}
                                      >
                                        {isSelected ? '✓ Selected' : '+ Select'}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Selected List Manager */}
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                        <div>
                          <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                            2. Home Page Display Order ({selectedRefs.length})
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">Reorder, enable/disable, or toggle featured status for selected testimonials.</p>
                        </div>
                      </div>

                      {selectedRefs.length === 0 ? (
                        <div className="text-center py-8 bg-slate-950/60 border border-slate-900 rounded-xl text-slate-500 text-xs italic">
                          No testimonials selected for Home Page display yet. Select testimonials above.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedRefs
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((refItem, idx) => {
                              const matchedTesti = allTestimonials.find(t => t.id === refItem.testimonialId);
                              return (
                                <div
                                  key={refItem.testimonialId}
                                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                    refItem.enabled !== false
                                      ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                                      : 'bg-slate-950/30 border-slate-900 opacity-60 text-slate-500'
                                  }`}
                                >
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs flex-shrink-0 mt-0.5">
                                      #{idx + 1}
                                    </div>
                                    <div className="space-y-0.5 min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-white truncate">
                                          {matchedTesti ? (matchedTesti.author || matchedTesti.clientName) : refItem.testimonialId}
                                        </span>
                                        {matchedTesti?.organization && (
                                          <span className="text-[10px] text-slate-400 truncate">• {matchedTesti.organization}</span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-400 truncate">
                                        "{matchedTesti ? matchedTesti.testimonial : 'Quote reference loaded from central module'}"
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                                    {/* Reorder Buttons */}
                                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => moveClientsTrustUsTestimonialOrder(idx, 'up')}
                                        className="p-1 hover:text-emerald-400 text-slate-400 disabled:opacity-30"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={idx === selectedRefs.length - 1}
                                        onClick={() => moveClientsTrustUsTestimonialOrder(idx, 'down')}
                                        className="p-1 hover:text-emerald-400 text-slate-400 disabled:opacity-30"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Featured Toggle */}
                                    <button
                                      type="button"
                                      onClick={() => updateClientsTrustUsSelectedTestimonial(refItem.testimonialId, { featured: !refItem.featured })}
                                      className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                                        refItem.featured ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-slate-500 border border-slate-800'
                                      }`}
                                    >
                                      <Star className="w-3 h-3 fill-current" />
                                      <span>{refItem.featured ? 'Featured' : 'Standard'}</span>
                                    </button>

                                    {/* Active / Hidden Toggle */}
                                    <button
                                      type="button"
                                      onClick={() => updateClientsTrustUsSelectedTestimonial(refItem.testimonialId, { enabled: refItem.enabled === false ? true : false })}
                                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                        refItem.enabled !== false ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-500 border border-slate-800'
                                      }`}
                                    >
                                      {refItem.enabled !== false ? 'Active' : 'Hidden'}
                                    </button>

                                    {/* Remove button */}
                                    <button
                                      type="button"
                                      onClick={() => toggleClientsTrustUsTestimonialSelection(refItem.testimonialId)}
                                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                                      title="Remove from Home Page"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: CAROUSEL OPTIONS */}
                {clientsTrustUsActiveTab === 'carousel' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-4">
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                        Carousel & Slide Settings
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Auto-Play Status</label>
                          <select
                            value={carouselSettings.autoPlay ? 'true' : 'false'}
                            onChange={(e) => updateClientsTrustUsContent({
                              carouselSettings: { ...carouselSettings, autoPlay: e.target.value === 'true' }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="true">Enabled (Auto-Rotate)</option>
                            <option value="false">Disabled (Manual Only)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Slide Speed (ms)</label>
                          <input
                            type="number"
                            value={carouselSettings.speedMs || 5000}
                            onChange={(e) => updateClientsTrustUsContent({
                              carouselSettings: { ...carouselSettings, speedMs: parseInt(e.target.value) || 5000 }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                            placeholder="5000"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Pagination Dots</label>
                          <select
                            value={carouselSettings.showDots ? 'true' : 'false'}
                            onChange={(e) => updateClientsTrustUsContent({
                              carouselSettings: { ...carouselSettings, showDots: e.target.value === 'true' }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="true">Show Pagination Dots</option>
                            <option value="false">Hide Pagination Dots</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Looping</label>
                          <select
                            value={carouselSettings.loop ? 'true' : 'false'}
                            onChange={(e) => updateClientsTrustUsContent({
                              carouselSettings: { ...carouselSettings, loop: e.target.value === 'true' }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="true">Infinite Loop</option>
                            <option value="false">Stop at End</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: STYLING & SETTINGS */}
                {clientsTrustUsActiveTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 space-y-4">
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                        Visual Formatting & Container Spacers
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Section Background Color</label>
                          <input
                            type="color"
                            value={styles.backgroundColor || '#ffffff'}
                            onChange={(e) => updateClientsTrustUsStyles({ backgroundColor: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 h-11 text-slate-100 cursor-pointer focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Header Alignment</label>
                          <select
                            value={styles.alignment || 'left'}
                            onChange={(e) => updateClientsTrustUsStyles({ alignment: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="left">Left Aligned</option>
                            <option value="center">Centered</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Padding Top (px)</label>
                          <input
                            type="text"
                            value={styles.paddingTop || '40px'}
                            onChange={(e) => updateClientsTrustUsStyles({ paddingTop: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                            placeholder="40px"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Padding Bottom (px)</label>
                          <input
                            type="text"
                            value={styles.paddingBottom || '60px'}
                            onChange={(e) => updateClientsTrustUsStyles({ paddingBottom: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                            placeholder="60px"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* BOTTOM CTA EDITOR */}
          {selectedSectionId === 'home-cta' && ctaSec && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Dynamic Footer CTA Editor</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Configure action heading, description, and redirection values for the bottom banner.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                  <span className="text-[10px] font-semibold text-slate-400">Render:</span>
                  <button
                    onClick={() => toggleSectionVisibility('home-cta')}
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      ctaSec.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ctaSec.visible ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">CTA Section Title / Banner Heading</label>
                  <input
                    type="text"
                    value={ctaSec.content.title || ''}
                    onChange={(e) => updateCtaContent({ title: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    placeholder="Ready to Secure Your Premises?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">CTA Section Subheading / Description</label>
                  <textarea
                    rows={3}
                    value={ctaSec.content.subtitle || ''}
                    onChange={(e) => updateCtaContent({ subtitle: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    placeholder="Connect with a systems architect to engineer pricing coordinates."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Action Button Label</label>
                    <input
                      type="text"
                      value={ctaSec.content.ctaText || ''}
                      onChange={(e) => updateCtaContent({ ctaText: e.target.value })}
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      placeholder="Get in Touch"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Action Button Redirect URL</label>
                    <input
                      type="text"
                      value={ctaSec.content.ctaUrl || ''}
                      onChange={(e) => updateCtaContent({ ctaUrl: e.target.value })}
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      placeholder="/contact"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        itemName={deleteModal.itemName}
        message={`Are you sure you want to delete "${deleteModal.itemName}"?`}
        isDeleting={false}
        onConfirm={() => {
          if (deleteModal.onConfirmAction) {
            deleteModal.onConfirmAction();
          }
          setDeleteModal({ isOpen: false, title: 'Confirm Delete', itemName: '', onConfirmAction: null });
        }}
        onCancel={() => setDeleteModal({ isOpen: false, title: 'Confirm Delete', itemName: '', onConfirmAction: null })}
      />
    </div>
  );
}

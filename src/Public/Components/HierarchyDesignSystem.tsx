import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../Shared/Header/Header';
import Footer from '../Shared/Footer/Footer';
import { ThemeSettings, HeaderSettings, FooterSettings } from '../../types';

// Design Tokens for reference
export const DESIGN_TOKENS = {
  colors: {
    bgPage: '#fbf9f8',
    textNavy: '#00244a',
    textSlate: '#64748b',
    primaryBlue: '#0059bb',
    hoverBlue: '#00244a',
    primaryRed: '#ef4444',
    hoverRed: '#dc2626',
    borderLight: 'border-slate-200/80',
    cardTitle: '#00244a'
  },
  typography: {
    heroTitleSize: '48px',
    heroSubtitleSize: '18px',
    cardTitleSize: '16px',
    cardDescSize: '12px'
  },
  dimensions: {
    cardWidth: '270px',
    cardHeight: '199px',
    imageSize: '48px',
    containerMax: 'max-w-7xl'
  }
};

// Dynamic icon resolver
export const renderIcon = (iconName: string, className = 'w-6 h-6', style?: React.CSSProperties) => {
  const IconComp = (Icons as any)[iconName] || Icons.Cpu;
  return <IconComp className={className} style={style} />;
};

// 1. Standard Button
interface StandardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isRedTheme?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function StandardButton({ isRedTheme, children, className = '', ...props }: StandardButtonProps) {
  const baseClass = "inline-flex items-center justify-center px-5 py-2.5 font-semibold text-xs rounded-lg transition-colors cursor-pointer text-white shadow-sm";
  const themeClass = isRedTheme
    ? "bg-red-600 hover:bg-red-700"
    : "bg-[#0059bb] hover:bg-[#00244a]";
  return (
    <button className={`${baseClass} ${themeClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

// 2. Empty State Component
interface EmptyStateProps {
  iconName: string;
  title: string;
  description: string;
  isRedTheme?: boolean;
}

export function EmptyState({ iconName, title, description, isRedTheme }: EmptyStateProps) {
  const iconColorClass = isRedTheme ? "text-red-500" : "text-slate-400";
  return (
    <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 w-full max-w-xl mx-auto shadow-sm animate-fade-in mt-6">
      <div className="mb-3 flex justify-center">
        {renderIcon(iconName, `w-10 h-10 ${iconColorClass} animate-pulse`)}
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed px-4">
        {description}
      </p>
    </div>
  );
}

// 3. Breadcrumb Strip Component
interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function PageBreadcrumb({ items }: BreadcrumbProps) {
  return (
    <section className="bg-white py-4 w-full border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-12 text-xs flex items-center gap-2 py-1 flex-wrap">
        <Link to="/" className="font-semibold text-[#64748B] hover:text-[#0059bb] transition-colors">Home</Link>
        <span className="text-[#64748B] font-semibold">/</span>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={idx}>
              {isLast ? (
                <span className="text-slate-900 font-bold leading-tight">{item.label}</span>
              ) : (
                <>
                  {item.to ? (
                    <Link to={item.to} className="font-semibold text-[#64748B] hover:text-[#0059bb] transition-colors leading-tight">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[#64748B] leading-tight">{item.label}</span>
                  )}
                  <span className="text-[#64748B] font-semibold">/</span>
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

// 4. Hero Section Component
interface HeroProps {
  title: string;
  subtitle: string;
  iconName?: string;
  isRedTheme?: boolean;
}

export function PageHero({ title, subtitle, iconName, isRedTheme }: HeroProps) {
  const iconBgClass = isRedTheme ? "bg-red-50 text-red-500 border-red-100/50" : "bg-blue-50/50 text-blue-600 border-slate-100";
  return (
    <div className="w-full text-center mb-10 animate-fade-in flex flex-col items-center">
      {iconName && (
        <div 
          className={`w-12 h-12 flex items-center justify-center mb-4 transition-all rounded-full border ${iconBgClass}`}
        >
          {renderIcon(iconName, "w-6 h-6")}
        </div>
      )}
      <h1 
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#00244a] tracking-tight mb-2 leading-tight"
      >
        {title}
      </h1>
      <p 
        className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl leading-relaxed"
      >
        {subtitle}
      </p>
    </div>
  );
}

// 5. Grid Container
interface GridProps {
  children: React.ReactNode;
}

export function HierarchyGrid({ children }: GridProps) {
  return (
    <div className="w-full flex flex-wrap justify-center gap-6 mt-6 animate-fade-in">
      {children}
    </div>
  );
}

// 6. Hierarchy Card Component
interface CardProps {
  key?: React.Key;
  title: string;
  description: string;
  iconName?: string;
  imageSrc?: string;
  onClick: () => void;
  isRedTheme?: boolean;
}

export function HierarchyCard({ title, description, iconName, imageSrc, onClick, isRedTheme }: CardProps) {
  const circleBg = isRedTheme ? "bg-red-50/50 group-hover:bg-red-50" : "bg-blue-50/50 group-hover:bg-blue-50";
  const hoverBorder = isRedTheme ? "hover:border-red-500" : "hover:border-[#0059bb]";
  const iconColor = isRedTheme ? "text-red-500" : "text-[#0059bb]";
  const titleHoverColor = isRedTheme ? "group-hover:text-red-600" : "group-hover:text-[#0059bb]";

  return (
    <div
      onClick={onClick}
      className={`group flex flex-col items-center justify-center p-5 bg-white border border-slate-200/80 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md ${hoverBorder} cursor-pointer hover:-translate-y-2 animate-fade-in shrink-0`}
      style={{ width: '270px', height: '199px' }}
    >
      <div 
        className={`mx-auto mb-3 overflow-hidden ${circleBg} flex items-center justify-center border border-slate-100 transition-colors duration-300`}
        style={{ borderRadius: '100px', width: '48px', height: '48px' }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`${iconColor} transition-colors duration-300`}>
            {renderIcon(iconName || 'HelpCircle', "w-6 h-6")}
          </div>
        )}
      </div>
      <h3 
        className={`font-bold text-[#00244a] mb-1.5 text-center ${titleHoverColor} transition-colors line-clamp-2 px-2`}
        style={{ fontSize: '16px', lineHeight: '1.3' }}
      >
        {title}
      </h3>
      <p 
        className="text-xs text-slate-500 text-center max-w-[170px] leading-relaxed line-clamp-2 px-1"
        style={{ fontSize: '12px', lineHeight: '1.4' }}
      >
        {description}
      </p>
    </div>
  );
}

// 7. Page Container (Scaffolding wrapper with header/footer, loading and error support)
interface PageContainerProps {
  theme: ThemeSettings;
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  isAdminLoggedIn: boolean;
  isLoading?: boolean;
  errorMsg?: string | null;
  loadingText?: string;
  children: React.ReactNode;
}

export function PageContainer({
  theme,
  headerSettings,
  footerSettings,
  isAdminLoggedIn,
  isLoading,
  errorMsg,
  loadingText = "Loading page information...",
  children
}: PageContainerProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen animate-fade-in" style={{ backgroundColor: '#fbf9f8' }}>
        <Header settings={headerSettings} theme={theme} isAdminLoggedIn={isAdminLoggedIn} />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center space-y-3 animate-pulse">
            <div className="w-8 h-8 border-4 border-[#0059bb] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-mono tracking-wider font-semibold uppercase">
              {loadingText}
            </p>
          </div>
        </main>
        <Footer settings={footerSettings} theme={theme} />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#fbf9f8' }}>
        <Header settings={headerSettings} theme={theme} isAdminLoggedIn={isAdminLoggedIn} />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-200/50">
            <Icons.AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-slate-900 mb-2">Resource Mapped Incorrectly</h1>
            <p className="text-sm text-slate-500 mb-6">
              {errorMsg}
            </p>
            <Link to="/" className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0059bb] hover:bg-[#00244a] text-white font-semibold text-xs rounded-lg transition-colors shadow-sm">
              Return Home
            </Link>
          </div>
        </main>
        <Footer settings={footerSettings} theme={theme} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#fbf9f8' }}>
      <Header settings={headerSettings} theme={theme} isAdminLoggedIn={isAdminLoggedIn} />
      
      <main className="flex-grow">
        {children}
      </main>

      <Footer settings={footerSettings} theme={theme} />
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ShieldAlert, Cpu } from 'lucide-react';
import { HeaderSettings, ThemeSettings, Page } from '../../../types';

interface HeaderProps {
  settings: HeaderSettings;
  theme: ThemeSettings;
  isAdminLoggedIn: boolean;
  pages?: Page[];
}

export default function Header({ settings, theme, isAdminLoggedIn, pages }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const handleMenuClick = (url: string) => {
    setIsOpen(false);
    navigate(url);
  };

  const fontClass =
    theme.typography === 'Space Grotesk'
      ? 'font-space'
      : theme.typography === 'Outfit'
      ? 'font-outfit'
      : theme.typography === 'Playfair Display'
      ? 'font-serif'
      : 'font-sans';

  // Customized styling for home vs other pages (made fully uniform dark theme across all pages)
  const headerBg = 'bg-[#030e17] backdrop-blur-md border-b border-[#050b19]';
  const headerStyle = { height: '60px' };

  return (
    <header
      id="header-container"
      className={`${settings.sticky ? 'sticky top-0 z-40' : ''} transition-all duration-300 ${headerBg} ${fontClass}`}
      style={headerStyle}
    >
      <div className="w-full max-w-[1591px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center space-x-2" id="header-logo-link">
          <div className="flex items-center gap-1.5 select-none">
            <div className="relative font-extrabold text-2xl tracking-tight text-white flex items-center">
              <span>N</span>
              <span className="relative inline-block w-6 text-center text-transparent">
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute w-[3px] h-[22px] bg-white rounded-full transform rotate-45"></span>
                  <span className="absolute w-[4px] h-[15px] bg-[#0088FF] rounded-full transform -rotate-45 translate-x-[2px] shadow-[0_0_8px_#0088FF]"></span>
                  <span className="absolute w-[4px] h-[10px] bg-[#00E5FF] rounded-full transform -rotate-45 -translate-x-[2px] shadow-[0_0_8px_#00E5FF]"></span>
                </span>
                X
              </span>
            </div>
            <span className="text-[14px] font-semibold tracking-[0.22em] text-slate-100 uppercase mt-0.5 ml-1">
              S OLUTION
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-2" id="header-desktop-nav">
          {settings.menus.filter(menu => {
            const page = pages?.find(p => p.slug === menu.url);
            return !page || page.visible !== false;
          }).map((menu, idx) => {
            // Let's filter out Home and Contact from the main desktop navigation bar to keep it super clean and match the screenshot exactly (Industries, Solutions, Products, Services, Resources, About Us)
            if (menu.label.toLowerCase() === 'home' || menu.label.toLowerCase() === 'contact') {
              return null;
            }
            return (
              <div key={idx} className="relative group">
                <button
                  onClick={() => handleMenuClick(menu.url)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-slate-900/30"
                >
                  {menu.label}
                  {menu.dropdown && menu.dropdown.length > 0 && (
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 text-slate-500" />
                  )}
                </button>

                {menu.dropdown && menu.dropdown.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-52 rounded-xl shadow-lg border py-2 hidden group-hover:block z-50 animate-fade-in bg-slate-950 border-slate-800 text-slate-200">
                    {menu.dropdown.filter(sub => {
                      const page = pages?.find(p => p.slug === sub.url);
                      return !page || page.visible !== false;
                    }).map((sub, sIdx) => (
                      <Link
                        key={sIdx}
                        to={sub.url}
                        className="block px-4 py-2.5 text-xs font-medium transition-colors hover:bg-slate-900 hover:text-white"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* CTA Button and Admin Hub Portal */}
        <div className="flex items-center space-x-4" id="header-actions">
          {/* Always render Book Demo in top right to match the reference image exactly */}
          <Link
            to="/contact?type=demo"
            className="hidden sm:inline-flex items-center justify-center bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-[0_4px_12px_rgba(0,102,255,0.3)] hover:shadow-[0_4px_20px_rgba(0,102,255,0.5)] tracking-wide"
            id="header-book-demo-btn"
          >
            Book Demo
          </Link>

          {isAdminLoggedIn && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors"
              id="header-admin-hub-link"
            >
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>Admin Desk</span>
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors hover:bg-slate-900 text-slate-300 hover:text-white"
            aria-label="Toggle menu"
            id="header-mobile-trigger"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full shadow-md py-4 px-4 flex flex-col space-y-2 z-50 bg-slate-950 border-b border-slate-900 text-slate-200">
          {settings.menus.filter(menu => {
            const page = pages?.find(p => p.slug === menu.url);
            return !page || page.visible !== false;
          }).map((menu, idx) => (
            <div key={idx} className="flex flex-col">
              <button
                onClick={() => {
                  if (menu.dropdown && menu.dropdown.length > 0) {
                    setActiveDropdown(activeDropdown === menu.label ? null : menu.label);
                  } else {
                    handleMenuClick(menu.url);
                  }
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between hover:bg-slate-900"
              >
                <span>{menu.label}</span>
                {menu.dropdown && menu.dropdown.length > 0 && <ChevronDown className="w-4 h-4" />}
              </button>

              {menu.dropdown && activeDropdown === menu.label && (
                <div className="pl-6 flex flex-col space-y-1 py-1.5 rounded-lg mt-1 bg-slate-900/50">
                  {menu.dropdown.filter(sub => {
                    const page = pages?.find(p => p.slug === sub.url);
                    return !page || page.visible !== false;
                  }).map((sub, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleMenuClick(sub.url)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* Mobile-only Book Demo */}
          <Link
            to="/contact?type=demo"
            onClick={() => setIsOpen(false)}
            className="w-full text-center bg-[#0066FF] hover:bg-blue-600 text-white text-sm font-semibold py-3 rounded-lg mt-2 inline-block transition-all shadow-md"
          >
            Book Demo
          </Link>
        </div>
      )}
    </header>
  );
}

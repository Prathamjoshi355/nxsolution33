import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Twitter, Linkedin, Github, Mail, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import { FooterSettings, ThemeSettings, Page } from '../../../types';
import { apiService } from '../../Services/api';

interface FooterProps {
  settings: FooterSettings;
  theme: ThemeSettings;
  pages?: Page[];
}

export default function Footer({ settings, theme, pages }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await apiService.submitLead({
        name: 'Newsletter Subscriber',
        email,
        phone: '',
        company: 'Individual',
        message: 'Subscribed to newsletter list.',
        source: 'newsletter'
      });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error('Subscription error', err);
    } finally {
      setLoading(false);
    }
  };

  const fontClass =
    theme.typography === 'Space Grotesk'
      ? 'font-space'
      : theme.typography === 'Outfit'
      ? 'font-outfit'
      : theme.typography === 'Playfair Display'
      ? 'font-serif'
      : 'font-sans';

  return (
    <footer
      id="footer-container"
      className={`border-t border-gray-800 ${fontClass} pt-16 pb-12 transition-colors duration-300`}
      style={{
        backgroundColor: settings.bgColor || '#0F172A',
        color: settings.textColor || '#F8FAFC',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* About & Brand Info */}
        <div className="lg:col-span-2 space-y-5" id="footer-brand-section">
          <Link to="/" className="inline-flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight uppercase" style={{ color: theme.primaryColor }}>
              {settings.logo}
            </span>
          </Link>
          <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
            {settings.logoText}
          </p>

          {/* Social Links */}
          <div className="flex space-x-4 pt-2">
            {settings.socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                id={`footer-social-${social.platform.toLowerCase()}`}
              >
                {social.platform === 'Twitter' && <Twitter className="w-4 h-4" />}
                {social.platform === 'LinkedIn' && <Linkedin className="w-4 h-4" />}
                {social.platform === 'GitHub' && <Github className="w-4 h-4" />}
              </a>
            ))}
          </div>
        </div>

        {/* Dynamic Columns */}
        {settings.columns.map((col, idx) => (
          <div key={idx} className="space-y-4" id={`footer-col-${idx}`}>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white">
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.filter(link => {
                const page = pages?.find(p => p.slug === link.url);
                return !page || page.visible !== false;
              }).map((link, lIdx) => (
                <li key={lIdx}>
                  <Link
                    to={link.url}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter Frame */}
        <div className="space-y-4" id="footer-newsletter-section">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-white">
            {settings.newsletterTitle}
          </h4>
          <p className="text-gray-400 text-xs leading-relaxed">
            Stay updated with enterprise security briefs and product manuals.
          </p>

          {subscribed ? (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/30">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-semibold">Subscription Active!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={settings.newsletterPlaceholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-3 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1 top-1 h-7 w-7 rounded-md flex items-center justify-center text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Contact coordinates */}
          <div className="pt-4 space-y-2.5 border-t border-gray-800">
            <div className="flex items-start space-x-2 text-xs text-gray-400">
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <span>{settings.contactInfo.address}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>{settings.contactInfo.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>{settings.contactInfo.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
        <span>{settings.copyright}</span>
        <div className="flex space-x-6">
          <Link to="/about" className="hover:text-gray-300">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-gray-300">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

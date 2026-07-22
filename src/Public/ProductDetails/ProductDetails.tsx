import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Product, ThemeSettings } from '../../types';
import { apiService } from '../Services/api';

interface ProductDetailsProps {
  theme: ThemeSettings;
}

export default function ProductDetails({ theme }: ProductDetailsProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = searchParams.get('slug') || 'nx-ai-dome-camera';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lead, setLead] = useState({ name: '', email: '', phone: '', message: '' });
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const products = await apiService.getProducts();
        const found = products.find(p => p.slug === slug);
        setProduct(found || products[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    try {
      await apiService.submitLead({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: 'Individual Customer',
        message: lead.message || `Interested in ${product.name}`,
        source: 'product_enquiry',
        details: { requestedItem: product.name }
      });
      setSuccess(true);
      setLead({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => {
        setSuccess(false);
        setShowQuoteModal(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 text-center text-on-surface-variant font-body-md animate-pulse">
        Loading product specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 text-center">
        <h2 className="text-headline-md font-headline-md text-primary">Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="text-body-md text-secondary hover:underline mt-4 inline-block">
          Back to Catalog
        </button>
      </div>
    );
  }

  // Fallbacks for missing product attributes
  const features = product.features && product.features.length > 0 ? product.features : [
    "4MP High Resolution",
    "AI Human & Vehicle Detection",
    "Smart Motion Detection",
    "Built-in Microphone",
    "IP67 Weatherproof",
    "Night Vision (Up to 30m)"
  ];

  const modelCode = product.specifications?.find(s => s.key.toLowerCase().includes('model'))?.value || 'NX-DC-AI-4MP';

  return (
    <div className="w-full">
      {/* Breadcrumbs */}
      <div className="bg-white py-4 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto flex items-center space-x-2 text-xs py-1">
          <span className="cursor-pointer font-semibold text-[#64748B] hover:text-blue-600 transition-colors" onClick={() => navigate('/')}>Home</span>
          <span className="text-[#64748B] font-semibold">/</span>
          <span className="cursor-pointer font-semibold text-[#64748B] hover:text-blue-600 transition-colors" onClick={() => navigate('/products')}>Products</span>
          <span className="text-[#64748B] font-semibold">/</span>
          <span className="cursor-pointer font-semibold text-[#64748B] hover:text-blue-600 transition-colors" onClick={() => navigate('/products')}>{product.category || 'AI Cameras'}</span>
          <span className="text-[#64748B] font-semibold">/</span>
          <span className="font-bold text-slate-900">{product.name}</span>
        </div>
      </div>

      {/* Product Hero Section */}
      <section className="py-section-padding px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
          
          {/* Product Info */}
          <div className="flex flex-col gap-stack-lg">
            <div className="flex flex-col gap-stack-sm">
              <h1 className="text-headline-xl font-headline-xl text-primary">{product.name}</h1>
              <p className="text-headline-md font-headline-md text-on-surface-variant">{modelCode}</p>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-[#FFB800]">
                <span className="material-symbols-outlined select-none" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined select-none" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined select-none" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined select-none" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined select-none" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
              </div>
              <span className="text-label-md font-label-md text-on-surface-variant">4.8 (120 reviews)</span>
            </div>
            
            {/* Features List */}
            <ul className="flex flex-col gap-stack-md text-body-lg font-body-lg text-on-surface">
              {features.map((feat, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary select-none">check_circle</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="bg-secondary text-on-primary font-label-md text-label-md px-8 py-4 rounded-DEFAULT hover:opacity-90 transition-opacity cursor-pointer"
              >
                Request Quote
              </button>
              {product.downloads && product.downloads.map((d, i) => (
                <a
                  key={i}
                  href={d.url}
                  className="flex items-center gap-2 text-secondary font-label-md text-label-md px-6 py-4 border border-secondary rounded-DEFAULT hover:bg-secondary-fixed transition-colors"
                >
                  <span className="material-symbols-outlined select-none">download</span>
                  <span>{d.label}</span>
                </a>
              ))}
              {(!product.downloads || product.downloads.length === 0) && (
                <button
                  onClick={() => setShowQuoteModal(true)}
                  className="flex items-center gap-2 text-secondary font-label-md text-label-md px-6 py-4 border border-secondary rounded-DEFAULT hover:bg-secondary-fixed transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined select-none">download</span>
                  <span>Download Datasheet</span>
                </button>
              )}
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-gutter mt-8 pt-8 border-t border-outline-variant">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-outline select-none">verified</span>
                <span className="text-label-md font-label-md">High Quality</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-outline select-none">memory</span>
                <span className="text-label-md font-label-md">AI Powered</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-outline select-none">build</span>
                <span className="text-label-md font-label-md">Easy Installation</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-outline select-none">shield</span>
                <span className="text-label-md font-label-md">1 Year Warranty</span>
              </div>
            </div>
          </div>
          
          {/* Product Image */}
          <div className="flex justify-center items-center bg-surface-container rounded-xl p-8 aspect-square relative overflow-hidden">
            <img
              className="w-full h-full object-contain z-10 relative drop-shadow-2xl"
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80'}
              alt={product.name}
              referrerPolicy="no-referrer"
            />
            {/* Decorative Background Element */}
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-lowest to-transparent opacity-50 z-0"></div>
          </div>
          
        </div>
      </section>

      {/* Technical Specifications Section (Value Add) */}
      {product.specifications && product.specifications.length > 0 && (
        <section className="py-12 bg-background border-t border-outline-variant px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-headline-md text-headline-md text-primary mb-6">Technical Specifications</h2>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl divide-y divide-outline-variant overflow-hidden max-w-3xl">
              {product.specifications.map((spec, i) => (
                <div key={i} className="grid grid-cols-3 p-4 text-body-md font-body-md">
                  <span className="font-semibold text-on-surface-variant">{spec.key}</span>
                  <span className="col-span-2 text-on-surface font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quotation Request Modal Overlay */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQuoteModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined select-none">close</span>
            </button>
            
            <div className="space-y-1">
              <h3 className="font-headline-md text-headline-md text-primary">Request Quotation</h3>
              <p className="text-label-sm font-label-sm text-on-surface-variant">
                Submit your contact coordinates to receive unit price and deployment metrics for <strong>{product.name}</strong>.
              </p>
            </div>
            
            {success ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-label-md font-label-md rounded text-center">
                ✔ Quotation request submitted! Our executive will contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={lead.name}
                    onChange={(e) => setLead({ ...lead, name: e.target.value })}
                    placeholder="Jane Smith"
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={lead.email}
                    onChange={(e) => setLead({ ...lead, email: e.target.value })}
                    placeholder="jane@domain.com"
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={lead.phone}
                    onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                    placeholder="+91"
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Optional Message</label>
                  <textarea
                    value={lead.message}
                    onChange={(e) => setLead({ ...lead, message: e.target.value })}
                    placeholder="Outline your specific hardware count or timeline requirement..."
                    rows={2}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-secondary resize-none"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 mt-2 rounded bg-secondary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {submitting ? 'Transmitting coordinates...' : 'Send Quotation Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

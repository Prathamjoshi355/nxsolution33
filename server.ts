import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db, generatePublicId } from './db.js';
import { CRMLead, Page, Product, CaseStudy, SectionComponent, ThemeSettings, Problem, SolutionSection, Solution, SolutionLead, Module } from './src/types.js';
import { v2 as cloudinary } from 'cloudinary';

const app = express();

// Load environment variables from .env when present
dotenv.config();

let isCloudinaryConfigured = false;
function getCloudinary() {
  if (!isCloudinaryConfigured) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials missing from environment variables.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    isCloudinaryConfigured = true;
  }
  return cloudinary;
}

// Middleware to ensure DB connection is active for both local and serverless environments
app.use(async (req, res, next) => {
  try {
    await db.connect();
  } catch (err) {
    console.error('Database connection error in middleware:', err);
  }
  next();
});

// Middleware to normalize URL paths for Vercel rewrites & serverless functions + detailed logging
app.use((req, res, next) => {
  const rawUrl = req.url || '/';
  const startTime = Date.now();

  // Parse rawUrl with dummy origin
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl, 'http://localhost');
  } catch (e) {
    parsedUrl = new URL('/', 'http://localhost');
  }

  let pathname = parsedUrl.pathname;
  let search = parsedUrl.search;

  // Check if search contains path query parameter (from Vercel rewrites: /api/index?path=theme or /api/index?path=pages)
  const pathParam = parsedUrl.searchParams.get('path');

  let normalizedPath = pathname;

  if (pathParam && pathParam !== 'index' && pathParam !== 'server') {
    const cleanPath = pathParam.startsWith('/') ? pathParam : `/${pathParam}`;
    normalizedPath = `/api${cleanPath}`;
    
    // Remove 'path' query param from searchParams so query string remains clean for endpoint handler
    parsedUrl.searchParams.delete('path');
    const remainingSearch = parsedUrl.searchParams.toString();
    search = remainingSearch ? `?${remainingSearch}` : '';
  } else if (normalizedPath.startsWith('/api/index') || normalizedPath.startsWith('/api/server')) {
    const rawSub = normalizedPath.replace(/^\/api\/(index|server)(\.ts|\.js)?/, '');
    if (rawSub && rawSub !== '/') {
      normalizedPath = `/api${rawSub.startsWith('/') ? rawSub : '/' + rawSub}`;
    } else {
      normalizedPath = '/api';
    }
  }

  // Ensure leading /api prefix if request originated from /api
  if (!normalizedPath.startsWith('/api') && (rawUrl.startsWith('/api') || rawUrl.startsWith('/api/index'))) {
    normalizedPath = `/api${normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath}`;
  }

  // Update req.url for Express route matching
  req.url = `${normalizedPath}${search}`;

  if (req.url.startsWith('/api')) {
    console.log(`[API Incoming] Method: ${req.method} | Raw: ${rawUrl} -> Normalized: ${req.url}`);
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(`[API Response] Method: ${req.method} | URL: ${req.url} | Status: ${res.statusCode} | Duration: ${duration}ms`);
    });
  }

  next();
});

  // Middleware for parsing JSON with a generous limit to support base64 imagery in the CMS
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // File Upload API
  app.post('/api/upload', async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image data provided' });
      }

      try {
        const c = getCloudinary();
        const result = await c.uploader.upload(image, {
          folder: 'nx_solutions_cms'
        });
        return res.json({ url: result.secure_url });
      } catch (cloudinaryError: any) {
        console.warn('Cloudinary upload failed/not configured, falling back to base64:', cloudinaryError.message || cloudinaryError);
        if (image.startsWith('data:')) {
          return res.json({ url: image, warning: 'Cloudinary not configured. Saved locally.' });
        }
        throw cloudinaryError;
      }
    } catch (error: any) {
      console.error('Upload endpoint error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
  });

  // API Routes
  // -------------------------------------------------------------


  // Authentication
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Verify Password / Access Key in Live Production Mode
    const requiredAccessKey = process.env.ADMIN_ACCESS_KEY || 'nx_admin_2026';
    if (password !== requiredAccessKey) {
      return res.status(401).json({ error: 'Invalid Staff Access Key Code' });
    }

    const user = db.authenticateUser(email);
    if (!user) {
      // Create user on first login with correct credentials if they don't exist yet
      const newUser = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: 'Super Admin' as const,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      };
      db.addUser(newUser);
      db.addLog({
        userId: newUser.id,
        userName: newUser.name,
        action: 'User Registered',
        details: `Auto-registered staff member ${email} as Super Admin upon successful keycode verification.`
      });
      const token = `jwt-token-for-${newUser.id}`;
      return res.json({ token, user: newUser });
    }

    db.addLog({
      userId: user.id,
      userName: user.name,
      action: 'Login Success',
      details: `User logged in: ${email}`
    });

    const token = `jwt-token-for-${user.id}`;
    res.json({ token, user });
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    if (!token || !token.startsWith('jwt-token-for-')) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    const userId = token.replace('jwt-token-for-', '');
    const user = db.getUsers().find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    res.json({ user });
  });

  // Global Theme Settings
  app.get('/api/theme', (req, res) => {
    try {
      const theme = db.getTheme();
      res.json(theme);
    } catch (err: any) {
      console.error('[API Error] GET /api/theme:', err);
      res.status(500).json({
        success: false,
        route: '/api/theme',
        error: err?.message || 'Failed to fetch theme',
        stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined
      });
    }
  });

  app.post('/api/theme', (req, res) => {
    try {
      const newTheme: ThemeSettings = req.body;
      db.updateTheme(newTheme);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Update Theme',
        details: `Updated theme styles (Primary: ${newTheme.primaryColor}, Font: ${newTheme.typography})`
      });
      res.json({ success: true, theme: newTheme });
    } catch (err: any) {
      console.error('[API Error] POST /api/theme:', err);
      res.status(500).json({
        success: false,
        route: '/api/theme',
        error: err?.message || 'Failed to update theme'
      });
    }
  });

  // Header settings
  app.get('/api/header', (req, res) => {
    try {
      res.json(db.getHeader());
    } catch (err: any) {
      console.error('[API Error] GET /api/header:', err);
      res.status(500).json({
        success: false,
        route: '/api/header',
        error: err?.message || 'Failed to fetch header'
      });
    }
  });

  app.post('/api/header', (req, res) => {
    try {
      db.updateHeader(req.body);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Update Header',
        details: 'Updated global header menus and logo text.'
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('[API Error] POST /api/header:', err);
      res.status(500).json({
        success: false,
        route: '/api/header',
        error: err?.message || 'Failed to update header'
      });
    }
  });

  // Footer settings
  app.get('/api/footer', (req, res) => {
    try {
      res.json(db.getFooter());
    } catch (err: any) {
      console.error('[API Error] GET /api/footer:', err);
      res.status(500).json({
        success: false,
        route: '/api/footer',
        error: err?.message || 'Failed to fetch footer'
      });
    }
  });

  app.post('/api/footer', (req, res) => {
    try {
      db.updateFooter(req.body);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Update Footer',
        details: 'Updated global footer properties and social links.'
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('[API Error] POST /api/footer:', err);
      res.status(500).json({
        success: false,
        route: '/api/footer',
        error: err?.message || 'Failed to update footer'
      });
    }
  });

  // CMS Pages & Home Endpoint
  app.get('/api/home', (req, res) => {
    try {
      const page = db.getPageBySlug('/') || db.getPages()[0] || null;
      res.json({
        success: true,
        page,
        theme: db.getTheme(),
        header: db.getHeader(),
        footer: db.getFooter()
      });
    } catch (err: any) {
      console.error('[API Error] GET /api/home:', err);
      res.status(500).json({
        success: false,
        route: '/api/home',
        error: err?.message || 'Failed to fetch home page configuration'
      });
    }
  });

  app.get('/api/pages', (req, res) => {
    try {
      res.json(db.getPages());
    } catch (err: any) {
      console.error('[API Error] GET /api/pages:', err);
      res.status(500).json({
        success: false,
        route: '/api/pages',
        error: err?.message || 'Failed to fetch pages'
      });
    }
  });

  app.get('/api/pages/by-slug', (req, res) => {
    try {
      const slug = (req.query.slug as string) || '/';
      const page = db.getPageBySlug(slug);
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }
      res.json(page);
    } catch (err: any) {
      console.error('[API Error] GET /api/pages/by-slug:', err);
      res.status(500).json({
        success: false,
        route: '/api/pages/by-slug',
        error: err?.message || 'Failed to fetch page by slug'
      });
    }
  });

  app.post('/api/pages/:slug/sections', (req, res) => {
    try {
      const { slug } = req.params;
      const page = db.getPageBySlug(slug === 'root' ? '/' : `/${slug}`);
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }
      const { sections, seo, name, visible, draftSections, draftSeo } = req.body;
      page.sections = sections || page.sections;
      page.seo = seo || page.seo;
      page.name = name || page.name;
      page.visible = visible !== undefined ? visible : page.visible;
      if (draftSections !== undefined) page.draftSections = draftSections;
      if (draftSeo !== undefined) page.draftSeo = draftSeo;

      db.updatePage(page.id, page);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Update Visual Sections',
        details: `Modified and re-ordered sections for page: ${page.name} (${page.slug})`
      });
      res.json({ success: true, page });
    } catch (err: any) {
      console.error('[API Error] POST /api/pages/:slug/sections:', err);
      res.status(500).json({
        success: false,
        route: `/api/pages/${req.params.slug}/sections`,
        error: err?.message || 'Failed to update page sections'
      });
    }
  });

  app.post('/api/pages', (req, res) => {
    try {
      const { name, slug, seo } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ error: 'Name and slug are required' });
      }
      const newPage: Page = {
        id: `page-${Date.now()}`,
        name,
        slug: slug.startsWith('/') ? slug : `/${slug}`,
        seo: seo || { title: name, description: '', keywords: '' },
        sections: [
          {
            id: `section-${Date.now()}`,
            name: 'Banner Section',
            type: 'Hero',
            visible: true,
            content: {
              title: `Welcome to ${name}`,
              subtitle: 'This is a brand new visual canvas section.',
              ctaText: 'Get Started',
              ctaUrl: '/',
              badges: []
            },
            styles: {
              paddingTop: '60px',
              paddingBottom: '60px',
              marginTop: '0px',
              marginBottom: '0px',
              backgroundColor: '#FFFFFF',
              textColor: '#1E293B',
              alignment: 'center',
              animation: 'fade',
              visibility: 'all'
            }
          }
        ],
        visible: true
      };
      db.createPage(newPage);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Create Page',
        details: `Created new CMS page: ${name} with route ${newPage.slug}`
      });
      res.json({ success: true, page: newPage });
    } catch (err: any) {
      console.error('[API Error] POST /api/pages:', err);
      res.status(500).json({
        success: false,
        route: '/api/pages',
        error: err?.message || 'Failed to create page'
      });
    }
  });

  app.delete('/api/pages/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.deletePage(id);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Delete Page',
        details: `Removed page ID: ${id}`
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('[API Error] DELETE /api/pages/:id:', err);
      res.status(500).json({
        success: false,
        route: `/api/pages/${req.params.id}`,
        error: err?.message || 'Failed to delete page'
      });
    }
  });

  // Product Catalogue
  app.get('/api/products', (req, res) => {
    try {
      res.json(db.getProducts());
    } catch (err: any) {
      console.error('[API Error] GET /api/products:', err);
      res.status(500).json({
        success: false,
        route: '/api/products',
        error: err?.message || 'Failed to fetch products'
      });
    }
  });

  app.post('/api/products', (req, res) => {
    const product: Product = req.body;
    if (!product.id) {
      product.id = `prod-${Date.now()}`;
    }
    db.saveProduct(product);
    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Save Product',
      details: `Saved product catalog item: ${product.name} (${product.status})`
    });
    res.json({ success: true, product });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.deleteProduct(id);
    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Delete Product',
      details: `Deleted product ID: ${id}`
    });
    res.json({ success: true });
  });

  // Case Studies API
  app.get('/api/case-studies', (req, res) => {
    res.json(db.getCaseStudies());
  });

  app.post('/api/case-studies', (req, res) => {
    const cs: CaseStudy = req.body;
    if (!cs.id) {
      cs.id = `cs-${Date.now()}`;
    }
    db.saveCaseStudy(cs);
    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Save Case Study',
      details: `Saved case study: ${cs.title} (${cs.status})`
    });
    res.json({ success: true, caseStudy: cs });
  });

  app.delete('/api/case-studies/:id', (req, res) => {
    const { id } = req.params;
    db.deleteCaseStudy(id);
    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Delete Case Study',
      details: `Deleted case study ID: ${id}`
    });
    res.json({ success: true });
  });

  // CRM Leads Submission
  app.get('/api/leads', (req, res) => {
    res.json(db.getLeads());
  });

  app.post('/api/leads', (req, res) => {
    const { name, email, phone, company, message, source, details } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const newLead: CRMLead = {
      id: `lead-${Date.now()}`,
      name,
      email,
      phone: phone || '',
      company: company || '',
      message: message || '',
      source: source || 'contact',
      status: 'new',
      notes: '',
      date: new Date().toISOString(),
      details: details || {}
    };
    db.saveLead(newLead);
    db.addLog({
      userId: 'system',
      userName: 'CRM Integration',
      action: 'New Lead Captured',
      details: `Captured lead from ${name} (${email}) via form: ${newLead.source}`
    });
    res.json({ success: true, lead: newLead });
  });

  app.put('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    db.updateLead(id, status, notes);
    db.addLog({
      userId: 'user-admin',
      userName: 'CRM Manager',
      action: 'Update Lead',
      details: `Modified status of Lead ID: ${id} to ${status}`
    });
    res.json({ success: true });
  });

  app.delete('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    db.deleteLead(id);
    db.addLog({
      userId: 'user-admin',
      userName: 'CRM Manager',
      action: 'Delete Lead',
      details: `Deleted Lead ID: ${id}`
    });
    res.json({ success: true });
  });

  // Media Library
  // To make media uploads fully operational inside the sandboxed preview instantly,
  // we can mock-upload base64 directly and return a local URL or base64 data URL.
  // We will maintain a list of media assets inside a simulated list or in local storage.
  // Let's seed some mock media items for easy preview!
  let mediaLibrary = [
    { id: 'm-1', name: 'Banner Main', url: 'https://images.unsplash.com/photo-1541829019-2592e213f985?w=800&auto=format&fit=crop&q=80', size: '150 KB', date: '2026-07-12', altText: 'Enterprise surveillance room' },
    { id: 'm-2', name: 'Dome Camera CloseUp', url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80', size: '92 KB', date: '2026-07-12', altText: 'AI Dome camera white' },
    { id: 'm-3', name: 'Server Rack Safety', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80', size: '204 KB', date: '2026-07-12', altText: 'Data center servers' },
  ];

  app.get('/api/media', (req, res) => {
    res.json(mediaLibrary);
  });

  app.post('/api/media', (req, res) => {
    const { name, fileBase64, altText } = req.body;
    if (!name || !fileBase64) {
      return res.status(400).json({ error: 'Name and file payload are required' });
    }
    // Create a mock local file or standard Base64 representation.
    const newMedia = {
      id: `m-${Date.now()}`,
      name,
      url: fileBase64, // Using the base64 string directly as the image source in React is fully functional!
      size: `${Math.round(fileBase64.length / 1024)} KB`,
      date: new Date().toISOString().split('T')[0],
      altText: altText || name
    };
    mediaLibrary.unshift(newMedia);
    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Media Uploaded',
      details: `Uploaded new asset: ${name}`
    });
    res.json({ success: true, media: newMedia });
  });

  app.delete('/api/media/:id', (req, res) => {
    const { id } = req.params;
    mediaLibrary = mediaLibrary.filter(m => m.id !== id);
    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Media Deleted',
      details: `Removed media asset ID: ${id}`
    });
    res.json({ success: true });
  });

  // Logs & Audits
  app.get('/api/logs', (req, res) => {
    res.json(db.getLogs());
  });

  // Roles configuration
  app.get('/api/roles', (req, res) => {
    res.json(db.getRoles());
  });

  app.post('/api/roles', (req, res) => {
    const { name, permissions } = req.body;
    db.saveRolePermissions(name, permissions);
    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Update Role Permissions',
      details: `Modified permissions of role ${name} to [${permissions.join(', ')}]`
    });
    res.json({ success: true });
  });

  // Users configuration
  app.get('/api/users', (req, res) => {
    res.json(db.getUsers());
  });

  app.post('/api/users', (req, res) => {
    const { name, email, role, avatar } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: role || 'Viewer',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    db.addUser(newUser);
    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Add Staff Member',
      details: `Added new user ${name} (${email}) with role ${role}`
    });
    res.json({ success: true, user: newUser });
  });

  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.deleteUser(id);
    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Remove User',
      details: `Removed staff member ID: ${id}`
    });
    res.json({ success: true });
  });

  // -------------------------------------------------------------
  // Visual Webflow-like Industry Admin Panel CMS API Endpoints
  // -------------------------------------------------------------
  app.get('/api/industries', (req, res) => {
    const page = db.getPageBySlug('/industries');
    if (!page) {
      return res.status(404).json({ error: 'Industries page not configured in database' });
    }

    // Try to find subsections
    let heroSec = page.sections.find(s => s.type === 'Hero' || s.id === 'industries-hero');
    let breadSec = page.sections.find(s => s.type === 'Breadcrumb' || s.id === 'industries-breadcrumb');
    let gridSec = page.sections.find(s => s.type === 'Industries' || s.id === 'industries-grid');
    let ctaSec = page.sections.find(s => s.type === 'CTA' || s.id === 'industries-cta');

    const industriesCards = db.getIndustries().map((ind: any) => ({
      id: ind.id,
      title: ind.name,
      desc: ind.shortDescription,
      link: `/industries/${ind.publicId}`,
      image: ind.coverImage || ind.cardImage,
      icon: ind.icon || 'GraduationCap',
      status: ind.status || 'published',
      featured: ind.featured,
      sortOrder: ind.sortOrder
    }));

    const responsePayload = {
      page: "industries",
      hero: {
        title: heroSec?.content?.title || "AI-Powered Enterprise Solutions",
        subtitle: heroSec?.content?.subtitle || "Transforming Operations with Advanced Vision & IoT",
        description: heroSec?.content?.description || "We engineer robust AI video pipelines, high-precision biometric access terminals, and integrated IoT frameworks tailored to secure and scale modern enterprises.",
        badge: heroSec?.content?.badge || "INDUSTRY SUITE",
        primaryButton: {
          text: heroSec?.content?.primaryButton?.text || heroSec?.content?.ctaText || "Contact Architect",
          link: heroSec?.content?.primaryButton?.link || heroSec?.content?.ctaUrl || "/contact"
        },
        secondaryButton: {
          text: heroSec?.content?.secondaryButton?.text || heroSec?.content?.secondaryCtaText || "View Showcase",
          link: heroSec?.content?.secondaryButton?.link || heroSec?.content?.secondaryCtaUrl || "#grid"
        },
        background: {
          type: heroSec?.styles?.backgroundImage ? "image" : "color",
          color: heroSec?.styles?.backgroundColor || "#0F172A",
          gradient: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          image: heroSec?.styles?.backgroundImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop",
          overlay: heroSec?.styles?.overlay !== undefined ? heroSec.styles.overlay : true,
          opacity: heroSec?.styles?.opacity || 80
        },
        style: {
          paddingY: heroSec?.styles?.paddingTop || "80px",
          containerWidth: "max-w-7xl",
          alignment: heroSec?.styles?.alignment || "center",
          animation: heroSec?.styles?.animation || "fade"
        },
        visible: heroSec ? (heroSec.visible !== false) : true
      },
      breadcrumb: {
        homeText: breadSec?.content?.homeText || "Home",
        currentText: breadSec?.content?.currentText || "Industries",
        separator: breadSec?.content?.separator || "/",
        color: breadSec?.content?.color || "#64748B",
        fontSize: breadSec?.content?.fontSize || "text-xs",
        visible: breadSec ? (breadSec.visible !== false) : true
      },
      industries: industriesCards,
      cta: {
        title: ctaSec?.content?.title || "Ready to Secure Your Facilities?",
        subtitle: ctaSec?.content?.subtitle || "Get in touch with our security architects to design a bespoke automation plan.",
        buttonText: ctaSec?.content?.buttonText || ctaSec?.content?.ctaText || "Get a Free Quote",
        buttonLink: ctaSec?.content?.buttonLink || ctaSec?.content?.ctaUrl || "/contact",
        background: {
          type: "gradient",
          color: ctaSec?.styles?.backgroundColor || "#2563EB",
          gradient: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          image: ctaSec?.styles?.backgroundImage || ""
        },
        visible: ctaSec ? (ctaSec.visible !== false) : true
      },
      seo: page.seo || {
        metaTitle: "Industries We Serve - Smart Security Solutions",
        metaDescription: "Find custom-tailored enterprise automation, security, and tracking solutions for your specific industry vertical.",
        keywords: "Healthcare AI, Manufacturing monitoring, Smart city systems, Corporate safety",
        canonicalUrl: "https://nxsolution.in/industries",
        openGraph: { title: "Enterprise Security Suite", description: "AI & IoT solutions" },
        twitterCard: "summary_large_image",
        schema: "{}",
        robots: "index, follow"
      },
      themeOverride: page.themeOverride || {
        primaryColor: "#2563EB",
        secondaryColor: "#1E293B",
        accentColor: "#10B981",
        background: "#F8FAFC",
        cardColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        typography: "Inter",
        borderRadius: "xl",
        shadow: "lg"
      }
    };

    res.json(responsePayload);
  });

  app.put('/api/industries', (req, res) => {
    const payload = req.body;
    const page = db.getPageBySlug('/industries');
    if (!page) {
      return res.status(404).json({ error: 'Industries page not configured in database' });
    }

    const nextSections: SectionComponent[] = [];

    // 1. Breadcrumb
    if (payload.breadcrumb) {
      nextSections.push({
        id: 'industries-breadcrumb',
        name: 'Breadcrumb Node',
        type: 'Breadcrumb',
        visible: payload.breadcrumb.visible !== false,
        content: payload.breadcrumb,
        styles: {
          paddingTop: '16px',
          paddingBottom: '16px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#FFFFFF',
          alignment: 'left',
          animation: 'none',
          visibility: 'all'
        }
      });
    }

    // 2. Hero
    if (payload.hero) {
      const alignmentVal = payload.hero.style?.alignment;
      const animationVal = payload.hero.style?.animation;
      nextSections.push({
        id: 'industries-hero',
        name: 'Hero Banner Node',
        type: 'Hero',
        visible: payload.hero.visible !== false,
        content: {
          title: payload.hero.title,
          subtitle: payload.hero.subtitle,
          description: payload.hero.description,
          badge: payload.hero.badge,
          primaryButton: payload.hero.primaryButton,
          secondaryButton: payload.hero.secondaryButton,
          ctaText: payload.hero.primaryButton?.text,
          ctaUrl: payload.hero.primaryButton?.link,
          secondaryCtaText: payload.hero.secondaryButton?.text,
          secondaryCtaUrl: payload.hero.secondaryButton?.link
        },
        styles: {
          paddingTop: payload.hero.style?.paddingY || '80px',
          paddingBottom: payload.hero.style?.paddingY || '80px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: payload.hero.background?.color || '#0F172A',
          backgroundImage: payload.hero.background?.type === 'image' ? (payload.hero.background?.image || '') : '',
          overlay: payload.hero.background?.overlay !== false,
          opacity: payload.hero.background?.opacity || 80,
          alignment: (alignmentVal === 'center' || alignmentVal === 'right' || alignmentVal === 'left') ? alignmentVal : 'center',
          animation: (animationVal === 'fade' || animationVal === 'slide-up' || animationVal === 'scale-up' || animationVal === 'none') ? animationVal : 'fade',
          visibility: 'all'
        }
      });
    }

    // 3. Industry Grid
    nextSections.push({
      id: 'industries-grid',
      name: 'Smart Solutions by Industry',
      type: 'Industries',
      visible: true,
      content: {
        title: 'Industries',
        subtitle: payload.hero?.title || 'Smart Solutions for Every Industry',
        items: payload.industries || []
      },
      styles: {
        paddingTop: '64px',
        paddingBottom: '64px',
        marginTop: '0px',
        marginBottom: '0px',
        backgroundColor: payload.themeOverride?.background || '#FFFFFF',
        textColor: '#1E293B',
        alignment: 'center',
        animation: 'none',
        visibility: 'all'
      }
    });

    // 4. CTA
    if (payload.cta) {
      nextSections.push({
        id: 'industries-cta',
        name: 'CTA Banner Node',
        type: 'CTA',
        visible: payload.cta.visible !== false,
        content: {
          title: payload.cta.title,
          subtitle: payload.cta.subtitle,
          buttonText: payload.cta.buttonText,
          buttonLink: payload.cta.buttonLink,
          ctaText: payload.cta.buttonText,
          ctaUrl: payload.cta.buttonLink
        },
        styles: {
          paddingTop: '60px',
          paddingBottom: '60px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: payload.cta.background?.color || '#2563EB',
          backgroundImage: payload.cta.background?.image || '',
          textColor: '#FFFFFF',
          headingColor: '#FFFFFF',
          alignment: 'center',
          animation: 'none',
          visibility: 'all'
        }
      });
    }

    page.sections = nextSections;
    page.seo = payload.seo || page.seo;
    page.themeOverride = payload.themeOverride || page.themeOverride;

    db.updatePage(page.id, page);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Publish Industry Webflow CMS',
      details: `Saved comprehensive visual layout & ${payload.industries?.length || 0} industry vertical cards.`
    });

    res.json(payload);
  });

  // -------------------------------------------------------------
  // Visual Webflow-like Institution Admin Panel CMS API Endpoints
  // -------------------------------------------------------------
  app.get('/api/institutions', (req, res) => {
    const page = db.getPageBySlug('/institution');
    if (!page) {
      return res.status(404).json({ error: 'Institution page not configured in database' });
    }

    let heroSec = page.sections.find(s => s.type === 'Hero' || s.id === 'institution-hero');
    let breadSec = page.sections.find(s => s.type === 'Breadcrumb' || s.id === 'institution-breadcrumb');
    let gridSec = page.sections.find(s => s.type === 'Institution' || s.id === 'institution-grid' || s.id === 'institution-selector');
    let ctaSec = page.sections.find(s => s.type === 'CTA' || s.id === 'institution-cta');

    const cards = db.getInstitutions();

    const mappedCards = cards.map((item: any, idx: number) => {
      const nameVal = item.name || item.title || '';
      const titleSlug = nameVal.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const resolvedSlug = (item.slug && item.slug !== '/area' && item.slug !== '/institution' && item.slug !== '/link' && item.slug !== '')
        ? (item.slug.startsWith('/') ? item.slug : `/${item.slug}`)
        : `/${titleSlug}`;

      return {
        id: item.id || `inst-${idx}-${Date.now()}`,
        title: nameVal,
        subtitle: item.subtitle || '',
        description: item.shortDescription || item.description || item.desc || '',
        slug: resolvedSlug,
        icon: item.icon || 'School',
        image: item.cardImage || item.coverImage || item.image || '',
        button: item.cta?.buttonText || item.button || 'Learn More',
        buttonLink: resolvedSlug,
        style: item.style || {},
        animation: item.animation || 'fade',
        visible: item.status ? (item.status !== 'archived') : (item.visible !== false),
        status: item.status || 'published',
        category: item.category || 'Education',
        industryIds: item.industryId ? [item.industryId] : (item.industryIds || []),
        order: item.sortOrder !== undefined ? item.sortOrder : (item.order !== undefined ? item.order : idx)
      };
    });

    mappedCards.sort((a: any, b: any) => a.order - b.order);

    const responsePayload = {
      page: "institution",
      visible: page.visible !== false,
      hero: {
        title: heroSec?.content?.title || "Education",
        subtitle: heroSec?.content?.subtitle || "Select the type of Institution",
        description: heroSec?.content?.description || "NX Solution offers customized video AI monitoring, high-precision access gates, and integrated tracking modules for institutional efficiency.",
        badge: heroSec?.content?.badge || "INSTITUTION SUITE",
        primaryButton: {
          text: heroSec?.content?.primaryButton?.text || heroSec?.content?.ctaText || "Contact Expert",
          link: heroSec?.content?.primaryButton?.link || heroSec?.content?.ctaUrl || "/contact"
        },
        secondaryButton: {
          text: heroSec?.content?.secondaryButton?.text || heroSec?.content?.secondaryCtaText || "View Areas",
          link: heroSec?.content?.secondaryButton?.link || heroSec?.content?.secondaryCtaUrl || "#grid"
        },
        background: {
          type: heroSec?.styles?.backgroundImage ? "image" : "color",
          color: heroSec?.styles?.backgroundColor || "#00244a",
          gradient: "linear-gradient(135deg, #00244a 0%, #1E293B 100%)",
          image: heroSec?.styles?.backgroundImage || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop",
          overlay: heroSec?.styles?.overlay !== undefined ? heroSec.styles.overlay : true,
          opacity: heroSec?.styles?.opacity || 80
        },
        style: {
          paddingY: heroSec?.styles?.paddingTop || "64px",
          containerWidth: "max-w-7xl",
          alignment: heroSec?.styles?.alignment || "center",
          animation: heroSec?.styles?.animation || "fade"
        },
        visible: heroSec ? (heroSec.visible !== false) : true
      },
      breadcrumb: {
        homeText: breadSec?.content?.homeText || "Home",
        middleText: breadSec?.content?.middleText || "Education",
        currentText: breadSec?.content?.currentText || "Institution",
        separator: breadSec?.content?.separator || "/",
        color: breadSec?.content?.color || "#64748B",
        fontSize: breadSec?.content?.fontSize || "text-xs",
        visible: breadSec ? (breadSec.visible !== false) : true
      },
      institutions: mappedCards,
      cta: {
        title: ctaSec?.content?.title || "Ready to Upgrade Your Institution's Safety?",
        subtitle: ctaSec?.content?.subtitle || "Get in touch with our institutional safety architects to build a custom solution.",
        buttonText: ctaSec?.content?.buttonText || ctaSec?.content?.ctaText || "Get Quote",
        buttonLink: ctaSec?.content?.buttonLink || ctaSec?.content?.ctaUrl || "/contact",
        background: {
          type: "gradient",
          color: ctaSec?.styles?.backgroundColor || "#0070ea",
          gradient: "linear-gradient(135deg, #0070ea 0%, #0059bb 100%)",
          image: ctaSec?.styles?.backgroundImage || ""
        },
        visible: ctaSec ? (ctaSec.visible !== false) : true
      },
      seo: page.seo || {
        metaTitle: "Select Education Institution - NX Solution",
        metaDescription: "Configure safety levels and system integrations across schools, colleges, universities, hostels and playgrounds.",
        keywords: "School tracking, smart university, college surveillance",
        canonicalUrl: "https://nxsolution.in/institution",
        openGraph: { title: "Institution Security Suite", description: "AI & IoT solutions" },
        twitterCard: "summary_large_image",
        schema: "{}",
        robots: "index, follow"
      },
      themeOverride: page.themeOverride || {
        primaryColor: "#00244a",
        secondaryColor: "#0059bb",
        accentColor: "#0070ea",
        background: "#fbf9f8",
        cardColor: "#ffffff",
        borderColor: "#c3c6d1",
        typography: "Hanken Grotesk",
        borderRadius: "xl",
        shadow: "lg"
      }
    };

    res.json(responsePayload);
  });

  app.put('/api/institutions', (req, res) => {
    const payload = req.body;
    const page = db.getPageBySlug('/institution');
    if (!page) {
      return res.status(404).json({ error: 'Institution page not configured in database' });
    }

    const nextSections: any[] = [];

    // 1. Breadcrumb
    if (payload.breadcrumb) {
      nextSections.push({
        id: 'institution-breadcrumb',
        name: 'Breadcrumb Node',
        type: 'Breadcrumb',
        visible: payload.breadcrumb.visible !== false,
        content: payload.breadcrumb,
        styles: {
          paddingTop: '16px',
          paddingBottom: '16px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: '#FFFFFF',
          alignment: 'left',
          animation: 'none',
          visibility: 'all'
        }
      });
    }

    // 2. Hero
    if (payload.hero) {
      const alignmentVal = payload.hero.style?.alignment;
      const animationVal = payload.hero.style?.animation;
      nextSections.push({
        id: 'institution-hero',
        name: 'Hero Banner Node',
        type: 'Hero',
        visible: payload.hero.visible !== false,
        content: {
          title: payload.hero.title,
          subtitle: payload.hero.subtitle,
          description: payload.hero.description,
          badge: payload.hero.badge,
          primaryButton: payload.hero.primaryButton,
          secondaryButton: payload.hero.secondaryButton,
          ctaText: payload.hero.primaryButton?.text,
          ctaUrl: payload.hero.primaryButton?.link,
          secondaryCtaText: payload.hero.secondaryButton?.text,
          secondaryCtaUrl: payload.hero.secondaryButton?.link
        },
        styles: {
          paddingTop: payload.hero.style?.paddingY || '64px',
          paddingBottom: payload.hero.style?.paddingY || '64px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: payload.hero.background?.color || '#00244a',
          backgroundImage: payload.hero.background?.type === 'image' ? (payload.hero.background?.image || '') : '',
          overlay: payload.hero.background?.overlay !== false,
          opacity: payload.hero.background?.opacity || 80,
          alignment: (alignmentVal === 'center' || alignmentVal === 'right' || alignmentVal === 'left') ? alignmentVal : 'center',
          animation: (animationVal === 'fade' || alignmentVal === 'slide-up' || alignmentVal === 'scale-up' || animationVal === 'none') ? animationVal : 'fade',
          visibility: 'all'
        }
      });
    }

    // 3. Institution Grid
    const items = (payload.institutions || []).map((item: any, idx: number) => ({
      id: item.id || `inst-${idx}-${Date.now()}`,
      title: item.title,
      subtitle: item.subtitle || '',
      desc: item.description || item.desc || '',
      description: item.description || item.desc || '',
      slug: item.slug || item.link || '',
      link: item.buttonLink || item.link || '',
      icon: item.icon || 'School',
      image: item.image || '',
      button: item.button || 'Learn More',
      buttonLink: item.buttonLink || item.link || '',
      style: item.style || {},
      animation: item.animation || 'fade',
      visible: item.visible !== false,
      status: item.status || 'published',
      category: item.category || 'Education',
      industryIds: item.industryIds || [],
      order: item.order !== undefined ? item.order : idx
    }));

    nextSections.push({
      id: 'institution-grid',
      name: 'Select Institution',
      type: 'Institution',
      visible: true,
      content: {
        title: 'Education',
        subtitle: payload.hero?.subtitle || 'Select the type of Institution',
        items: items
      },
      styles: {
        paddingTop: '64px',
        paddingBottom: '64px',
        marginTop: '0px',
        marginBottom: '0px',
        backgroundColor: payload.themeOverride?.background || '#fbf9f8',
        textColor: '#1E293B',
        alignment: 'center',
        animation: 'fade',
        visibility: 'all'
      }
    });

    // 4. CTA
    if (payload.cta) {
      nextSections.push({
        id: 'institution-cta',
        name: 'CTA Banner Node',
        type: 'CTA',
        visible: payload.cta.visible !== false,
        content: {
          title: payload.cta.title,
          subtitle: payload.cta.subtitle,
          buttonText: payload.cta.buttonText,
          buttonLink: payload.cta.buttonLink,
          ctaText: payload.cta.buttonText,
          ctaUrl: payload.cta.buttonLink
        },
        styles: {
          paddingTop: '60px',
          paddingBottom: '60px',
          marginTop: '0px',
          marginBottom: '0px',
          backgroundColor: payload.cta.background?.color || '#0070ea',
          backgroundImage: payload.cta.background?.image || '',
          textColor: '#FFFFFF',
          headingColor: '#FFFFFF',
          alignment: 'center',
          animation: 'none',
          visibility: 'all'
        }
      });
    }

    page.sections = nextSections;
    page.seo = payload.seo || page.seo;
    page.themeOverride = payload.themeOverride || page.themeOverride;
    page.visible = payload.visible !== false;

    db.updatePage(page.id, page);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Publish Institution Webflow CMS',
      details: `Saved comprehensive visual layout & ${payload.institutions?.length || 0} institution vertical cards.`
    });

    res.json(payload);
  });

  // POST /api/institutions/card
  app.post('/api/institutions/card', (req, res) => {
    const page = db.getPageBySlug('/institution');
    if (!page) return res.status(404).json({ error: 'Institution page not found' });

    let gridSec = page.sections.find(s => s.type === 'Institution');
    if (!gridSec) return res.status(404).json({ error: 'Institution Grid section not found on page' });

    const newCard = {
      id: `inst-card-${Date.now()}`,
      title: req.body.title || 'New Institution',
      subtitle: req.body.subtitle || '',
      desc: req.body.description || req.body.desc || '',
      description: req.body.description || req.body.desc || '',
      slug: req.body.slug || '',
      link: req.body.buttonLink || req.body.slug || '/contact',
      icon: req.body.icon || 'School',
      image: req.body.image || '',
      button: req.body.button || 'Learn More',
      buttonLink: req.body.buttonLink || req.body.slug || '/contact',
      style: req.body.style || {},
      animation: req.body.animation || 'fade',
      visible: req.body.visible !== false,
      status: req.body.status || 'published',
      category: req.body.category || 'Education',
      industryIds: req.body.industryIds || [],
      order: gridSec.content.items ? gridSec.content.items.length : 0
    };

    if (!gridSec.content.items) gridSec.content.items = [];
    gridSec.content.items.push(newCard);

    db.updatePage(page.id, page);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Create Institution Card',
      details: `Added "${newCard.title}" under order ${newCard.order}`
    });

    res.json({ success: true, card: newCard });
  });

  // PUT /api/institutions/card/:id
  app.put('/api/institutions/card/:id', (req, res) => {
    const { id } = req.params;
    const page = db.getPageBySlug('/institution');
    if (!page) return res.status(404).json({ error: 'Institution page not found' });

    let gridSec = page.sections.find(s => s.type === 'Institution');
    if (!gridSec || !gridSec.content.items) return res.status(404).json({ error: 'Institution Grid not found' });

    const idx = gridSec.content.items.findIndex((item: any) => item.id === id || (item.title && item.title.toLowerCase() === id.toLowerCase()));
    if (idx === -1) return res.status(404).json({ error: 'Card not found' });

    const existing = gridSec.content.items[idx];
    const updated = {
      ...existing,
      title: req.body.title !== undefined ? req.body.title : existing.title,
      subtitle: req.body.subtitle !== undefined ? req.body.subtitle : existing.subtitle,
      desc: req.body.description !== undefined ? req.body.description : (req.body.desc !== undefined ? req.body.desc : existing.desc),
      description: req.body.description !== undefined ? req.body.description : (req.body.desc !== undefined ? req.body.desc : existing.description),
      slug: req.body.slug !== undefined ? req.body.slug : existing.slug,
      link: req.body.buttonLink !== undefined ? req.body.buttonLink : existing.link,
      icon: req.body.icon !== undefined ? req.body.icon : existing.icon,
      image: req.body.image !== undefined ? req.body.image : existing.image,
      button: req.body.button !== undefined ? req.body.button : existing.button,
      buttonLink: req.body.buttonLink !== undefined ? req.body.buttonLink : existing.buttonLink,
      style: req.body.style !== undefined ? req.body.style : existing.style,
      animation: req.body.animation !== undefined ? req.body.animation : existing.animation,
      visible: req.body.visible !== undefined ? req.body.visible : existing.visible,
      status: req.body.status !== undefined ? req.body.status : existing.status,
      category: req.body.category !== undefined ? req.body.category : existing.category,
      industryIds: req.body.industryIds !== undefined ? req.body.industryIds : existing.industryIds,
      order: req.body.order !== undefined ? req.body.order : existing.order
    };

    gridSec.content.items[idx] = updated;
    db.updatePage(page.id, page);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Update Institution Card',
      details: `Modified properties of "${updated.title}"`
    });

    res.json({ success: true, card: updated });
  });

  // DELETE /api/institutions/card/:id
  app.delete('/api/institutions/card/:id', (req, res) => {
    const { id } = req.params;
    const page = db.getPageBySlug('/institution');
    if (!page) return res.status(404).json({ error: 'Institution page not found' });

    let gridSec = page.sections.find(s => s.type === 'Institution');
    if (!gridSec || !gridSec.content.items) return res.status(404).json({ error: 'Institution Grid not found' });

    const initialLength = gridSec.content.items.length;
    gridSec.content.items = gridSec.content.items.filter((item: any) => item.id !== id && item.title !== id);

    if (gridSec.content.items.length === initialLength) {
      return res.status(404).json({ error: 'Card not found or already deleted' });
    }

    db.updatePage(page.id, page);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Delete Institution Card',
      details: `Removed card ID ${id} from Grid`
    });

    res.json({ success: true });
  });

  // PUT /api/institutions/reorder
  app.put('/api/institutions/reorder', (req, res) => {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array is required' });
    }

    const page = db.getPageBySlug('/institution');
    if (!page) return res.status(404).json({ error: 'Institution page not found' });

    let gridSec = page.sections.find(s => s.type === 'Institution');
    if (!gridSec || !gridSec.content.items) return res.status(404).json({ error: 'Institution Grid not found' });

    // Update orders
    gridSec.content.items.forEach((item: any) => {
      const idx = orderedIds.indexOf(item.id);
      if (idx !== -1) {
        item.order = idx;
      }
    });

    // Re-sort items
    gridSec.content.items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    db.updatePage(page.id, page);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Reorder Institution Cards',
      details: `Reordered ${orderedIds.length} cards dynamically`
    });

    res.json({ success: true });
  });

  // PUT /api/institutions/theme
  app.put('/api/institutions/theme', (req, res) => {
    const page = db.getPageBySlug('/institution');
    if (!page) return res.status(404).json({ error: 'Institution page not found' });

    page.themeOverride = {
      ...page.themeOverride,
      ...req.body
    };

    db.updatePage(page.id, page);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Update Institution Page Theme',
      details: `Customized colors and styles for Institution suite`
    });

    res.json({ success: true, themeOverride: page.themeOverride });
  });

  // PUT /api/institutions/seo
  app.put('/api/institutions/seo', (req, res) => {
    const page = db.getPageBySlug('/institution');
    if (!page) return res.status(404).json({ error: 'Institution page not found' });

    page.seo = {
      ...page.seo,
      ...req.body
    };

    db.updatePage(page.id, page);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Update Institution Page SEO',
      details: `Modified meta parameters for search indexing`
    });

    res.json({ success: true, seo: page.seo });
  });

  // PUT /api/institutions/publish
  app.put('/api/institutions/publish', (req, res) => {
    const page = db.getPageBySlug('/institution');
    if (!page) return res.status(404).json({ error: 'Institution page not found' });

    page.visible = req.body.visible !== false;
    db.updatePage(page.id, page);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Publish Institution Suite',
      details: `Status set to ${page.visible ? 'Published' : 'Draft'}`
    });

    res.json({ success: true, visible: page.visible });
  });

  // -------------------------------------------------------------
  // About Us Visual Webflow-like CMS API Endpoints
  // -------------------------------------------------------------
  app.get('/api/about', (req, res) => {
    const page = db.getPageBySlug('/about');
    if (!page) {
      return res.status(404).json({ error: 'About Us page not configured in database' });
    }
    res.json(page);
  });

  app.put('/api/about', (req, res) => {
    const payload = req.body;
    const page = db.getPageBySlug('/about');
    if (!page) {
      return res.status(404).json({ error: 'About Us page not configured in database' });
    }

    // Update fields
    page.sections = payload.sections || page.sections;
    page.seo = payload.seo || page.seo;
    page.themeOverride = payload.themeOverride || page.themeOverride;
    page.visible = payload.visible !== false;

    db.updatePage(page.id, page);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Publish About Us Webflow CMS',
      details: `Saved about us sections count: ${payload.sections?.length || 0}.`
    });

    res.json(page);
  });

  // -------------------------------------------------------------
  // Zone Master Dynamic CMS API Endpoints
  // -------------------------------------------------------------
  function generateUniqueZoneSlug(name: string, excludeId?: string): string {
    const baseSlug = name.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = baseSlug || 'zone';
    let counter = 1;
    const zones = db.getZones();
    while (zones.some(z => z.slug === slug && z.id !== excludeId)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    return slug;
  }

  app.get('/api/zones', (req, res) => {
    const { industryId, institutionId } = req.query;
    let zones = db.getZones();

    if (industryId) {
      zones = zones.filter(z => z.industryId === industryId);
    }
    if (institutionId) {
      zones = zones.filter(z => z.institutionId === institutionId);
    }

    // Sort by sortOrder, then by displayOrder
    zones.sort((a, b) => {
      const orderA = a.sortOrder !== undefined ? a.sortOrder : 0;
      const orderB = b.sortOrder !== undefined ? b.sortOrder : 0;
      return orderA - orderB;
    });

    res.json({ success: true, zones });
  });

  app.post('/api/zones', (req, res) => {
    const {
      name,
      heading,
      subHeading,
      description,
      image,
      industryId,
      institutionId,
      status,
      sortOrder,
      displayOrder,
      isFeatured,
      cardImage,
      coverImage,
      bannerImage,
      icon,
      priority,
      riskLevel,
      shortDescription,
      seo,
      cta,
      featured,
      slug: customSlug
    } = req.body;

    if (!name || !industryId || !institutionId) {
      return res.status(400).json({ error: 'Name, industryId and institutionId are required fields.' });
    }

    const id = `zone-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const slug = customSlug ? generateUniqueZoneSlug(customSlug) : generateUniqueZoneSlug(name);

    const newZone: any = {
      id,
      name,
      slug,
      heading: heading || name,
      subHeading: subHeading || 'Choose the Security Area',
      description: description || '',
      image: image || '',
      industryId,
      institutionId,
      status: status || 'published',
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : (sortOrder !== undefined ? Number(sortOrder) : 0),
      isFeatured: isFeatured === true || isFeatured === 'true' || featured === true || featured === 'true',
      cardImage: cardImage || '',
      coverImage: coverImage || '',
      bannerImage: bannerImage || '',
      icon: icon || '',
      priority: priority || 'Medium',
      riskLevel: riskLevel || 'Medium',
      shortDescription: shortDescription || '',
      seo: seo || {},
      cta: cta || {},
      featured: featured === true || featured === 'true' || isFeatured === true || isFeatured === 'true'
    };

    db.saveZone(newZone);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Create Zone',
      details: `Created new zone "${name}" (slug: ${slug}) for institution ${institutionId}.`
    });

    res.status(201).json({ success: true, zone: newZone });
  });

  app.put('/api/zones/:id', (req, res) => {
    const { id } = req.params;
    const existingZone = db.getZones().find(z => z.id === id);

    if (!existingZone) {
      return res.status(404).json({ error: 'Zone not found.' });
    }

    const {
      name,
      heading,
      subHeading,
      description,
      image,
      industryId,
      institutionId,
      status,
      sortOrder,
      displayOrder,
      isFeatured,
      cardImage,
      coverImage,
      bannerImage,
      icon,
      priority,
      riskLevel,
      shortDescription,
      seo,
      cta,
      featured,
      slug: customSlug
    } = req.body;

    const updatedZone: any = {
      ...existingZone,
      name: name !== undefined ? name : existingZone.name,
      heading: heading !== undefined ? heading : existingZone.heading,
      subHeading: subHeading !== undefined ? subHeading : existingZone.subHeading,
      description: description !== undefined ? description : existingZone.description,
      image: image !== undefined ? image : existingZone.image,
      industryId: industryId !== undefined ? industryId : existingZone.industryId,
      institutionId: institutionId !== undefined ? institutionId : existingZone.institutionId,
      status: status !== undefined ? status : existingZone.status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : existingZone.sortOrder,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : existingZone.displayOrder,
      isFeatured: isFeatured !== undefined ? (isFeatured === true || isFeatured === 'true') : existingZone.isFeatured,
      cardImage: cardImage !== undefined ? cardImage : existingZone.cardImage,
      coverImage: coverImage !== undefined ? coverImage : existingZone.coverImage,
      bannerImage: bannerImage !== undefined ? bannerImage : existingZone.bannerImage,
      icon: icon !== undefined ? icon : existingZone.icon,
      priority: priority !== undefined ? priority : existingZone.priority,
      riskLevel: riskLevel !== undefined ? riskLevel : existingZone.riskLevel,
      shortDescription: shortDescription !== undefined ? shortDescription : existingZone.shortDescription,
      seo: seo !== undefined ? seo : existingZone.seo,
      cta: cta !== undefined ? cta : existingZone.cta,
      featured: featured !== undefined ? (featured === true || featured === 'true') : existingZone.featured
    };

    if (featured !== undefined) {
      updatedZone.isFeatured = (featured === true || featured === 'true');
    }
    if (isFeatured !== undefined) {
      updatedZone.featured = (isFeatured === true || isFeatured === 'true');
    }

    // Handle slug update
    if (customSlug && customSlug !== existingZone.slug) {
      updatedZone.slug = generateUniqueZoneSlug(customSlug, id);
    } else if (name && name !== existingZone.name && !customSlug) {
      updatedZone.slug = generateUniqueZoneSlug(name, id);
    }

    db.saveZone(updatedZone);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Update Zone',
      details: `Updated zone "${updatedZone.name}" (slug: ${updatedZone.slug}).`
    });

    res.json({ success: true, zone: updatedZone });
  });

  app.delete('/api/zones/:id', (req, res) => {
    const { id } = req.params;
    const existingZone = db.getZones().find(z => z.id === id);

    if (!existingZone) {
      return res.status(404).json({ error: 'Zone not found.' });
    }

    // Check if Area (Zone) contains Problems
    const associatedProblemsCount = db.getProblems().filter((p: any) => p.zoneId === id).length
      + db.getZoneProblems().filter((zp: any) => zp.zoneId === id).length;

    if (associatedProblemsCount > 0) {
      return res.status(400).json({ error: 'This Area contains Problems. Remove or move all Problems before deleting this Area.' });
    }

    db.deleteZone(id);

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Delete Zone',
      details: `Deleted zone "${existingZone.name}" with id ${id}.`
    });

    res.json({ success: true, message: 'Zone deleted successfully.' });
  });

  app.put('/api/zones/reorder', (req, res) => {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array is required.' });
    }

    const zones = db.getZones();
    orderedIds.forEach((id: string, index: number) => {
      const zone = zones.find(z => z.id === id);
      if (zone) {
        zone.sortOrder = index;
        zone.displayOrder = index;
        db.saveZone(zone);
      }
    });

    db.addLog({
      userId: 'user-admin',
      userName: 'Administrator',
      action: 'Reorder Zones',
      details: `Reordered ${orderedIds.length} zones.`
    });

    res.json({ success: true, message: 'Zones reordered successfully.' });
  });

  // =========================================================================
  // ENTERPRISE PIPELINE: PROBLEMS, SOLUTIONS & CRM LEADS ENDPOINTS
  // =========================================================================

  // Helper to generate slug
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // 1. Problems CRUD
  app.get('/api/problems', (req, res) => {
    try {
      const problems = db.getProblems();
      res.json({ success: true, problems });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  function generateUniqueProblemSlug(name: string, excludeId?: string): string {
    const baseSlug = name.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = baseSlug || 'problem';
    let counter = 1;
    const problems = db.getProblems();
    while (problems.some(p => p.slug === slug && p.id !== excludeId)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    return slug;
  }

  app.get('/api/problems/:id', (req, res) => {
    try {
      const problem = db.getProblemById(req.params.id);
      if (!problem) return res.status(404).json({ error: 'Problem not found' });
      res.json({ success: true, problem });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/problems', (req, res) => {
    try {
      const {
        id,
        name,
        slug: customSlug,
        description,
        shortDescription,
        image,
        status,
        sortOrder,
        industryId,
        institutionId,
        zoneId,
        areaId,
        severity,
        priority,
        category,
        icon,
        cardImage,
        bannerImage,
        featured,
        isFeatured,
        seo,
        cta
      } = req.body;

      if (!name) return res.status(400).json({ error: 'Problem Name is required' });

      const problemId = id || `prob-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const existingProblem = id ? db.getProblemById(id) : null;
      
      let slug = '';
      if (customSlug && (!existingProblem || existingProblem.slug !== customSlug)) {
        slug = generateUniqueProblemSlug(customSlug, id);
      } else if (!existingProblem || existingProblem.name !== name) {
        slug = generateUniqueProblemSlug(name, id);
      } else {
        slug = existingProblem.slug;
      }

      const isFeat = featured === true || featured === 'true' || isFeatured === true || isFeatured === 'true';

      const problem: Problem = {
        id: problemId,
        name,
        slug,
        description: description || '',
        shortDescription: shortDescription || '',
        image: image || cardImage || '',
        status: status || 'published',
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        industryId: industryId || (existingProblem ? existingProblem.industryId : ''),
        institutionId: institutionId || (existingProblem ? existingProblem.institutionId : ''),
        zoneId: zoneId || areaId || (existingProblem ? (existingProblem.zoneId || existingProblem.areaId) : ''),
        areaId: areaId || zoneId || (existingProblem ? (existingProblem.areaId || existingProblem.zoneId) : ''),
        severity: severity || 'Medium',
        priority: priority || 'Medium',
        category: category || 'Security',
        icon: icon || 'AlertTriangle',
        cardImage: cardImage || image || '',
        bannerImage: bannerImage || '',
        featured: isFeat,
        isFeatured: isFeat,
        seo: seo || {},
        cta: cta || {},
        createdAt: existingProblem ? existingProblem.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.saveProblem(problem);

      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: id ? 'Update Problem' : 'Create Problem',
        details: `${id ? 'Updated' : 'Created'} problem "${name}" with slug "${slug}".`
      });

      res.json({ success: true, problem });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/problems/:id', (req, res) => {
    try {
      const problem = db.getProblemById(req.params.id);
      if (!problem) return res.status(404).json({ error: 'Problem not found' });

      // Check if a Solution exists for this Problem
      const associatedSolutions = db.getSolutionsByProblem(req.params.id);
      if (associatedSolutions && associatedSolutions.length > 0) {
        return res.status(400).json({
          error: 'This Problem already contains a Solution. Remove the Solution first before deleting this Problem.'
        });
      }

      db.deleteProblem(req.params.id);

      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Delete Problem',
        details: `Deleted problem "${problem.name}" (${req.params.id}).`
      });

      res.json({ success: true, message: 'Problem deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. ZoneProblems Mappings (GET & SYNC)
  app.get('/api/zones/:industryId/:institutionId/:zoneId/problems', (req, res) => {
    try {
      const { industryId, institutionId, zoneId } = req.params;
      const mappedProblems = db.getProblemsByZone(industryId, institutionId, zoneId);
      res.json({ success: true, problems: mappedProblems });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/zones/:industryId/:institutionId/:zoneId/problems', (req, res) => {
    try {
      const { industryId, institutionId, zoneId } = req.params;
      const { problemIds } = req.body; // Array of problem IDs

      if (!Array.isArray(problemIds)) {
        return res.status(400).json({ error: 'problemIds must be an array' });
      }

      db.syncZoneProblemsForZone(industryId, institutionId, zoneId, problemIds);

      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Map Problems to Zone',
        details: `Mapped ${problemIds.length} problems to Zone ID "${zoneId}".`
      });

      res.json({ success: true, message: 'Zone problems synchronized successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  function generateUniqueModuleSlug(name: string, excludeId?: string): string {
    const baseSlug = name.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = baseSlug || 'module';
    let counter = 1;
    const modules = db.getModules();
    while (modules.some(m => m.slug === slug && m.id !== excludeId)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    return slug;
  }

  // 2.5. Modules CRUD (New Hierarchy level)
  app.get('/api/modules', (req, res) => {
    try {
      res.json({ success: true, modules: db.getModules() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/problems/:problemId/modules', (req, res) => {
    try {
      const modules = db.getModulesByProblem(req.params.problemId);
      res.json({ success: true, modules });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/modules/:idOrSlug', (req, res) => {
    try {
      const { idOrSlug } = req.params;
      const m = db.getModuleById(idOrSlug) || db.getModuleBySlug(idOrSlug);
      if (!m) return res.status(404).json({ error: 'Module not found' });
      res.json({ success: true, module: m });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/modules/:moduleId/solutions', (req, res) => {
    try {
      const solutions = db.getSolutions().filter(s => s.moduleId === req.params.moduleId);
      res.json({ success: true, solutions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/modules', (req, res) => {
    try {
      const {
        id,
        publicId,
        problemId,
        name,
        slug: customSlug,
        shortDescription,
        description,
        coverImage,
        galleryImages,
        icon,
        status,
        displayOrder,
        sortOrder,
        seo
      } = req.body;

      if (!name) return res.status(400).json({ error: 'Module Name is required' });
      if (!problemId) return res.status(400).json({ error: 'problemId is required' });

      const moduleId = id || `mod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const existingModule = id ? db.getModuleById(id) : null;

      let slug = '';
      if (customSlug && (!existingModule || existingModule.slug !== customSlug)) {
        slug = generateUniqueModuleSlug(customSlug, id);
      } else if (!existingModule || existingModule.name !== name) {
        slug = generateUniqueModuleSlug(name, id);
      } else {
        slug = existingModule.slug;
      }

      const mod: Module = {
        id: moduleId,
        publicId,
        problemId,
        name,
        slug,
        shortDescription: shortDescription || '',
        description: description || '',
        coverImage: coverImage || '',
        galleryImages: galleryImages || [],
        icon: icon || 'Cpu',
        status: status || 'published',
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : (sortOrder !== undefined ? Number(sortOrder) : 0),
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : (displayOrder !== undefined ? Number(displayOrder) : 0),
        seo: seo || {},
        createdAt: existingModule ? existingModule.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.saveModule(mod);

      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: id ? 'Update Module' : 'Create Module',
        details: `${id ? 'Updated' : 'Created'} module "${name}" under problem "${problemId}".`
      });

      res.json({ success: true, module: mod });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/modules/:id', (req, res) => {
    try {
      const { id } = req.params;
      const mod = db.getModuleById(id);
      if (!mod) return res.status(404).json({ error: 'Module not found' });

      // Check if any solution belongs to this module
      const associatedSolutions = db.getSolutions().filter(s => s.moduleId === id);
      if (associatedSolutions.length > 0) {
        return res.status(400).json({
          error: 'This Module contains Solutions. Remove all Solutions first before deleting this Module.'
        });
      }

      db.deleteModule(id);

      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Delete Module',
        details: `Deleted module "${mod.name}" (${id}).`
      });

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Solutions CRUD & Section Configurations
  app.get('/api/solutions', (req, res) => {
    try {
      const solutions = db.getSolutions();
      res.json({ success: true, solutions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/solutions/by-problem/:problemId', (req, res) => {
    try {
      const solutions = db.getSolutionsByProblem(req.params.problemId);
      res.json({ success: true, solutions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/solutions/:idOrSlug', (req, res) => {
    try {
      const { idOrSlug } = req.params;
      let solution = db.getSolutionById(idOrSlug) || db.getSolutionBySlug(idOrSlug);
      if (!solution) return res.status(404).json({ error: 'Solution not found' });
      res.json({ success: true, solution });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Helper to create all 13 default editable sections for a Solution
  const createDefaultSolutionSections = (title: string): SolutionSection[] => {
    const sectionNames = [
      'Hero Section',
      'Problem Overview',
      'Current Challenges',
      'Features',
      'Solution Workflow',
      'Benefits',
      'AI Modules',
      'Hardware Requirements',
      'Software Requirements',
      'Case Study',
      'FAQs',
      'CTA',
      'Lead Form'
    ];

    const sectionIds = [
      'hero',
      'problem-overview',
      'challenges',
      'features',
      'workflow',
      'benefits',
      'ai-modules',
      'hardware',
      'software',
      'case-study',
      'faqs',
      'cta',
      'lead-form'
    ];

    return sectionIds.map((id, index) => {
      let heading = '';
      let subHeading = '';
      let description = '';
      let items: any[] = [];
      let visible = true;

      switch (id) {
        case 'hero':
          heading = `Deploy ${title} Security Systems`;
          subHeading = 'INTEGRATED ENTERPRISE SOLUTION';
          description = `Protect critical operational areas from unauthorized disruptions with highly automated, AI-driven detection engines.`;
          break;
        case 'problem-overview':
          heading = 'Understanding the Problem & Risk';
          subHeading = 'THE CORE THREAT';
          description = 'Manual security checks create massive delays, false positive fatigue, and leave blind spots which lead directly to compromised safety.';
          break;
        case 'challenges':
          heading = 'Key Vulnerability Challenges';
          subHeading = 'WHAT NEEDS RESOLUTION';
          description = 'Traditional surveillance leaves multiple open doors for intrusions and lack of automated alerts.';
          items = [
            { id: '1', text: 'Slow manual identification times (minutes instead of milliseconds)' },
            { id: '2', text: 'High rate of false positives on standard CCTV motion sensors' },
            { id: '3', text: 'Lack of instant notification to field guards and officers' }
          ];
          break;
        case 'features':
          heading = 'Enterprise Feature Capabilities';
          subHeading = 'ADVANCED TECH STACK';
          description = 'Powered by proprietary computer vision and neural detection hardware.';
          items = [
            { id: '1', title: 'Edge Facial Recognition', desc: 'Verify identities directly at the gate with ultra-low latency.' },
            { id: '2', title: 'Intrusion Alerting', desc: 'Instantly notify security desks with live clip feeds upon violation.' },
            { id: '3', title: 'Plate Verification (ANPR)', desc: 'Scan and whitelist registered delivery & employee vehicles automatically.' }
          ];
          break;
        case 'workflow':
          heading = 'Step-by-Step Solution Workflow';
          subHeading = 'HOW IT WORKS';
          description = 'A fully automated pipeline from initial camera feed intake to target mitigation.';
          items = [
            { step: '01', title: 'Capture & Detect', desc: 'AI camera senses human or vehicle entry and extracts structural tags.' },
            { step: '02', title: 'Identity Analysis', desc: 'Local AI engine matches tags against active white/blacklist rosters.' },
            { step: '03', title: 'Instant Escalation', desc: 'On mismatch, alarms trigger and NX Sentinel app sends push notifications to guards.' }
          ];
          break;
        case 'benefits':
          heading = 'Quantifiable Enterprise Benefits';
          subHeading = 'RETURN ON INVESTMENT';
          description = 'Upgrade your facilities with solid metrics that scale operations.';
          items = [
            { metric: '99.8%', label: 'Intrusion Detection Accuracy' },
            { metric: '< 1sec', label: 'Security Notification Latency' },
            { metric: '70%', label: 'Reduction in Manual Guard Costs' }
          ];
          break;
        case 'ai-modules':
          heading = 'Deep Learning Core AI Modules';
          subHeading = 'COMPUTER VISION STACK';
          description = 'State-of-the-art neural networks fine-tuned on custom high-risk enterprise feeds.';
          items = [
            { name: 'NX-FaceDetect-v3', type: 'Face Verification model', accuracy: '99.9%' },
            { name: 'NX-PlateScanner-v2', type: 'Vehicle & ANPR model', accuracy: '98.5%' },
            { name: 'NX-AnomalousTrack-v1', type: 'Loitering & crowd model', accuracy: '96.2%' }
          ];
          break;
        case 'hardware':
          heading = 'Recommended Hardware Infrastructure';
          subHeading = 'EDGE APPLIANCES';
          description = 'Best paired with enterprise high-speed processing hubs.';
          items = [
            { name: 'NX AI Dome Camera (PoE)', specs: '4MP, 4 TOPS local Edge NPU' },
            { name: 'NX Sentinel Processing Station', specs: '16-channel Local Server Core' }
          ];
          break;
        case 'software':
          heading = 'Software & Integration Requirements';
          subHeading = 'SENTINEL SOFTWARE CONSOLE';
          description = 'Centralized administration dashboard and client applications.';
          items = [
            { name: 'NX Sentinel Enterprise Console v5.4', platform: 'CentOS / Windows Server' },
            { name: 'NX Guard Mobile Utility (iOS / Android)', platform: 'Flutter Client Hub' }
          ];
          break;
        case 'case-study':
          heading = 'Real-World Case Study';
          subHeading = 'SUCCESS STORY';
          description = 'See how NX Solution successfully automated access control for a major global institution.';
          items = [
            { label: 'Client', value: 'Delhi International Academy (DIA)' },
            { label: 'Incident reduction', value: '98% decline in gate tailgating within 14 days' },
            { label: 'Testimonial', value: '"The transition to automated gate alerts was flawless and eliminated our primary vulnerability overnight." — Dr. R. Sharma, Principal' }
          ];
          break;
        case 'faqs':
          heading = 'Frequently Asked Questions';
          subHeading = 'FAQS';
          description = 'Got questions about the setup, cost, and installation? Find quick answers below.';
          items = [
            { q: 'Is facial data stored securely on the cloud?', a: 'No, all face templates are converted into non-reversible mathematical vectors stored locally. We never store raw face images.' },
            { q: 'How long does the installation take?', a: 'Standard gates can be fully provisioned, wired, and calibrated within 48 to 72 hours.' },
            { q: 'What happens if the local internet goes down?', a: 'The local NX Sentinel Processing Station operates completely offline, processing all rules and alerts autonomously.' }
          ];
          break;
        case 'cta':
          heading = 'Ready to Secure Your Premises?';
          subHeading = 'GET STARTED TODAY';
          description = 'Get in touch with an NX Solution engineer for an on-site vulnerability assessment.';
          break;
        case 'lead-form':
          heading = 'Request an Enterprise Consultation';
          subHeading = 'BOOK A LIVE DEMO';
          description = 'Submit your requirements below and our deployment team will reach out within 1 business hour.';
          break;
      }

      return {
        id,
        name: sectionNames[index],
        heading,
        subHeading,
        description,
        items,
        bgColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
        textColor: '#1E293B',
        visible,
        displayOrder: index
      };
    });
  };

  app.post('/api/solutions', (req, res) => {
    try {
      const { id, publicId, problemId, moduleId, title, slug: bodySlug, heroTitle, heroSubtitle, status, sections, industryId, institutionId, zoneId } = req.body;
      if (!title) return res.status(400).json({ error: 'Title is required' });

      let finalProblemId = problemId;
      if (moduleId && !finalProblemId) {
        const parentMod = db.getModuleById(moduleId);
        if (parentMod) {
          finalProblemId = parentMod.problemId;
        }
      }

      if (!finalProblemId && !moduleId) {
        return res.status(400).json({ error: 'problemId or moduleId is required' });
      }

      const solutionId = id || `sol-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const slug = bodySlug || slugify(title);

      // Populate sections if not provided (always enforce 13 sections)
      let finalSections = sections;
      if (!finalSections || !Array.isArray(finalSections) || finalSections.length === 0) {
        finalSections = createDefaultSolutionSections(title);
      }

      const solution: Solution = {
        id: solutionId,
        publicId,
        problemId: finalProblemId,
        moduleId,
        title,
        slug,
        heroTitle: heroTitle || `Advanced AI Solution for ${title}`,
        heroSubtitle: heroSubtitle || 'Smart Security Engine',
        status: status || 'published',
        sections: finalSections,
        industryId,
        institutionId,
        zoneId
      };

      db.saveSolution(solution);

      // Save a secondary mapping to problemSolutions collection if needed
      if (finalProblemId) {
        db.assignSolutionToProblem({
          id: `ps-mapping-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          problemId: finalProblemId,
          solutionId
        });
      }

      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: id ? 'Update Solution' : 'Create Solution',
        details: `${id ? 'Updated' : 'Created'} solution "${title}" mapped to module "${moduleId || 'N/A'}" and problem "${finalProblemId || 'N/A'}".`
      });

      res.json({ success: true, solution });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/solutions/:id', (req, res) => {
    try {
      const solution = db.getSolutionById(req.params.id);
      if (!solution) return res.status(404).json({ error: 'Solution not found' });

      db.deleteSolution(req.params.id);

      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Delete Solution',
        details: `Deleted solution "${solution.title}" (${req.params.id}).`
      });

      res.json({ success: true, message: 'Solution deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Sync / Assign existing solutions to problem
  app.post('/api/problems/:problemId/solutions', (req, res) => {
    try {
      const { problemId } = req.params;
      const { solutionIds } = req.body; // Array of solution IDs

      if (!Array.isArray(solutionIds)) {
        return res.status(400).json({ error: 'solutionIds must be an array' });
      }

      db.syncSolutionsForProblem(problemId, solutionIds);

      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Sync Solutions for Problem',
        details: `Synced ${solutionIds.length} solutions for Problem ID "${problemId}".`
      });

      res.json({ success: true, message: 'Problem solutions synced successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dynamic Cascading Solution Hierarchy Endpoints
  app.get('/api/admin/industries', (req, res) => {
    try {
      res.json({ success: true, industries: db.getIndustries() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/industries', (req, res) => {
    try {
      const ind = req.body;
      if (!ind.id) {
        ind.id = `ind-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      db.saveIndustry(ind);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Save Industry',
        details: `Saved Industry "${ind.name}" (ID: ${ind.id})`
      });
      res.json({ success: true, industry: ind });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/industries/:id', (req, res) => {
    try {
      const { id } = req.params;
      const associatedInstitutions = db.getInstitutions().filter(inst => inst.industryId === id);
      if (associatedInstitutions.length > 0) {
        return res.status(400).json({
          error: 'This Industry contains Institutions. Remove or move all Institutions before deleting this Industry.'
        });
      }
      db.deleteIndustry(id);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Delete Industry',
        details: `Deleted Industry ID: ${id}`
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/institutions', (req, res) => {
    try {
      const { industryId } = req.query;
      let institutions = db.getInstitutions();
      if (industryId) {
        institutions = institutions.filter((inst: any) => inst.industryId === industryId);
      }
      res.json({ success: true, institutions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/institutions', (req, res) => {
    try {
      const inst = req.body;
      if (!inst.id) {
        inst.id = `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      db.saveInstitution(inst);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Save Institution',
        details: `Saved Institution "${inst.name}" (ID: ${inst.id})`
      });
      res.json({ success: true, institution: inst });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/institutions/:id', (req, res) => {
    try {
      const { id } = req.params;
      const associatedZones = db.getZones().filter(z => z.institutionId === id);
      if (associatedZones.length > 0) {
        return res.status(400).json({
          error: 'This Institution contains Areas. Remove or move all Areas before deleting this Institution.'
        });
      }
      db.deleteInstitution(id);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Delete Institution',
        details: `Deleted Institution ID: ${id}`
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/zones', (req, res) => {
    try {
      const { institutionId } = req.query;
      let zones = db.getZones().filter((z: any) => !z.status || z.status === 'published');
      if (institutionId) {
        zones = zones.filter((z: any) => z.institutionId === institutionId);
      }
      res.json({ success: true, zones });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/problems', (req, res) => {
    try {
      const { zoneId } = req.query;
      let problems = db.getProblems();
      if (zoneId) {
        const mappings = db.getZoneProblems().filter((zp: any) => zp.zoneId === zoneId);
        const mappedProblemIds = mappings.map((m: any) => m.problemId);
        problems = problems.filter((p: any) => 
          p.zoneId === zoneId || 
          p.areaId === zoneId || 
          mappedProblemIds.includes(p.id)
        );
      }
      
      // Enrich with hasSolution flag
      const enrichedProblems = problems.map((p: any) => ({
        ...p,
        hasSolution: db.getSolutionsByProblem(p.id).length > 0
      }));

      res.json({ success: true, problems: enrichedProblems });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // -------------------------------------------------------------
  // Technology Ecosystem REST APIs
  // -------------------------------------------------------------
  app.get('/api/technologies', (req, res) => {
    try {
      const technologies = db.getTechnologies(false);
      res.json({ success: true, technologies });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/technologies', (req, res) => {
    try {
      const technologies = db.getTechnologies(true);
      res.json({ success: true, technologies });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/technologies', (req, res) => {
    try {
      const tech = req.body;
      if (!tech.name) {
        return res.status(400).json({ error: 'Technology Name is required' });
      }
      db.saveTechnology(tech);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Save Technology Item',
        details: `Saved technology: ${tech.name} (ID: ${tech.id})`
      });
      res.json({ success: true, technology: tech });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/technologies/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.deleteTechnology(id);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Delete Technology Item',
        details: `Deleted technology ID: ${id}`
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/technologies/reorder', (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'orderedIds array required' });
      }
      db.reorderTechnologies(orderedIds);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // Testimonials Module REST APIs
  // -------------------------------------------------------------
  app.get('/api/testimonials', (req, res) => {
    try {
      const testimonials = db.getTestimonials(false);
      res.json({ success: true, testimonials });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/testimonials', (req, res) => {
    try {
      const testimonials = db.getTestimonials(true);
      res.json({ success: true, testimonials });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/testimonials', (req, res) => {
    try {
      const testi = req.body;
      if (!testi.clientName || !testi.testimonial) {
        return res.status(400).json({ error: 'Client Name and Testimonial Content are required' });
      }
      db.saveTestimonial(testi);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Save Testimonial Item',
        details: `Saved testimonial for client: ${testi.clientName} (ID: ${testi.id})`
      });
      res.json({ success: true, testimonial: testi });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/testimonials/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.deleteTestimonial(id);
      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Delete Testimonial Item',
        details: `Deleted testimonial ID: ${id}`
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/testimonials/reorder', (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'orderedIds array required' });
      }
      db.reorderTestimonials(orderedIds);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/technology-categories', (req, res) => {
    try {
      const categories = db.getTechnologyCategories();
      res.json({ success: true, categories });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/technology-categories', (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      const category = db.addTechnologyCategory(name);
      res.json({ success: true, category });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // Public CMS Hierarchy REST APIs
  // -------------------------------------------------------------

  app.get('/api/public/industries', (req, res) => {
    try {
      const rawIndustries = db.getIndustries();
      let industries = rawIndustries.filter((ind: any) => ind.status === 'published');
      if (industries.length === 0 && rawIndustries.length > 0) {
        industries = rawIndustries;
      }
      res.json({ success: true, industries });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/public/industries/:industryPublicId', (req, res) => {
    try {
      const { industryPublicId } = req.params;
      if (!industryPublicId) {
        return res.status(400).json({ error: 'Industry identifier is required' });
      }
      const allIndustries = db.getIndustries();
      let industry = allIndustries.find((ind: any) => 
        (ind.publicId === industryPublicId || ind.id === industryPublicId || ind.slug === industryPublicId) && ind.status === 'published'
      ) || allIndustries.find((ind: any) => 
        ind.publicId === industryPublicId || ind.id === industryPublicId || ind.slug === industryPublicId
      ) || allIndustries.find((ind: any) => 
        ind.slug?.toLowerCase() === industryPublicId.toLowerCase() || ind.name?.toLowerCase() === industryPublicId.toLowerCase() || ind.id?.toLowerCase() === industryPublicId.toLowerCase()
      ) || allIndustries.find((ind: any) => 
        generatePublicId('IND', ind.id || ind.slug || ind.name) === industryPublicId
      );

      // Ultimate fallback: if still not found, fallback to first industry so frontend never 404s
      if (!industry && allIndustries.length > 0) {
        industry = allIndustries[0];
      }

      if (!industry) {
        return res.status(404).json({ error: 'Industry not found' });
      }
      const rawInstitutions = db.getInstitutions().filter((inst: any) => 
        inst.industryId === industry.id || inst.industryId === industry.publicId || inst.industryId === industry.slug
      );
      let institutions = rawInstitutions.filter((inst: any) => inst.status === 'published');
      if (institutions.length === 0 && rawInstitutions.length > 0) {
        institutions = rawInstitutions;
      }
      res.json({ success: true, industry, institutions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/public/institutions/:institutionPublicId', (req, res) => {
    try {
      const { institutionPublicId } = req.params;
      if (!institutionPublicId) {
        return res.status(400).json({ error: 'Institution identifier is required' });
      }
      const allInstitutions = db.getInstitutions();
      let institution = allInstitutions.find((inst: any) => 
        (inst.publicId === institutionPublicId || inst.id === institutionPublicId || inst.slug === institutionPublicId) && inst.status === 'published'
      ) || allInstitutions.find((inst: any) => 
        inst.publicId === institutionPublicId || inst.id === institutionPublicId || inst.slug === institutionPublicId
      ) || allInstitutions.find((inst: any) => 
        inst.slug?.toLowerCase() === institutionPublicId.toLowerCase() || inst.name?.toLowerCase() === institutionPublicId.toLowerCase() || inst.id?.toLowerCase() === institutionPublicId.toLowerCase()
      ) || allInstitutions.find((inst: any) => 
        generatePublicId('INS', inst.id || inst.slug || inst.name) === institutionPublicId
      );

      // Ultimate fallback
      if (!institution && allInstitutions.length > 0) {
        institution = allInstitutions[0];
      }

      if (!institution) {
        return res.status(404).json({ error: 'Institution not found' });
      }
      const rawAreas = db.getZones().filter((z: any) => 
        z.institutionId === institution.id || z.institutionId === institution.publicId || z.institutionId === institution.slug
      );
      let areas = rawAreas.filter((z: any) => z.status === 'published');
      if (areas.length === 0 && rawAreas.length > 0) {
        areas = rawAreas;
      }
      res.json({ success: true, institution, areas });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/public/areas/:areaPublicId', (req, res) => {
    try {
      const { areaPublicId } = req.params;
      if (!areaPublicId) {
        return res.status(400).json({ error: 'Area identifier is required' });
      }
      const allZones = db.getZones();
      let area = allZones.find((z: any) => 
        (z.publicId === areaPublicId || z.id === areaPublicId || z.slug === areaPublicId) && z.status === 'published'
      ) || allZones.find((z: any) => 
        z.publicId === areaPublicId || z.id === areaPublicId || z.slug === areaPublicId
      ) || allZones.find((z: any) => 
        z.slug?.toLowerCase() === areaPublicId.toLowerCase() || z.name?.toLowerCase() === areaPublicId.toLowerCase() || z.id?.toLowerCase() === areaPublicId.toLowerCase()
      ) || allZones.find((z: any) => 
        generatePublicId('ARE', z.id || z.slug || z.name) === areaPublicId
      );

      // Ultimate fallback
      if (!area && allZones.length > 0) {
        area = allZones[0];
      }

      if (!area) {
        return res.status(404).json({ error: 'Area not found' });
      }
      const rawProblems = db.getProblems().filter((p: any) => 
        p.zoneId === area.id || p.zoneId === area.publicId || p.zoneId === area.slug
      );
      let problems = rawProblems.filter((p: any) => p.status === 'published');
      if (problems.length === 0 && rawProblems.length > 0) {
        problems = rawProblems;
      }
      res.json({ success: true, area, problems });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/public/problems/:problemPublicId', (req, res) => {
    try {
      const { problemPublicId } = req.params;
      if (!problemPublicId) {
        return res.status(400).json({ error: 'Problem identifier is required' });
      }
      const allProblems = db.getProblems();
      let problem = allProblems.find((p: any) => 
        (p.publicId === problemPublicId || p.id === problemPublicId || p.slug === problemPublicId) && p.status === 'published'
      ) || allProblems.find((p: any) => 
        p.publicId === problemPublicId || p.id === problemPublicId || p.slug === problemPublicId
      ) || allProblems.find((p: any) => 
        p.slug?.toLowerCase() === problemPublicId.toLowerCase() || p.name?.toLowerCase() === problemPublicId.toLowerCase() || p.id?.toLowerCase() === problemPublicId.toLowerCase()
      ) || allProblems.find((p: any) => 
        generatePublicId('PRB', p.id || p.slug || p.name) === problemPublicId
      );

      // Ultimate fallback
      if (!problem && allProblems.length > 0) {
        problem = allProblems[0];
      }

      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json({ success: true, problem });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/public/solutions/:problemPublicId', (req, res) => {
    try {
      const { problemPublicId } = req.params;
      if (!problemPublicId) {
        return res.status(400).json({ error: 'Problem identifier is required' });
      }
      const allProblems = db.getProblems();
      let problem = allProblems.find((p: any) => 
        (p.publicId === problemPublicId || p.id === problemPublicId || p.slug === problemPublicId) && p.status === 'published'
      ) || allProblems.find((p: any) => 
        p.publicId === problemPublicId || p.id === problemPublicId || p.slug === problemPublicId
      ) || allProblems.find((p: any) => 
        p.slug?.toLowerCase() === problemPublicId.toLowerCase() || p.name?.toLowerCase() === problemPublicId.toLowerCase() || p.id?.toLowerCase() === problemPublicId.toLowerCase()
      ) || allProblems.find((p: any) => 
        generatePublicId('PRB', p.id || p.slug || p.name) === problemPublicId
      ) || allProblems[0];

      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      const rawSolutions = db.getSolutionsByProblem(problem.id);
      let solutions = rawSolutions.filter((s: any) => s.status === 'published');
      if (solutions.length === 0 && rawSolutions.length > 0) {
        solutions = rawSolutions;
      }
      res.json({ success: true, solutions, solution: solutions[0] || null });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/public/problems/:problemPublicId/modules', (req, res) => {
    try {
      const { problemPublicId } = req.params;
      if (!problemPublicId) {
        return res.status(400).json({ error: 'Problem identifier is required' });
      }
      const allProblems = db.getProblems();
      let problem = allProblems.find((p: any) => 
        (p.publicId === problemPublicId || p.id === problemPublicId || p.slug === problemPublicId) && p.status === 'published'
      ) || allProblems.find((p: any) => 
        p.publicId === problemPublicId || p.id === problemPublicId || p.slug === problemPublicId
      ) || allProblems.find((p: any) => 
        p.slug?.toLowerCase() === problemPublicId.toLowerCase() || p.name?.toLowerCase() === problemPublicId.toLowerCase() || p.id?.toLowerCase() === problemPublicId.toLowerCase()
      ) || allProblems.find((p: any) => 
        generatePublicId('PRB', p.id || p.slug || p.name) === problemPublicId
      ) || allProblems[0];

      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      const rawModules = db.getModulesByProblem(problem.id);
      let modules = rawModules.filter((m: any) => m.status === 'published');
      if (modules.length === 0 && rawModules.length > 0) {
        modules = rawModules;
      }
      res.json({ success: true, problem, modules });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/public/modules/:modulePublicId/solutions', (req, res) => {
    try {
      const { modulePublicId } = req.params;
      const allModules = db.getModules();
      let foundModule = allModules.find((m: any) => 
        (m.publicId === modulePublicId || m.id === modulePublicId || m.slug === modulePublicId) && m.status === 'published'
      ) || allModules.find((m: any) => 
        m.publicId === modulePublicId || m.id === modulePublicId || m.slug === modulePublicId
      ) || allModules.find((m: any) => 
        m.slug?.toLowerCase() === modulePublicId.toLowerCase() || m.name?.toLowerCase() === modulePublicId.toLowerCase() || m.id?.toLowerCase() === modulePublicId.toLowerCase()
      ) || allModules.find((m: any) => 
        generatePublicId('MOD', m.id || m.slug || m.name) === modulePublicId
      ) || allModules[0];

      if (!foundModule) {
        return res.status(404).json({ error: 'Module not found' });
      }

      const rawSolutions = db.getSolutions().filter((s: any) => s.moduleId === foundModule.id);
      let solutions = rawSolutions.filter((s: any) => s.status === 'published');
      if (solutions.length === 0 && rawSolutions.length > 0) {
        solutions = rawSolutions;
      }
      res.json({ success: true, module: foundModule, solutions, solution: solutions[0] || null });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/public/solutions/detail/:solutionPublicId', (req, res) => {
    try {
      const { solutionPublicId } = req.params;
      const allSolutions = db.getSolutions();
      let solution = allSolutions.find((s: any) => 
        (s.publicId === solutionPublicId || s.id === solutionPublicId || s.slug === solutionPublicId) && s.status === 'published'
      ) || allSolutions.find((s: any) => 
        s.publicId === solutionPublicId || s.id === solutionPublicId || s.slug === solutionPublicId
      ) || allSolutions.find((s: any) => 
        s.slug?.toLowerCase() === solutionPublicId.toLowerCase() || s.name?.toLowerCase() === solutionPublicId.toLowerCase() || s.id?.toLowerCase() === solutionPublicId.toLowerCase() || s.title?.toLowerCase() === solutionPublicId.toLowerCase()
      ) || allSolutions.find((s: any) => 
        generatePublicId('SOL', s.id || s.slug || s.name || s.title) === solutionPublicId
      ) || allSolutions[0];

      if (!solution) {
        return res.status(404).json({ error: 'Solution not found' });
      }
      res.json({ success: true, solution });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // 4. Solution Lead Forms Submissions & CRM
  app.post('/api/leads/solution', (req, res) => {
    try {
      const {
        industryId,
        industryName,
        institutionId,
        institutionName,
        zoneId,
        zoneName,
        problemId,
        problemName,
        solutionId,
        solutionTitle,
        visitorName,
        company,
        email,
        phone,
        message,
        sourceUrl
      } = req.body;

      if (!visitorName || !email || !solutionId) {
        return res.status(400).json({ error: 'Visitor Name, Email, and Solution ID are required' });
      }

      const leadId = `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const timestamp = new Date().toISOString();

      // Store in normalized solutionLeads collection
      const solutionLead: SolutionLead = {
        id: leadId,
        industryId: industryId || '',
        industryName: industryName || 'General',
        institutionId: institutionId || '',
        institutionName: institutionName || 'General',
        zoneId: zoneId || '',
        zoneName: zoneName || 'General',
        problemId: problemId || '',
        problemName: problemName || 'General',
        solutionId,
        solutionTitle: solutionTitle || 'General Solution',
        visitorName,
        company: company || '',
        email,
        phone: phone || '',
        message: message || '',
        timestamp,
        sourceUrl: sourceUrl || ''
      };

      db.saveSolutionLead(solutionLead);

      // Also automatically push into the general CRM leads collection so it is immediately visible in CRM main list
      const standardLead: CRMLead = {
        id: leadId,
        name: visitorName,
        email,
        phone: phone || '',
        company: company || '',
        message: message || `Enquired for Solution: ${solutionTitle || 'AI Solution'}\nMessage: ${message || ''}`,
        source: 'contact',
        status: 'new',
        notes: `Auto-generated Solution Enquiry. Hierarchy:\nIndustry: ${industryName}\nInstitution: ${institutionName}\nZone: ${zoneName}\nProblem: ${problemName}\nSolution: ${solutionTitle}`,
        date: timestamp,
        details: {
          solutionLeadId: leadId,
          industryId,
          industryName,
          institutionId,
          institutionName,
          zoneId,
          zoneName,
          problemId,
          problemName,
          solutionId,
          solutionTitle,
          sourceUrl
        }
      };

      db.saveLead(standardLead);

      db.addLog({
        userId: 'visitor',
        userName: visitorName,
        action: 'Submit Solution Lead',
        details: `Visitor submitted lead for solution "${solutionTitle}" under ${industryName}/${institutionName}/${zoneName}/${problemName}.`
      });

      res.json({ success: true, message: 'Solution Lead saved successfully and synced to CRM.', lead: solutionLead });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get CRM Solution leads (with full hierarchy)
  app.get('/api/leads/solution', (req, res) => {
    try {
      const leads = db.getSolutionLeads();
      res.json({ success: true, leads });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/leads/solution/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.deleteSolutionLead(id);
      db.deleteLead(id); // Delete from standard CRM leads too to keep it synchronized

      db.addLog({
        userId: 'user-admin',
        userName: 'Administrator',
        action: 'Delete Solution Lead',
        details: `Deleted solution lead with ID ${id}.`
      });

      res.json({ success: true, message: 'Solution lead deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fallback 404 handler for unmatched /api routes
  app.use('/api/*', (req, res) => {
    console.warn(`[API 404] Unmatched API route: ${req.method} ${req.originalUrl || req.url}`);
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.url}`
    });
  });

  // Global Express Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API Unhandled Error]:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Internal Server Error'
    });
  });

export { app };

// Only start local listening server if not running in Vercel Serverless environment
if (!process.env.VERCEL) {
  const PORT = 3000;
  
  // Dev mode
  if (process.env.NODE_ENV !== 'production') {
    (async () => {
      db.connect().catch(err => console.error('DB connect error:', err));
      const viteModule = await import('vite');
      const createViteServer = viteModule.createServer;
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Development server running on http://localhost:${PORT}`);
      });
    })().catch(err => {
      console.error('Failed to start local dev server:', err);
    });
  } else {
    // Production standalone mode
    db.connect().catch(err => console.error('DB connect error:', err));
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Production standalone server running on port ${PORT}`);
    });
  }
}

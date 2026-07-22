import axios from 'axios';
import { ThemeSettings, HeaderSettings, FooterSettings, Page, Product, CaseStudy, CRMLead, AuditLog, Role, User, Problem, Solution, SolutionLead, Zone, Module, TestimonialItem } from '../../types';

const API = axios.create({
  baseURL: '',
});

// Automatically inject JWT tokens from local storage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('nx_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic retry interceptor for handling transient 429 rate limit errors with exponential backoff
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response && response.status === 429 && config) {
      // Track retry count on the config object
      const requestConfig = config as any;
      requestConfig.__retryCount = requestConfig.__retryCount || 0;
      
      if (requestConfig.__retryCount < 4) {
        requestConfig.__retryCount += 1;
        // Exponential backoff: e.g., 300ms, 600ms, 1200ms, 2400ms
        const delay = Math.pow(2, requestConfig.__retryCount) * 150;
        console.warn(`[API] Rate limit 429 hit. Retrying request to ${config.url || ''} (Attempt ${requestConfig.__retryCount}/4) after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return API(config);
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  login: async (email: string, password?: string): Promise<{ token: string; user: User }> => {
    const res = await API.post('/api/auth/login', { email, password });
    return res.data;
  },
  getMe: async (): Promise<{ user: User }> => {
    const res = await API.get('/api/auth/me');
    return res.data;
  },

  // Theme Settings
  getTheme: async (): Promise<ThemeSettings> => {
    const res = await API.get('/api/theme');
    return res.data;
  },
  updateTheme: async (theme: ThemeSettings): Promise<any> => {
    const res = await API.post('/api/theme', theme);
    return res.data;
  },

  // Header Settings
  getHeader: async (): Promise<HeaderSettings> => {
    const res = await API.get('/api/header');
    return res.data;
  },
  updateHeader: async (header: HeaderSettings): Promise<any> => {
    const res = await API.post('/api/header', header);
    return res.data;
  },

  // Footer Settings
  getFooter: async (): Promise<FooterSettings> => {
    const res = await API.get('/api/footer');
    return res.data;
  },
  updateFooter: async (footer: FooterSettings): Promise<any> => {
    const res = await API.post('/api/footer', footer);
    return res.data;
  },

  // CMS Pages
  getPages: async (): Promise<Page[]> => {
    const res = await API.get('/api/pages');
    return res.data;
  },
  getPageBySlug: async (slug: string): Promise<Page> => {
    const res = await API.get(`/api/pages/by-slug?slug=${encodeURIComponent(slug)}`);
    return res.data;
  },
  savePageSections: async (slug: string, payload: { name?: string; visible?: boolean; sections: any[]; seo?: any; draftSections?: any[]; draftSeo?: any; revisions?: any[] }): Promise<any> => {
    const res = await API.post(`/api/pages/${slug === '/' ? 'root' : slug.replace(/^\//, '')}/sections`, payload);
    return res.data;
  },
  createPage: async (payload: { name: string; slug: string }): Promise<any> => {
    const res = await API.post('/api/pages', payload);
    return res.data;
  },
  deletePage: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/pages/${id}`);
    return res.data;
  },

  // Products Catalogue
  getProducts: async (): Promise<Product[]> => {
    const res = await API.get('/api/products');
    return res.data;
  },
  saveProduct: async (product: Partial<Product>): Promise<any> => {
    const res = await API.post('/api/products', product);
    return res.data;
  },
  deleteProduct: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/products/${id}`);
    return res.data;
  },

  // Case Studies
  getCaseStudies: async (): Promise<CaseStudy[]> => {
    const res = await API.get('/api/case-studies');
    return res.data;
  },
  saveCaseStudy: async (cs: Partial<CaseStudy>): Promise<any> => {
    const res = await API.post('/api/case-studies', cs);
    return res.data;
  },
  deleteCaseStudy: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/case-studies/${id}`);
    return res.data;
  },

  // CRM Leads
  getLeads: async (): Promise<CRMLead[]> => {
    const res = await API.get('/api/leads');
    return res.data;
  },
  submitLead: async (lead: Omit<CRMLead, 'id' | 'status' | 'date' | 'notes'>): Promise<any> => {
    const res = await API.post('/api/leads', lead);
    return res.data;
  },
  updateLead: async (id: string, payload: { status: string; notes: string }): Promise<any> => {
    const res = await API.put(`/api/leads/${id}`, payload);
    return res.data;
  },
  deleteLead: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/leads/${id}`);
    return res.data;
  },

  // Media Library
  getMedia: async (): Promise<any[]> => {
    const res = await API.get('/api/media');
    return res.data;
  },
  uploadMedia: async (payload: { name: string; fileBase64: string; altText?: string }): Promise<any> => {
    const res = await API.post('/api/media', payload);
    return res.data;
  },
  deleteMedia: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/media/${id}`);
    return res.data;
  },

  // Audit Logs
  getLogs: async (): Promise<AuditLog[]> => {
    const res = await API.get('/api/logs');
    return res.data;
  },

  // Roles & Permissions
  getRoles: async (): Promise<Role[]> => {
    const res = await API.get('/api/roles');
    return res.data;
  },
  updateRolePermissions: async (roleName: string, permissions: string[]): Promise<any> => {
    const res = await API.post('/api/roles', { name: roleName, permissions });
    return res.data;
  },

  // Users Management
  getUsers: async (): Promise<User[]> => {
    const res = await API.get('/api/users');
    return res.data;
  },
  addUser: async (user: Omit<User, 'id'>): Promise<any> => {
    const res = await API.post('/api/users', user);
    return res.data;
  },
  deleteUser: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/users/${id}`);
    return res.data;
  },

  // Zones
  getZones: async (industryId?: string, institutionId?: string): Promise<Zone[]> => {
    let url = '/api/zones';
    const params: any = {};
    if (industryId) params.industryId = industryId;
    if (institutionId) params.institutionId = institutionId;
    const res = await API.get(url, { params });
    return res.data.zones || [];
  },
  saveZone: async (zone: any): Promise<any> => {
    const res = await API.post('/api/zones', zone);
    return res.data;
  },
  deleteZone: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/zones/${id}`);
    return res.data;
  },
  reorderZones: async (orderedIds: string[]): Promise<any> => {
    const res = await API.put('/api/zones/reorder', { orderedIds });
    return res.data;
  },

  getIndustries: async (): Promise<any[]> => {
    const res = await API.get('/api/industries');
    return res.data.industries || [];
  },

  getInstitutions: async (): Promise<any[]> => {
    const res = await API.get('/api/institutions');
    return res.data.institutions || [];
  },

  // Problems
  getProblems: async (): Promise<Problem[]> => {
    const res = await API.get('/api/problems');
    return res.data.problems || [];
  },
  getProblemById: async (id: string): Promise<Problem> => {
    const res = await API.get(`/api/problems/${id}`);
    return res.data.problem;
  },
  saveProblem: async (problem: Partial<Problem>): Promise<any> => {
    const res = await API.post('/api/problems', problem);
    return res.data;
  },
  deleteProblem: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/problems/${id}`);
    return res.data;
  },

  // ZoneProblems Mapping
  getZoneProblems: async (industryId: string, institutionId: string, zoneId: string): Promise<Problem[]> => {
    const res = await API.get(`/api/zones/${industryId}/${institutionId}/${zoneId}/problems`);
    return res.data.problems || [];
  },
  syncZoneProblems: async (industryId: string, institutionId: string, zoneId: string, problemIds: string[]): Promise<any> => {
    const res = await API.post(`/api/zones/${industryId}/${institutionId}/${zoneId}/problems`, { problemIds });
    return res.data;
  },

  // Solutions
  getSolutions: async (): Promise<Solution[]> => {
    const res = await API.get('/api/solutions');
    return res.data.solutions || [];
  },
  getSolutionsByProblem: async (problemId: string): Promise<Solution[]> => {
    const res = await API.get(`/api/solutions/by-problem/${problemId}`);
    return res.data.solutions || [];
  },
  getSolution: async (idOrSlug: string): Promise<Solution> => {
    const res = await API.get(`/api/solutions/${idOrSlug}`);
    return res.data.solution;
  },
  saveSolution: async (solution: Partial<Solution>): Promise<any> => {
    const res = await API.post('/api/solutions', solution);
    return res.data;
  },
  deleteSolution: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/solutions/${id}`);
    return res.data;
  },
  syncSolutionsForProblem: async (problemId: string, solutionIds: string[]): Promise<any> => {
    const res = await API.post(`/api/problems/${problemId}/solutions`, { solutionIds });
    return res.data;
  },

  // Modules (New Hierarchy Level)
  getModules: async (): Promise<Module[]> => {
    const res = await API.get('/api/modules');
    return res.data.modules || [];
  },
  getModulesByProblem: async (problemId: string): Promise<Module[]> => {
    const res = await API.get(`/api/problems/${problemId}/modules`);
    return res.data.modules || [];
  },
  getModule: async (idOrSlug: string): Promise<Module> => {
    const res = await API.get(`/api/modules/${idOrSlug}`);
    return res.data.module;
  },
  saveModule: async (module: Partial<Module>): Promise<any> => {
    const res = await API.post('/api/modules', module);
    return res.data;
  },
  deleteModule: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/modules/${id}`);
    return res.data;
  },
  getSolutionsByModule: async (moduleId: string): Promise<Solution[]> => {
    const res = await API.get(`/api/modules/${moduleId}/solutions`);
    return res.data.solutions || [];
  },

  // Dynamic Cascading Solution Hierarchy Endpoints
  getAdminIndustries: async (): Promise<any[]> => {
    const res = await API.get('/api/admin/industries');
    return res.data.industries || [];
  },
  saveAdminIndustry: async (industry: any): Promise<any> => {
    const res = await API.post('/api/admin/industries', industry);
    return res.data;
  },
  deleteAdminIndustry: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/admin/industries/${id}`);
    return res.data;
  },
  getAdminInstitutions: async (industryId?: string): Promise<any[]> => {
    const res = await API.get('/api/admin/institutions', { params: { industryId } });
    return res.data.institutions || [];
  },
  saveAdminInstitution: async (institution: any): Promise<any> => {
    const res = await API.post('/api/admin/institutions', institution);
    return res.data;
  },
  deleteAdminInstitution: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/admin/institutions/${id}`);
    return res.data;
  },
  getAdminZones: async (institutionId?: string): Promise<any[]> => {
    const res = await API.get('/api/admin/zones', { params: { institutionId } });
    return res.data.zones || [];
  },
  saveAdminZone: async (zone: any): Promise<any> => {
    if (zone.id) {
      const res = await API.put(`/api/zones/${zone.id}`, zone);
      return res.data;
    } else {
      const res = await API.post('/api/zones', zone);
      return res.data;
    }
  },
  deleteAdminZone: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/zones/${id}`);
    return res.data;
  },
  getAdminProblems: async (zoneId?: string): Promise<any[]> => {
    const res = await API.get('/api/admin/problems', { params: { zoneId } });
    return res.data.problems || [];
  },

  // Solution Leads CRM
  submitSolutionLead: async (lead: Partial<SolutionLead>): Promise<any> => {
    const res = await API.post('/api/leads/solution', lead);
    return res.data;
  },
  getSolutionLeads: async (): Promise<SolutionLead[]> => {
    const res = await API.get('/api/leads/solution');
    return res.data.leads || [];
  },
  deleteSolutionLead: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/leads/solution/${id}`);
    return res.data;
  },

  // Image Upload
  uploadImage: async (base64Image: string): Promise<{ url: string; warning?: string }> => {
    const res = await API.post('/api/upload', { image: base64Image });
    return res.data;
  },

  // Public REST APIs using publicId
  getPublicIndustries: async (): Promise<any[]> => {
    const res = await API.get('/api/public/industries');
    return res.data.industries || [];
  },
  getPublicIndustry: async (publicId: string): Promise<any> => {
    const res = await API.get(`/api/public/industries/${publicId}`);
    return res.data;
  },
  getPublicInstitution: async (publicId: string): Promise<any> => {
    const res = await API.get(`/api/public/institutions/${publicId}`);
    return res.data;
  },
  getPublicArea: async (publicId: string): Promise<any> => {
    const res = await API.get(`/api/public/areas/${publicId}`);
    return res.data;
  },
  getPublicProblem: async (publicId: string): Promise<any> => {
    const res = await API.get(`/api/public/problems/${publicId}`);
    return res.data;
  },
  getPublicSolutions: async (problemPublicId: string): Promise<any> => {
    const res = await API.get(`/api/public/solutions/${problemPublicId}`);
    return res.data;
  },
  getPublicProblemModules: async (problemPublicId: string): Promise<any> => {
    const res = await API.get(`/api/public/problems/${problemPublicId}/modules`);
    return res.data;
  },
  getPublicModuleSolution: async (modulePublicId: string): Promise<any> => {
    const res = await API.get(`/api/public/modules/${modulePublicId}/solutions`);
    return res.data;
  },
  getPublicSolutionDetail: async (solutionPublicId: string): Promise<any> => {
    const res = await API.get(`/api/public/solutions/detail/${solutionPublicId}`);
    return res.data;
  },

  // Technology Ecosystem
  getTechnologies: async (): Promise<any[]> => {
    const res = await API.get('/api/technologies');
    return res.data.technologies || [];
  },
  getAdminTechnologies: async (): Promise<any[]> => {
    const res = await API.get('/api/admin/technologies');
    return res.data.technologies || [];
  },
  saveAdminTechnology: async (tech: any): Promise<any> => {
    const res = await API.post('/api/admin/technologies', tech);
    return res.data;
  },
  deleteAdminTechnology: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/admin/technologies/${id}`);
    return res.data;
  },
  reorderAdminTechnologies: async (orderedIds: string[]): Promise<any> => {
    const res = await API.post('/api/admin/technologies/reorder', { orderedIds });
    return res.data;
  },
  getTechnologyCategories: async (): Promise<any[]> => {
    const res = await API.get('/api/admin/technology-categories');
    return res.data.categories || [];
  },
  addTechnologyCategory: async (name: string): Promise<any> => {
    const res = await API.post('/api/admin/technology-categories', { name });
    return res.data.category;
  },

  // Testimonials Module
  getTestimonials: async (): Promise<TestimonialItem[]> => {
    const res = await API.get('/api/testimonials');
    return res.data.testimonials || [];
  },
  getAdminTestimonials: async (): Promise<TestimonialItem[]> => {
    const res = await API.get('/api/admin/testimonials');
    return res.data.testimonials || [];
  },
  saveAdminTestimonial: async (item: any): Promise<any> => {
    const res = await API.post('/api/admin/testimonials', item);
    return res.data;
  },
  deleteAdminTestimonial: async (id: string): Promise<any> => {
    const res = await API.delete(`/api/admin/testimonials/${id}`);
    return res.data;
  },
  reorderAdminTestimonials: async (orderedIds: string[]): Promise<any> => {
    const res = await API.post('/api/admin/testimonials/reorder', { orderedIds });
    return res.data;
  }
};


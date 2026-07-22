import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ThemeSettings, HeaderSettings, FooterSettings, Page, Product } from '../../types';
import { apiService } from '../Services/api';
import {
  PageContainer,
  PageBreadcrumb,
  PageHero,
  HierarchyGrid,
  HierarchyCard,
  EmptyState
} from './HierarchyDesignSystem';

interface ViewProps {
  theme: ThemeSettings;
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  pages: Page[];
  products: Product[];
  isAdminLoggedIn: boolean;
  onRefresh: () => void;
}

// 1. DynamicIndustryView - Level 1 in Hierarchy
export function DynamicIndustryView({
  theme,
  headerSettings,
  footerSettings,
  isAdminLoggedIn
}: ViewProps) {
  const { industryPublicId } = useParams<{ industryPublicId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['publicIndustry', industryPublicId],
    queryFn: () => apiService.getPublicIndustry(industryPublicId!),
    enabled: !!industryPublicId,
  });

  const industry = data?.industry;
  const filteredInstitutions = data?.institutions || [];

  const breadcrumbItems = industry ? [
    { label: 'Industries' },
    { label: industry.name || industry.title }
  ] : [];

  return (
    <PageContainer
      theme={theme}
      headerSettings={headerSettings}
      footerSettings={footerSettings}
      isAdminLoggedIn={isAdminLoggedIn}
      isLoading={isLoading}
      errorMsg={!industry ? "The requested industry sector could not be retrieved from active CMS configurations." : null}
      loadingText="Loading sector information..."
    >
      {industry && (
        <>
          <PageBreadcrumb items={breadcrumbItems} />
          
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-16">
            <PageHero
              title={industry.name || industry.title}
              subtitle="Select the type of Institution"
            />

            <HierarchyGrid>
              {filteredInstitutions.map((item: any, idx: number) => (
                <HierarchyCard
                  key={item.id || idx}
                  title={item.name || item.title}
                  description={item.shortDescription || item.description || item.desc || 'Primary, Secondary & Higher Education'}
                  imageSrc={item.coverImage || item.image || item.cardImage}
                  iconName={item.icon}
                  onClick={() => navigate(`/industries/${industryPublicId}/${item.publicId}`)}
                />
              ))}

              {filteredInstitutions.length === 0 && (
                <EmptyState
                  iconName="Layers"
                  title="No Institutions Found"
                  description="Every industry-institution category pairing is dynamic. Link institutions to this module from the Admin Panel."
                />
              )}
            </HierarchyGrid>
          </div>
        </>
      )}
    </PageContainer>
  );
}

// 2. DynamicInstitutionView - Level 2 in Hierarchy
export function DynamicInstitutionView({
  theme,
  headerSettings,
  footerSettings,
  isAdminLoggedIn
}: ViewProps) {
  const { industryPublicId, institutionPublicId } = useParams<{ industryPublicId: string; institutionPublicId: string }>();
  const navigate = useNavigate();

  const { data: industryData } = useQuery({
    queryKey: ['publicIndustry', industryPublicId],
    queryFn: () => apiService.getPublicIndustry(industryPublicId!),
    enabled: !!industryPublicId,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['publicInstitution', institutionPublicId],
    queryFn: () => apiService.getPublicInstitution(institutionPublicId!),
    enabled: !!institutionPublicId,
  });

  const industry = industryData?.industry;
  const institution = data?.institution;
  const areas = data?.areas || [];

  const breadcrumbItems = (industry && institution) ? [
    { label: industry.name || industry.title, to: `/industries/${industryPublicId}` },
    { label: institution.name || institution.title }
  ] : [];

  const hasConfig = industry && institution;

  return (
    <PageContainer
      theme={theme}
      headerSettings={headerSettings}
      footerSettings={footerSettings}
      isAdminLoggedIn={isAdminLoggedIn}
      isLoading={isLoading}
      errorMsg={!hasConfig ? "The requested institution sector details are not configured on the live database." : null}
      loadingText="Loading institution details..."
    >
      {hasConfig && (
        <>
          <PageBreadcrumb items={breadcrumbItems} />
          
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-16">
            <PageHero
              title={`${institution.name || institution.title} Zone Selector`}
              subtitle={institution.description || institution.desc || 'Select the critical vulnerability zone or location within your facility.'}
              iconName={institution.icon || 'Building2'}
            />

            <HierarchyGrid>
              {areas.map((item: any, idx: number) => (
                <HierarchyCard
                  key={item.id || idx}
                  title={item.name}
                  description={item.description || 'Facility Premises Zone'}
                  imageSrc={item.coverImage || item.image}
                  iconName="MapPin"
                  onClick={() => navigate(`/industries/${industryPublicId}/${institutionPublicId}/${item.publicId}`)}
                />
              ))}

              {areas.length === 0 && (
                <EmptyState
                  iconName="Layers"
                  title="No Areas Found"
                  description="There are no active Zones or areas configured for this Institution. Please create them from the Admin panel."
                />
              )}
            </HierarchyGrid>
          </div>
        </>
      )}
    </PageContainer>
  );
}

// 3. DynamicZoneView - Level 3 in Hierarchy (Displays Problems with RED theme hover)
export function DynamicZoneView({
  theme,
  headerSettings,
  footerSettings,
  isAdminLoggedIn
}: ViewProps) {
  const { industryPublicId, institutionPublicId, areaPublicId } = useParams<{ industryPublicId: string; institutionPublicId: string; areaPublicId: string }>();
  const navigate = useNavigate();

  const { data: industryData } = useQuery({
    queryKey: ['publicIndustry', industryPublicId],
    queryFn: () => apiService.getPublicIndustry(industryPublicId!),
    enabled: !!industryPublicId,
  });

  const { data: institutionData } = useQuery({
    queryKey: ['publicInstitution', institutionPublicId],
    queryFn: () => apiService.getPublicInstitution(institutionPublicId!),
    enabled: !!institutionPublicId,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['publicArea', areaPublicId],
    queryFn: () => apiService.getPublicArea(areaPublicId!),
    enabled: !!areaPublicId,
  });

  const industry = industryData?.industry;
  const institution = institutionData?.institution;
  const area = data?.area;
  const problems = data?.problems || [];

  const breadcrumbItems = (industry && institution && area) ? [
    { label: industry.name || industry.title, to: `/industries/${industryPublicId}` },
    { label: institution.name || institution.title, to: `/industries/${industryPublicId}/${institutionPublicId}` },
    { label: area.name }
  ] : [];

  const hasConfig = industry && institution && area;

  return (
    <PageContainer
      theme={theme}
      headerSettings={headerSettings}
      footerSettings={footerSettings}
      isAdminLoggedIn={isAdminLoggedIn}
      isLoading={isLoading}
      errorMsg={!hasConfig ? "The requested zone details could not be found or loaded correctly." : null}
      loadingText="Loading security issues..."
    >
      {hasConfig && (
        <>
          <PageBreadcrumb items={breadcrumbItems} />
          
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-16">
            <PageHero
              title="Select the Vulnerability / Problem"
              subtitle="Choose an operational challenge to see our tailored AI-powered solution."
              iconName="MapPin"
            />

            <HierarchyGrid>
              {problems.map((item: any, idx: number) => (
                <HierarchyCard
                  key={item.id || idx}
                  title={item.name}
                  description={item.description || 'Operational security vulnerability.'}
                  iconName="AlertTriangle"
                  onClick={() => navigate(`/industries/${industryPublicId}/${institutionPublicId}/${areaPublicId}/${item.publicId}`)}
                  isRedTheme={true} // Problem page elements use red theme
                />
              ))}

              {problems.length === 0 && (
                <EmptyState
                  iconName="AlertTriangle"
                  title="No Problems Found"
                  description="No vulnerabilities or challenges currently configured for this zone."
                  isRedTheme={true}
                />
              )}
            </HierarchyGrid>
          </div>
        </>
      )}
    </PageContainer>
  );
}

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ThemeSettings, HeaderSettings, FooterSettings } from '../../types';
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
  isAdminLoggedIn: boolean;
}

export default function DynamicProblemModulesView({
  theme,
  headerSettings,
  footerSettings,
  isAdminLoggedIn
}: ViewProps) {
  const { industryPublicId, institutionPublicId, areaPublicId, problemPublicId } = useParams<{
    industryPublicId: string;
    institutionPublicId: string;
    areaPublicId: string;
    problemPublicId: string;
  }>();
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

  const { data: areaData } = useQuery({
    queryKey: ['publicArea', areaPublicId],
    queryFn: () => apiService.getPublicArea(areaPublicId!),
    enabled: !!areaPublicId,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['publicProblemModules', problemPublicId],
    queryFn: () => apiService.getPublicProblemModules(problemPublicId!),
    enabled: !!problemPublicId,
  });

  const industry = industryData?.industry;
  const institution = institutionData?.institution;
  const area = areaData?.area;
  const problem = data?.problem;
  const modules = data?.modules || [];

  // Robust SEO generation for the Problem Modules list page
  useEffect(() => {
    if (!problem) return;

    const seoTitle = problem.seo?.metaTitle || `${problem.name} - Modules & AI Solutions | NX Solution`;
    const seoDesc = problem.seo?.metaDescription || `Explore specific AI-powered modules and engineering blueprints for solving ${problem.name} in enterprise workflows.`;
    const seoKeywords = problem.seo?.keywords || `${problem.name.toLowerCase()}, security modules, ai integration, NX Solution`;

    document.title = seoTitle;

    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', seoDesc);

    let keywordsTag = document.querySelector('meta[name="keywords"]');
    if (!keywordsTag) {
      keywordsTag = document.createElement('meta');
      keywordsTag.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsTag);
    }
    keywordsTag.setAttribute('content', seoKeywords);
  }, [problem]);

  const hasConfig = industry && institution && area && problem;

  const breadcrumbItems = hasConfig ? [
    { label: industry.name || industry.title, to: `/industries/${industryPublicId}` },
    { label: institution.name || institution.title, to: `/industries/${industryPublicId}/${institutionPublicId}` },
    { label: area.name, to: `/industries/${industryPublicId}/${institutionPublicId}/${areaPublicId}` },
    { label: problem.name }
  ] : [];

  return (
    <PageContainer
      theme={theme}
      headerSettings={headerSettings}
      footerSettings={footerSettings}
      isAdminLoggedIn={isAdminLoggedIn}
      isLoading={isLoading}
      errorMsg={!hasConfig ? "The requested operational problem details could not be found or loaded correctly." : null}
      loadingText="Loading solutions modules..."
    >
      {hasConfig && (
        <>
          <PageBreadcrumb items={breadcrumbItems} />
          
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-16">
            <PageHero
              title="Select a Solution Module"
              subtitle={`Our AI workflow is split into specialized modular blocks designed to automate threat identification and process execution for ${problem.name}.`}
              iconName="Cpu"
            />

            <HierarchyGrid>
              {modules.map((item: any, idx: number) => (
                <HierarchyCard
                  key={item.id || idx}
                  title={item.name}
                  description={item.shortDescription || item.description || 'Enterprise modular security sub-system.'}
                  iconName={item.icon || 'Cpu'}
                  onClick={() => navigate(`/industries/${industryPublicId}/${institutionPublicId}/${areaPublicId}/${problemPublicId}/${item.publicId || item.slug || item.id}`)}
                />
              ))}

              {modules.length === 0 && (
                <EmptyState
                  iconName="Cpu"
                  title="No Modules Configured Yet"
                  description="Administrator is currently compiling AI blueprints for this operational problem. Please check back shortly."
                />
              )}
            </HierarchyGrid>
          </div>
        </>
      )}
    </PageContainer>
  );
}

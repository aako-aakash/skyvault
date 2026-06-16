import React, { lazy, Suspense } from 'react';
import { useAppStore } from '@/store/useAppStore';

const ApplyPage      = lazy(() => import('@/pages/ApplyPage'));
const DashboardPage  = lazy(() => import('@/pages/DashboardPage'));
const CalculatorPage = lazy(() => import('@/pages/CalculatorPage'));

const PageFallback = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-10 h-10 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const Routes: React.FC = () => {
  const { page } = useAppStore();

  const pageMap = {
    apply:      ApplyPage,
    dashboard:  DashboardPage,
    calculator: CalculatorPage,
  };

  const PageComponent = pageMap[page] ?? ApplyPage;

  return (
    <Suspense fallback={<PageFallback />}>
      <PageComponent />
    </Suspense>
  );
};

export default Routes;

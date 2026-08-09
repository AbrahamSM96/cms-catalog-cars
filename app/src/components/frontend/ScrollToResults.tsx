'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function ScrollToResults() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there are any search/filter params
    const hasSearch = searchParams.get('search');
    const hasBrand = searchParams.get('brand');
    const hasTransmission = searchParams.get('transmission');
    const hasMinYear = searchParams.get('minYear');
    const hasMaxYear = searchParams.get('maxYear');

    const hasFilters = hasSearch || hasBrand || hasTransmission || hasMinYear || hasMaxYear;

    // If filters are active, scroll to results section
    if (hasFilters) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        const resultsSection = document.getElementById('cars');
        if (resultsSection) {
          // Scroll with some offset for better UX
          const yOffset = -20; // 20px offset from top
          const y = resultsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150);
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}

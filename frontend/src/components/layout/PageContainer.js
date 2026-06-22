import React from 'react';

/**
 * PageContainer - Consistent page layout wrapper
 * 
 * Features:
 * - Consistent padding at all breakpoints
 * - Max-width constraint for readability (prevents text from stretching too wide)
 * - Background gradient for visual depth
 * - Responsive spacing that adapts to screen size
 * - Centered content with proper margins
 * 
 * Requirements: 3.4, 7.1, 7.2
 * 
 * Usage:
 * <PageContainer>
 *   <YourPageContent />
 * </PageContainer>
 */
const PageContainer = ({ 
  children, 
  nav,
  className = '',
  maxWidth = 'max-w-7xl', // Default max-width, can be overridden
  noPadding = false, // Allow disabling padding for full-width content
}) => {
  return (
    <div className="min-h-screen bg-canvas">
      {nav && <div>{nav}</div>}
      <main
        className={`
          mx-auto
          ${maxWidth}
          ${noPadding ? '' : 'px-4 sm:px-6 lg:px-8'}
          ${noPadding ? '' : 'py-6 sm:pt-28 sm:pb-8 lg:pt-28 lg:pb-12'}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      >
        {children}
      </main>
    </div>
  );
};

export default PageContainer;

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getVisiblePages = (current: number, total: number) => {
  const pages: (number | string)[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 4) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== total) pages.push(i);
    }
    if (current < total - 3) pages.push('...');
    if (total > 1) pages.push(total);
  }
  return pages;
};

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const visiblePages = getVisiblePages(currentPage, totalPages);
  
  return (
    <div className="flex items-center justify-center space-x-2 py-6">
      {/* Previous Button - Clean & Compact */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 bg-gray-800 border border-gray-600 shadow-md hover:shadow-lg hover:scale-102 hover:border-gray-500 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous Page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Page Numbers - Compact */}
      {visiblePages.map((page, index) =>
        page === '...'
          ? (
            <span key={index} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
              ...
            </span>
          )
          : (
            <button
              key={page}
              onClick={() => onPageChange(Number(page))}
              className={
                currentPage === page
                  ? "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold bg-blue-600 border border-blue-500 text-white shadow-lg transition-all duration-200"
                  : "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium bg-gray-800 border border-gray-600 text-gray-300 shadow-md hover:shadow-lg hover:scale-102 hover:border-blue-500 hover:text-white hover:bg-gray-700 transition-all duration-200"
              }
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
      )}
      
      {/* Next Button - Clean & Compact */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 bg-gray-800 border border-gray-600 shadow-md hover:shadow-lg hover:scale-102 hover:border-gray-500 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next Page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}; 
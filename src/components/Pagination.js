import React from 'react';
import { FaChevronLeft, FaChevronRight, FaEllipsisH } from 'react-icons/fa';

const Pagination = ({ 
  currentPage = 0, 
  totalPages = 1, 
  totalElements = 0, 
  size = 12, 
  onPageChange, 
  isLoading = false 
}) => {
  
  // Ensure all values are numbers
  const safePage = Number(currentPage) || 0;
  const safeTotal = Number(totalPages) || 1;
  const safeElements = Number(totalElements) || 0;
  const safeSize = Number(size) || 12;
  
  // Don't show pagination if there's only one page or no data
  if (safeTotal <= 1) return null;

  const startItem = safePage * safeSize + 1;
  const endItem = Math.min((safePage + 1) * safeSize, safeElements);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(0, safePage - delta); 
         i <= Math.min(safeTotal - 1, safePage + delta); 
         i++) {
      range.push(i);
    }

    if (range[0] > 1) {
      rangeWithDots.push(0);
      if (range[0] > 2) {
        rangeWithDots.push('...');
      }
    }

    rangeWithDots.push(...range);

    if (range[range.length - 1] < safeTotal - 2) {
      if (range[range.length - 1] < safeTotal - 3) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(safeTotal - 1);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center space-y-4 mt-8">
      {/* Results info */}
      <div className="text-sm text-gray-300 text-center">
        <span className="font-medium">{startItem}</span>
        {' - '}
        <span className="font-medium">{endItem}</span>
        {' / '}
        <span className="font-medium">{safeElements}</span>
        {' sonuç gösteriliyor'}
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center space-x-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 0 || isLoading}
          className={`
            flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
            ${safePage === 0 || isLoading
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-primary-500'
            }
          `}
        >
          <FaChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === '...') {
            return (
              <div
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-10 h-10 text-gray-400"
              >
                <FaEllipsisH className="w-4 h-4" />
              </div>
            );
          }

          const isActive = pageNumber === safePage;
          
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              disabled={isLoading}
              className={`
                flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 font-medium
                ${isActive
                  ? 'bg-primary-500 text-white shadow-lg scale-105'
                  : isLoading
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-primary-500'
                }
              `}
            >
              {pageNumber + 1}
            </button>
          );
        })}

        {/* Next button */}
        <button
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safeTotal - 1 || isLoading}
          className={`
            flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
            ${safePage >= safeTotal - 1 || isLoading
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-primary-500'
            }
          `}
        >
          <FaChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Yükleniyor...</span>
        </div>
      )}
    </div>
  );
};

export default Pagination; 
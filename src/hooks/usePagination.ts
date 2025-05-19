//src/hooks/usePagination.ts

import { useState, useMemo } from 'react';

interface PaginationOptions {
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

export function usePagination<T>(items: T[], options: PaginationOptions = {}) {
  const {
    defaultPageSize = 10,
    pageSizeOptions = [10, 25, 50, -1] // -1 represents "All"
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(items.length / pageSize);
  
  const paginatedItems = useMemo(() => {
    if (pageSize === -1) return items;
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  // Reset to first page when items or pageSize changes
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [items.length, pageSize, totalPages, currentPage]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedItems,
    pageSizeOptions
  };
}
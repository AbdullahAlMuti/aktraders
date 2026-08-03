import { useState } from "react";

export function usePagination(totalItems: number, initialPageSize: number = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const goToPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return {
    page,
    pageSize,
    totalPages,
    setPage: goToPage,
    setPageSize,
    nextPage,
    prevPage,
    canNext: page < totalPages,
    canPrev: page > 1,
  };
}

"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: Array<number | "..."> = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("mt-8 flex items-center justify-center gap-2", className)}>
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition disabled:opacity-30 disabled:pointer-events-none hover:bg-gray-50"
        aria-label="Trang trước"
      >
        ←
      </button>
      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center text-body-md font-light text-gray-400"
            >
              ...
            </span>
          );
        }

        return (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-body-md font-medium transition",
              currentPage === page
                ? "bg-black text-white"
                : "border border-gray-200 bg-white text-black hover:bg-gray-50",
            )}
          >
            {page}
          </button>
        );
      })}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition disabled:opacity-30 disabled:pointer-events-none hover:bg-gray-50"
        aria-label="Trang sau"
      >
        →
      </button>
    </div>
  );
}

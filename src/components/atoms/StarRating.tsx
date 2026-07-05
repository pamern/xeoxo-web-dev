import React from "react";

interface StarRatingProps {
  rating: number; // e.g. 4.5
  maxStars?: number;
  className?: string;
  size?: number; // width and height in px
}

export function StarRating({
  rating,
  maxStars = 5,
  className = "",
  size = 20,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className={`flex items-center gap-0.5 text-black ${className}`}>
      {Array.from({ length: maxStars }).map((_, index) => {
        if (index < fullStars) {
          // Full Star SVG
          return (
            <svg
              key={index}
              width={size}
              height={size}
              className="fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          );
        }
        if (index === fullStars && hasHalfStar) {
          // Half Star SVG using unique gradient ID
          const gradientId = `half-star-grad-${rating}-${index}`;
          return (
            <svg
              key={index}
              width={size}
              height={size}
              viewBox="0 0 24 24"
            >
              <defs>
                <linearGradient id={gradientId}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="#d1d5db" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#${gradientId})`}
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          );
        }
        // Empty Star SVG
        return (
          <svg
            key={index}
            width={size}
            height={size}
            className="text-gray-300 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      })}
    </div>
  );
}

import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * Tailwind đọc design token từ CSS variables (định nghĩa trong globals.css).
 * Đổi theme chỉ cần sửa biến CSS, không phải sửa component.
 */
const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--color-background))",
        foreground: "hsl(var(--color-foreground))",
        primary: {
          DEFAULT: "hsl(var(--color-primary))",
          foreground: "hsl(var(--color-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary))",
          foreground: "hsl(var(--color-secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--color-muted))",
          foreground: "hsl(var(--color-muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--color-destructive))",
          foreground: "hsl(var(--color-destructive-foreground))",
        },
        border: "hsl(var(--color-border))",
        input: "hsl(var(--color-input))",
        ring: "hsl(var(--color-ring))",
        card: {
          DEFAULT: "hsl(var(--color-card))",
          foreground: "hsl(var(--color-card-foreground))",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        pill: "var(--radius-pill)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
      },
      maxWidth: {
        site: "1728px",
      },
      boxShadow: {
        card: "0px 4px 4px 0px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".text-shadow": { textShadow: "0px 4px 4px rgba(0,0,0,1)" },
        ".text-shadow-soft": { textShadow: "0px 4px 20px rgba(0,0,0,0.5)" },
      });
    }),
  ],
};

export default config;

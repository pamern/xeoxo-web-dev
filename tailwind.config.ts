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
        accent: {
          DEFAULT: "hsl(var(--color-accent))",
          foreground: "hsl(var(--color-accent-foreground))",
          muted: "hsl(var(--color-accent-muted))",
          strong: "hsl(var(--color-accent-strong))",
        },
        action: "hsl(var(--color-action))",
        success: {
          DEFAULT: "hsl(var(--color-success))",
          foreground: "hsl(var(--color-success-foreground))",
          muted: "hsl(var(--color-success-muted))",
        },
        border: {
          DEFAULT: "hsl(var(--color-border))",
          strong: "hsl(var(--color-border-strong))",
        },
        input: "hsl(var(--color-input))",
        ring: "hsl(var(--color-ring))",
        card: {
          DEFAULT: "hsl(var(--color-card))",
          foreground: "hsl(var(--color-card-foreground))",
        },
      },
      borderRadius: {
        xs: "3px",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        card: "14px",
        panel: "var(--radius-panel)",
        pill: "var(--radius-pill)",
      },
      spacing: {
        gutter: "var(--site-gutter-x-lg)",
      },
      height: {
        control: "var(--control-height)",
      },
      minHeight: {
        control: "var(--control-height)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      fontSize: {
        "display-section": ["2.25rem", { lineHeight: "1.1", letterSpacing: "0", fontWeight: "800" }],
        "heading-section": ["1.5rem", { lineHeight: "1.16", letterSpacing: "0", fontWeight: "700" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "300" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "400" }],
      },
      maxWidth: {
        site: "1728px",
        content: "1240px",
        auth: "1068px",
        policy: "1527px",
        form: "760px",
        narrow: "438px",
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

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
        section: "var(--section-gap-y)",
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
        "display-hero": ["clamp(34px, 16.86px + 1.34vw, 40px)", { lineHeight: "1.02", letterSpacing: "0", fontWeight: "800" }],
        "display-hero-sub": ["clamp(18px, 12.29px + 0.45vw, 20px)", { lineHeight: "1.16", letterSpacing: "0", fontWeight: "500" }],
        "display-page": ["clamp(30px, 21.43px + 0.67vw, 33px)", { lineHeight: "1.18", letterSpacing: "0", fontWeight: "700" }],
        "display-section": ["clamp(26px, 17.43px + 0.67vw, 29px)", { lineHeight: "1.1", letterSpacing: "0", fontWeight: "800" }],
        "heading-section": ["clamp(20px, 14.29px + 0.45vw, 22px)", { lineHeight: "1.16", letterSpacing: "0", fontWeight: "700" }],
        "heading-card": ["clamp(18px, 16.34px + 0.44vw, 24px)", { lineHeight: "1.25", letterSpacing: "0", fontWeight: "700" }],
        "heading-content-sm": ["clamp(16px, 15.45px + 0.15vw, 18px)", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "700" }],
        "heading-content": ["clamp(18px, 16.89px + 0.30vw, 22px)", { lineHeight: "1.45", letterSpacing: "0", fontWeight: "700" }],
        "heading-feature": ["clamp(20px, 17.78px + 0.59vw, 28px)", { lineHeight: "1.3", letterSpacing: "0", fontWeight: "700" }],
        "nav-utility": ["clamp(11px, 8.14px + 0.22vw, 12px)", { lineHeight: "1.05", letterSpacing: "0", fontWeight: "600" }],
        nav: ["clamp(14px, 8.29px + 0.45vw, 16px)", { lineHeight: "1.08", letterSpacing: "0", fontWeight: "500" }],
        "button-sm": ["13px", { lineHeight: "1.15", letterSpacing: "0", fontWeight: "500" }],
        button: ["clamp(15px, 9.29px + 0.45vw, 17px)", { lineHeight: "1.12", letterSpacing: "0", fontWeight: "500" }],
        "button-lg": ["clamp(18px, 16.89px + 0.30vw, 22px)", { lineHeight: "1.12", letterSpacing: "0", fontWeight: "700" }],
        "button-xl": ["clamp(20px, 18.34px + 0.44vw, 26px)", { lineHeight: "1.08", letterSpacing: "0", fontWeight: "700" }],
        "button-hero": ["clamp(14px, 8.29px + 0.45vw, 16px)", { lineHeight: "1.08", letterSpacing: "0", fontWeight: "800" }],
        eyebrow: ["clamp(17px, 15.61px + 0.37vw, 22px)", { lineHeight: "1.3", letterSpacing: "0", fontWeight: "400" }],
        "body-xl": ["clamp(20px, 18.61px + 0.37vw, 25px)", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "body-lg": ["clamp(16px, 15.45px + 0.15vw, 18px)", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        body: ["15px", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "300" }],
        "quote-lg": ["clamp(20px, 18.34px + 0.44vw, 26px)", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "300" }],
        quote: ["15px", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "300" }],
        "body-sm": ["13px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "300" }],
        caption: ["12px", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "400" }],
        field: ["15px", { lineHeight: "1.45", letterSpacing: "0", fontWeight: "400" }],
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

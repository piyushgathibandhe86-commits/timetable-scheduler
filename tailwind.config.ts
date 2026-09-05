import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--surface-page)",
        card: "var(--surface-card)",
        muted: "var(--surface-muted)",
        accent: "var(--accent)",
        "accent-muted": "var(--accent-muted)",
        danger: "var(--danger)",
        "danger-muted": "var(--danger-muted)",
        success: "var(--success)",
        "success-muted": "var(--success-muted)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
        strong: "var(--border-strong)",
      },
      fontSize: {
        h1: ["28px", { lineHeight: "1.3", fontWeight: "500" }],
        h2: ["20px", { lineHeight: "1.3", fontWeight: "500" }],
        h3: ["16px", { lineHeight: "1.3", fontWeight: "500" }],
        body: ["15px", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        grid: ["13px", { lineHeight: "1.2" }],
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Anthropic Sans",
          "sans-serif",
        ],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        none: "none",
        float: "var(--shadow-float)",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
        12: "48px",
        16: "64px",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};
export default config;

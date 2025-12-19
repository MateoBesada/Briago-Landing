/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--color-background))",
        foreground: "hsl(var(--color-foreground))",
        border: "hsl(var(--color-border))",
        input: "hsl(var(--color-input))",
        ring: "hsl(var(--color-ring))",
        card: "hsl(var(--color-card))",
        "card-foreground": "hsl(var(--color-card-foreground))",
        popover: "hsl(var(--color-popover))",
        "popover-foreground": "hsl(var(--color-popover-foreground))",
        primary: "hsl(var(--color-primary))",
        "primary-foreground": "hsl(var(--color-primary-foreground))",
        secondary: "hsl(var(--color-secondary))",
        "secondary-foreground": "hsl(var(--color-secondary-foreground))",
        muted: "hsl(var(--color-muted))",
        "muted-foreground": "hsl(var(--color-muted-foreground))",
        accent: "hsl(var(--color-accent))",
        "accent-foreground": "hsl(var(--color-accent-foreground))",
        destructive: "hsl(var(--color-destructive))",
        sidebar: "hsl(var(--color-sidebar))",
        "sidebar-foreground": "hsl(var(--color-sidebar-foreground))",
        "sidebar-primary": "hsl(var(--color-sidebar-primary))",
        "sidebar-primary-foreground": "hsl(var(--color-sidebar-primary-foreground))",
        "sidebar-accent": "hsl(var(--color-sidebar-accent))",
        "sidebar-accent-foreground": "hsl(var(--color-sidebar-accent-foreground))",
        "sidebar-border": "hsl(var(--color-sidebar-border))",
        "sidebar-ring": "hsl(var(--color-sidebar-ring))",
        briago: {
          yellow: "#fff03b", // Primary Brand Yellow
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        gotham: ["gotham", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scrollMarquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        cartelIn: {
          "0%": { opacity: "0", transform: "translateY(30px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        bounceSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        "cartel-in": "cartelIn 0.6s ease-out forwards",
        "bounce-slow": "bounceSlow 1.5s infinite",
        fadeIn: "fadeIn 0.3s ease-out forwards",
        wiggle: "wiggle 0.3s ease-in-out",
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    plugin(({ addUtilities }) => {
      addUtilities({
        ".custom-scrollbar::-webkit-scrollbar": {
          width: "6px",
        },
        ".custom-scrollbar::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: "3px",
        },
        ".custom-scrollbar::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
      });
    }),
  ],
};
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      gray: "#e2e8f0",
      white: "#ffffff",
      black: "#000000",
      uiblack: "#2b2b2b",
      uiwhite: "#faf9f6",
      uired: "#f01e27",
      uigreen: "#13dd88",
      glueBlue: "#10069f",
      blue: {
        100: "#E6F0FF",
        500: "#3B82F6",
        600: "#2563EB",
        800: "#1E40AF",
      },
      purple: {
        50: "#F5F3FF",
        500: "#8B5CF6",
        600: "#7C3AED",
      },
      green: {
        50: "#F0FDF4",
        500: "#22C55E",
        600: "#16A34A",
      },
      yellow: {
        50: "#FEFCE8",
        500: "#EAB308",
        600: "#CA8A04",
      },
      red: {
        500: "#EF4444",
        600: "#DC2626",
      },
      pink: {
        50: "#FDF2F8",
        500: "#EC4899",
        600: "#DB2777",
      },
      orange: {
        50: "#FFF7ED",
        500: "#F97316",
        600: "#EA580C",
      },
      indigo: {
        50: "#EEF2FF",
        500: "#6366F1",
        600: "#4F46E5",
      },
    },
    extend: {
      scrollBehavior: ["smooth"],
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ping-slow": "ping 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        accent: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        ink: "#0f172a",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(79, 70, 229, 0.06)",
        "card-hover": "0 4px 8px rgba(15, 23, 42, 0.06), 0 12px 32px rgba(79, 70, 229, 0.1)",
        nav: "4px 0 24px rgba(15, 23, 42, 0.06)",
        "card-dark":
          "0 1px 2px rgba(0, 0, 0, 0.35), 0 4px 20px rgba(99, 102, 241, 0.12)",
        "card-hover-dark": "0 4px 12px rgba(0, 0, 0, 0.4), 0 12px 36px rgba(99, 102, 241, 0.18)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};

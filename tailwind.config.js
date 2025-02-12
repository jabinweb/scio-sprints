/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Custom brand colors
        'brand-blue': '#4B9DCE',
        'brand-green': '#4CAE54',
        'brand-blue-light': '#7BB8DE',
        'brand-green-light': '#6FC575',
        'brand-blue-dark': '#3A7BA0',
        'brand-green-dark': '#3B8842',
        
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ...rest of the existing colors...
      },
      // ...rest of the existing config...
    },
  },
  // ...plugins...
}

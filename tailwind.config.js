/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
        'orange-01': '#FDC381',
        'orange-02': '#F6993A',
        'orange-03': '#C26B0B',
        'orange-04': '#7D4100',
        'orange-05': '#6B3700',
        'blue-01': '#A7D5FD',
        'blue-02': '#69ACE9',
        'blue-03': '#2E729E',
        'blue-04': '#16415D',
        'blue-05': '#13364E',
        'green-01': '#DEFD86',
        'green-02': '#BCF51D',
        'green-03': '#7CA605',
        'green-04': '#495D12',
        'green-05': '#3D4B16',
        'pink-01': '#F0ADC1',
        'pink-02': '#F080A1',
        'pink-03': '#AD516C',
        'pink-04': '#7C2E45',
        'pink-05': '#73263D',
        'gray-01': '#F7F7F7',
        'gray-02': '#E1E1E1',
        'gray-03': '#A5A5A5',
        'gray-04': '#444444',
        'gray-05': '#191919',
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
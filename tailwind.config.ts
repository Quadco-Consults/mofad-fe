import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors using CSS variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          // MOFAD Primary Brand Colors (Dark Green #1F4224)
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1F4224', // Main MOFAD green
          600: '#1a3820',
          700: '#152e1a',
          800: '#102415',
          900: '#0c1a10',
          950: '#060d08',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          // MOFAD Secondary Brand Colors (Gold #D0A33E)
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#D0A33E', // Main MOFAD gold
          500: '#c49535',
          600: '#a67c2e',
          700: '#876426',
          800: '#6b4f1f',
          900: '#4f3a17',
          950: '#33250f',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          // MOFAD Accent Colors (Gold highlights)
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#D0A33E',
          500: '#c49535',
          600: '#a67c2e',
          700: '#876426',
          800: '#6b4f1f',
          900: '#4f3a17',
          950: '#33250f',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // MOFAD Brand Colors
        mofad: {
          primary: '#1F4224', // Dark green
          secondary: '#D0A33E', // Gold
          black: '#000000',
          gradient: {
            start: '#1F4224',
            end: '#D0A33E',
          },
          dark: '#152e1a',
          light: '#dcfce7',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        // MOFAD Brand Gradients
        'mofad-gradient': 'linear-gradient(45deg, #1F4224, #D0A33E)',
        'mofad-gradient-reverse': 'linear-gradient(225deg, #1F4224, #D0A33E)',
        'mofad-header': 'linear-gradient(135deg, #1F4224, #2d5a32, #D0A33E)',
        'mofad-full': 'linear-gradient(45deg, #1F4224, #2d5a32, #D0A33E, #000000)',
        'mofad-brand': 'linear-gradient(45deg, #1F4224, #D0A33E)',
        'mofad-subtle': 'linear-gradient(45deg, #f0fdf4, #fefce8)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'mofad': '0 4px 15px 0 rgba(31, 66, 36, 0.2)',
      },
    },
  },
  plugins: [],
}
export default config
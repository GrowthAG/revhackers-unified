
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '87.5rem'
			}
		},
		extend: {
			fontSize: {
				// Custom rem scale replacing px brackets
				'4xs': ['0.4375rem', { lineHeight: '0.625rem' }],   // 7px
				'3xs': ['0.5rem', { lineHeight: '0.75rem' }],       // 8px
				'2xs': ['0.5625rem', { lineHeight: '0.875rem' }],   // 9px
				'xxs': ['0.625rem', { lineHeight: '1rem' }],        // 10px
				'tiny': ['0.6875rem', { lineHeight: '1rem' }],      // 11px
				'mini': ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px
				'body': ['0.9375rem', { lineHeight: '1.5rem' }],    // 15px
				'reading': ['1.0625rem', { lineHeight: '1.75rem' }],// 17px
			},
			spacing: {
				// Pixel-precise spacing in rem for layout elements
				'0.25': '0.0625rem',  // 1px
				'0.375': '0.09375rem', // 1.5px
				'0.5': '0.125rem',    // 2px
				'0.75': '0.1875rem',  // 3px
				'1.25': '0.3125rem',  // 5px
				'4.5': '1.125rem',    // 18px
				'13': '3.25rem',      // 52px
				'15': '3.75rem',      // 60px
				'18': '4.5rem',       // 72px
				'25': '6.25rem',      // 100px
				'30': '7.5rem',       // 120px
			},
			maxWidth: {
				'page': '87.5rem',    // 1400px
				'content': '100rem',  // 1600px
			},
			fontFamily: {
				'sans': ['DM Sans', 'Inter', 'sans-serif'],
				'display': ['DM Sans', 'Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				revgreen: {
					DEFAULT: '#00CC6A',
					accent: '#00B85E'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-up': {
					"0%": { opacity: "0", transform: "translateY(20px)" },
					"100%": { opacity: "1", transform: "translateY(0)" }
				},
				'fade-in': {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-up': 'fade-up 0.5s ease-out forwards',
				'fade-in': 'fade-in 0.5s ease-out forwards',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

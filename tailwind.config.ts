
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
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Poppins', 'sans-serif'],
				'display': ['Poppins', 'sans-serif'],
				'body': ['Poppins', 'sans-serif'],
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
        revgreen: {
          DEFAULT: '#03FC3B', // Verde atualizado
          accent: '#03FC3B' // Verde de acento também atualizado
        },
        black: '#000000',
        white: '#FFFFFF',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
        'fade-in': {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        // Apple-inspired Keyframes
        'fadeUp': {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        'fadeIn': {
          "0%": {
            opacity: "0"
          },
          "100%": {
            opacity: "1"
          }
        },
        'slideInRight': {
          "0%": {
            opacity: "0",
            transform: "translateX(100px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)"
          }
        },
        'scaleIn': {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        'float': {
          "0%, 100%": {
            transform: "translateY(0)"
          },
          "50%": {
            transform: "translateY(-10px)"
          }
        },
        'glow': {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(3, 252, 59, 0.3)"
          },
          "50%": {
            boxShadow: "0 0 40px rgba(3, 252, 59, 0.6)"
          }
        },
        
        // Premium micro-interactions  
        'bounceGentle': {
          "0%, 20%, 53%, 80%, 100%": { transform: "translate3d(0,0,0)" },
          "40%, 43%": { transform: "translate3d(0, -8px, 0)" },
          "70%": { transform: "translate3d(0, -4px, 0)" },
          "90%": { transform: "translate3d(0, -2px, 0)" }
        },
        
        'pulseSoft': {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" }
        },
        
        'shimmer': {
          "0%": { backgroundPosition: "-200% 0%" },
          "100%": { backgroundPosition: "200% 0%" }
        },
        
        'gradientShift': {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        
        'slideInUp': {
          "0%": {
            opacity: "0",
            transform: "translateY(60px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },

        'shrinkProgress': {
          "0%": { width: "100%" },
          "100%": { width: "0%" }
        }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        // Apple-inspired Animations
        'fadeUp': 'fadeUp 0.6s ease-out',
        'fadeIn': 'fadeIn 0.8s ease-out',
        'slideInRight': 'slideInRight 0.6s ease-out',
        'scaleIn': 'scaleIn 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'fade-in-delayed': 'fadeIn 0.8s ease-out 0.2s both',
        'fade-up-delayed': 'fadeUp 0.6s ease-out 0.3s both',
        'scale-in-delayed': 'scaleIn 0.4s ease-out 0.4s both',
        
        // Premium micro-interactions
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
        'slide-in-up': 'slideInUp 0.8s ease-out',
        'slide-in-stagger': 'slideInUp 0.8s ease-out var(--stagger-delay, 0s) both',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shrink-progress': 'shrinkProgress 20s linear forwards'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

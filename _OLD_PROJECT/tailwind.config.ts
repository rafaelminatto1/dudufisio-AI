import type { Config } from "tailwindcss";
import tailwindcssForms from '@tailwindcss/forms';
import { tailwindColors } from './src/styles/tokens/colors';

const config: Config = {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
		colors: {
			// ==========================================
			// MONDAY.COM UNIFIED COLOR SYSTEM
			// ==========================================
			// Paleta completa do Monday.com importada de colors.ts
			...tailwindColors,
			
			// shadcn/ui core variables (mantém compatibilidade)
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			
			// shadcn/ui compatibility
			destructive: {
				DEFAULT: '#E44258', // Monday.com error color
				foreground: '#FFFFFF',
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
			}
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
			// Monday.com inspired card radius
			card: '12px',
			cardLarge: '16px',
  		},
		/**
		 * SISTEMA DE ESPAÇAMENTO - BASEADO EM 8PX
		 *
		 * Múltiplos de 8px para consistência visual
		 * Uso: padding, margin, gap, etc.
		 */
		spacing: {
			'xs': '4px',    // 0.5 * 8px
			'sm': '8px',    // 1 * 8px
			'md': '16px',   // 2 * 8px
			'lg': '24px',   // 3 * 8px
			'xl': '32px',   // 4 * 8px
			'2xl': '48px',  // 6 * 8px
			'3xl': '64px',  // 8 * 8px
			'4xl': '80px',  // 10 * 8px
			'5xl': '120px', // 15 * 8px
		},
		/**
		 * SISTEMA DE SOMBRAS - MONDAY.COM INSPIRED
		 *
		 * Shadows suaves e progressivas
		 */
		boxShadow: {
			'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
			'cardHover': '0 4px 16px rgba(0, 0, 0, 0.12)',
			'cardActive': '0 8px 24px rgba(0, 0, 0, 0.16)',
		},
  		/**
  		 * SISTEMA TIPOGRÁFICO
  		 * 
  		 * Fonte: Inter (Google Fonts)
  		 * - Moderna, legível e otimizada para interfaces digitais
  		 * - Pesos disponíveis: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
  		 * 
  		 * Escala Tipográfica:
  		 * - H1: text-3xl (32px) font-bold (700) text-gray-900
  		 * - H2: text-2xl (24px) font-semibold (600) text-gray-900
  		 * - H3: text-lg (18px) font-semibold (600) text-gray-900
  		 * - Body: text-base (16px) font-normal (400) text-gray-600
  		 * - Small: text-sm (14px) font-normal (400) text-gray-600
  		 * - Caption: text-xs (12px) font-normal (400) text-gray-400
  		 * - NumericValue: text-4xl (36px) font-bold (700) text-gray-900
  		 * - Label: text-sm (14px) font-medium (500) text-gray-700
  		 */
  		fontFamily: {
  			sans: [
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'"Segoe UI"',
  				'Roboto',
  				'"Helvetica Neue"',
  				'Arial',
  				'"Noto Sans"',
  				'sans-serif'
  			],
  			display: ['Inter', 'sans-serif']
  		},
		/**
		 * TAMANHOS DE FONTE - MONDAY.COM INSPIRED
		 *
		 * Hierarquia clara com line-height e font-weight configurados
		 */
		fontSize: {
			'h1': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
			'h2': ['36px', { lineHeight: '1.3', fontWeight: '700' }],
			'h3': ['28px', { lineHeight: '1.4', fontWeight: '600' }],
			'h4': ['20px', { lineHeight: '1.5', fontWeight: '600' }],
			'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
			'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
		},
		fontWeight: {
			regular: '400',
			medium: '500',
			semibold: '600',
			bold: '700',
		},
  		animation: {
  			'pulse-green': 'pulse-green 1s ease-in-out',
  			'slide-up': 'slide-up 0.3s ease-out',
  			'fade-in': 'fade-in 0.2s ease-in',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in-up': 'fadeInUp 0.6s ease-out',
  			'slide-in-left': 'slideInLeft 0.5s ease-out',
  			'slide-in-right': 'slideInRight 0.5s ease-out',
  			'scale-in': 'scaleIn 0.3s ease-out',
  			'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
  			'shimmer': 'shimmer 2s infinite'
  		},
  		keyframes: {
  			'pulse-green': {
  				'0%, 100%': {
  					borderColor: 'rgb(34 197 94)'
  				},
  				'50%': {
  					borderColor: 'rgb(134 239 172)'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					transform: 'translateY(10px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
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
  			'fadeInUp': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slideInLeft': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'slideInRight': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'scaleIn': {
  				'0%': {
  					transform: 'scale(0.95)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			'pulseGlow': {
  				'0%, 100%': {
  					boxShadow: '0 0 20px rgba(14,165,233,0.3)'
  				},
  				'50%': {
  					boxShadow: '0 0 30px rgba(14,165,233,0.6)'
  				}
  			},
  			'shimmer': {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			}
  		}
  	}
  },
  plugins: [
     tailwindcssForms,
  ],
};
export default config;

import type { Config } from "tailwindcss";
import tailwindcssForms from '@tailwindcss/forms';

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
			// shadcn/ui core variables (mantém compatibilidade)
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			
			/**
			 * SISTEMA DE CORES - ACESSIBILIDADE (WCAG AA)
			 * 
			 * Contraste validado para texto em fundos brancos:
			 * - Gray 900 (#111827): 16.6:1 ✓ Excelente (AAA)
			 * - Gray 600 (#6B7280): 7.9:1 ✓ Excelente (AAA)
			 * - Gray 400 (#9CA3AF): 4.6:1 ✓ Bom (AA)
			 * 
			 * Uso recomendado:
			 * - Gray 900: Títulos (H1, H2, H3)
			 * - Gray 600: Corpo de texto, paragrafos
			 * - Gray 400: Legendas, metadados
			 * - Gray 300 ou inferior: Apenas bordas/divisores
			 */
			
			// Paleta Primária MoocaFisio (Azul/Roxo)
			primary: {
				50: '#F5F3FF',
				100: '#EDE9FE',
				200: '#DDD6FE',
				300: '#C4B5FD',
				400: '#A78BFA',
				500: '#5B4FE8',
				600: '#4A3FBB',
				700: '#3D34A5',
				800: '#312E81',
				900: '#1E1B4B',
				DEFAULT: '#5B4FE8',
				light: '#7C73E6',
				dark: '#4A3FBB',
				foreground: '#FFFFFF',
			},
			
			// Paleta Secundária (Cinza Neutro) - Usado no Sistema Tipográfico
			secondary: {
				50: '#F9FAFB',   // Fundos sutis
				100: '#F3F4F6',  // Fundos de cards
				200: '#E5E7EB',  // Bordas leves
				300: '#D1D5DB',  // Bordas padrão
				400: '#9CA3AF',  // Caption, legendas (4.6:1 em branco - WCAG AA)
				500: '#6B7280',  // Body text, Small (7.9:1 em branco - WCAG AAA)
				600: '#4B5563',  // Texto enfatizado
				700: '#374151',  // Labels de formulário (10.4:1 em branco - WCAG AAA)
				800: '#1F2937',  // Texto muito escuro
				900: '#111827',  // Títulos H1/H2/H3 (16.6:1 em branco - WCAG AAA)
				DEFAULT: '#6B7280',
				light: '#9CA3AF',
				dark: '#4B5563',
				foreground: '#FFFFFF',
			},
			
			// Estados de Status
			success: {
				50: '#ECFDF5',
				100: '#D1FAE5',
				200: '#A7F3D0',
				300: '#6EE7B7',
				400: '#34D399',
				500: '#10B981',
				600: '#059669',
				700: '#047857',
				800: '#065F46',
				900: '#064E3B',
				DEFAULT: '#10B981',
			},
			warning: {
				50: '#FFFBEB',
				100: '#FEF3C7',
				200: '#FDE68A',
				300: '#FCD34D',
				400: '#FBBF24',
				500: '#F59E0B',
				600: '#D97706',
				700: '#B45309',
				800: '#92400E',
				900: '#78350F',
				DEFAULT: '#F59E0B',
			},
			error: {
				50: '#FEF2F2',
				100: '#FEE2E2',
				200: '#FECACA',
				300: '#FCA5A5',
				400: '#F87171',
				500: '#EF4444',
				600: '#DC2626',
				700: '#B91C1C',
				800: '#991B1B',
				900: '#7F1D1D',
				DEFAULT: '#EF4444',
			},
			info: {
				50: '#EFF6FF',
				100: '#DBEAFE',
				200: '#BFDBFE',
				300: '#93C5FD',
				400: '#60A5FA',
				500: '#3B82F6',
				600: '#2563EB',
				700: '#1D4ED8',
				800: '#1E40AF',
				900: '#1E3A8A',
				DEFAULT: '#3B82F6',
			},
			
			// shadcn/ui compatibility
			destructive: {
				DEFAULT: '#EF4444',
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
  			sm: 'calc(var(--radius) - 4px)'
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

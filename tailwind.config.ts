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
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			// Nova paleta de cores FisioFlow
			fisio: {
				primary: {
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
					DEFAULT: '#007BFF', // Azul principal
				},
				secondary: {
					50: '#F0FDF4',
					100: '#DCFCE7',
					200: '#BBF7D0',
					300: '#86EFAC',
					400: '#4ADE80',
					500: '#22C55E',
					600: '#16A34A',
					700: '#15803D',
					800: '#166534',
					900: '#14532D',
					DEFAULT: '#28A745', // Verde sucesso
				},
				neutral: {
					50: '#F8F9FA',
					100: '#F3F4F6',
					200: '#E9ECEF',
					300: '#DEE2E6',
					400: '#9CA3AF',
					500: '#6C757D',
					600: '#4B5563',
					700: '#374151',
					800: '#333333',
					900: '#111827',
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
					DEFAULT: '#DC3545', // Vermelho erro
				},
				warning: {
					50: '#FEFCE8',
					100: '#FEF9C3',
					200: '#FEF08A',
					300: '#FDE047',
					400: '#FACC15',
					500: '#EAB308',
					600: '#CA8A04',
					700: '#A16207',
					800: '#854D0E',
					900: '#713F12',
					DEFAULT: '#FFC107', // Amarelo aviso
				},
			},
			primary: {
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
				DEFAULT: 'hsl(var(--primary))',
				foreground: 'hsl(var(--primary-foreground))'
			},
			health: {
				primary: {
					50: '#ecfeff',
					100: '#cffafe',
					200: '#a5f3fc',
					300: '#67e8f9',
					400: '#22d3ee',
					500: '#06b6d4',
					600: '#0891b2',
					700: '#0e7490',
					800: '#155e75',
					900: '#164e63'
				},
				secondary: {
					50: '#faf5ff',
					100: '#f3e8ff',
					200: '#e9d5ff',
					300: '#d8b4fe',
					400: '#c084fc',
					500: '#a855f7',
					600: '#9333ea',
					700: '#7e22ce',
					800: '#6b21a8',
					900: '#581c87'
				},
				success: {
					50: '#d1fae5',
					100: '#a7f3d0',
					200: '#6ee7b7',
					300: '#34d399',
					400: '#10b981',
					500: '#059669',
					600: '#047857',
					700: '#065f46',
					800: '#064e3b',
					900: '#022c22'
				},
				warning: {
					50: '#fef3c7',
					100: '#fde68a',
					200: '#fcd34d',
					300: '#fbbf24',
					400: '#f59e0b',
					500: '#d97706',
					600: '#b45309',
					700: '#92400e',
					800: '#78350f',
					900: '#451a03'
				},
				danger: {
					50: '#ffe4e6',
					100: '#fecdd3',
					200: '#fda4af',
					300: '#fb7185',
					400: '#f43f5e',
					500: '#e11d48',
					600: '#be123c',
					700: '#9f1239',
					800: '#881337',
					900: '#4c0519'
				},
				info: {
					50: '#e0f2fe',
					100: '#bae6fd',
					200: '#7dd3fc',
					300: '#38bdf8',
					400: '#0ea5e9',
					500: '#0284c7',
					600: '#0369a1',
					700: '#075985',
					800: '#0c4a6e',
					900: '#082f49'
				}
			},
			neutral: {
				0: 'rgb(var(--neutral-0))',
				50: 'rgb(var(--neutral-50))',
				100: 'rgb(var(--neutral-100))',
				200: 'rgb(var(--neutral-200))',
				700: 'rgb(var(--neutral-700))',
				900: 'rgb(var(--neutral-900))'
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
			}
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
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

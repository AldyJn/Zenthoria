import { fontFamily } from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.vue',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...fontFamily.sans],
            },
            colors: {
                // Colores inspirados en Destiny 2 para la gamificación
                destiny: {
                    // Colores principales de Destiny 2
                    blue: '#2196F3',
                    orange: '#FF9800',
                    purple: '#9C27B0',
                    gold: '#FFD700',
                    silver: '#C0C0C0',
                    bronze: '#CD7F32',
                    
                    // Colores de rareza de items
                    common: '#C0C0C0',      // Gris claro
                    uncommon: '#4CAF50',    // Verde
                    rare: '#2196F3',        // Azul
                    legendary: '#9C27B0',   // Púrpura
                    exotic: '#FFD700',      // Dorado
                    
                    // Colores de elementos
                    arc: '#79C7E3',         // Azul eléctrico
                    solar: '#F2721B',       // Naranja solar
                    void: '#B185DF',        // Púrpura void
                    stasis: '#4D9BE6',      // Azul hielo
                    strand: '#01F562',      // Verde strand
                    
                    // Colores de fondo oscuro
                    dark: {
                        100: '#1a1a1a',
                        200: '#2d2d2d',
                        300: '#404040',
                        400: '#525252',
                        500: '#666666',
                    }
                },
                
                // Colores para el sistema de gamificación
                gamification: {
                    xp: '#4CAF50',          // Verde para XP
                    level: '#FFD700',       // Dorado para niveles
                    achievement: '#FF9800', // Naranja para logros
                    quest: '#2196F3',       // Azul para misiones
                    reward: '#9C27B0',      // Púrpura para recompensas
                    energy: '#00BCD4',      // Cian para energía
                    health: '#F44336',      // Rojo para vida/salud
                }
            },
            
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-slow': 'bounce 2s infinite',
                'spin-slow': 'spin 3s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
                'shake': 'shake 0.5s ease-in-out',
            },
            
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px currentColor' },
                    '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
                }
            },
            
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'destiny-gradient': 'linear-gradient(135deg, #2196F3 0%, #9C27B0 50%, #FF9800 100%)',
                'xp-gradient': 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)',
                'level-gradient': 'linear-gradient(90deg, #FFD700 0%, #FFC107 100%)',
            },
            
            boxShadow: {
                'glow-sm': '0 0 10px currentColor',
                'glow': '0 0 20px currentColor',
                'glow-lg': '0 0 30px currentColor',
                'destiny': '0 4px 14px 0 rgba(33, 150, 243, 0.3)',
                'legendary': '0 4px 14px 0 rgba(156, 39, 176, 0.4)',
                'exotic': '0 4px 14px 0 rgba(255, 215, 0, 0.4)',
            },
            
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '92': '23rem',
                '96': '24rem',
                '104': '26rem',
                '112': '28rem',
                '128': '32rem',
            },
            
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
            
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
                '6xl': ['3.75rem', { lineHeight: '1' }],
                '7xl': ['4.5rem', { lineHeight: '1' }],
                '8xl': ['6rem', { lineHeight: '1' }],
                '9xl': ['8rem', { lineHeight: '1' }],
            },
            
            zIndex: {
                '60': '60',
                '70': '70',
                '80': '80',
                '90': '90',
                '100': '100',
            }
        },
    },
    plugins: [
        // Plugin personalizado para utilidades de gamificación
        function({ addUtilities }) {
            const newUtilities = {
                '.text-glow': {
                    'text-shadow': '0 0 10px currentColor',
                },
                '.text-glow-strong': {
                    'text-shadow': '0 0 20px currentColor, 0 0 30px currentColor',
                },
                '.bg-glass': {
                    'background': 'rgba(255, 255, 255, 0.1)',
                    'backdrop-filter': 'blur(10px)',
                    'border': '1px solid rgba(255, 255, 255, 0.2)',
                },
                '.bg-glass-dark': {
                    'background': 'rgba(0, 0, 0, 0.3)',
                    'backdrop-filter': 'blur(10px)',
                    'border': '1px solid rgba(255, 255, 255, 0.1)',
                },
                '.card-hover': {
                    'transition': 'all 0.3s ease',
                    '&:hover': {
                        'transform': 'translateY(-4px)',
                        'box-shadow': '0 8px 25px rgba(0, 0, 0, 0.15)',
                    }
                },
                '.progress-bar': {
                    'background': 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)',
                    'border-radius': '9999px',
                    'height': '8px',
                    'transition': 'width 0.5s ease',
                }
            }
            addUtilities(newUtilities)
        }
    ],
}
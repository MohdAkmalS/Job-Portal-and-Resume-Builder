/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#FFFFFF', // Pure White
                surface: '#FFFFFF', // Pure White for cards
                primary: '#6366F1', // Indigo
                secondary: '#EC4899', // Pink
                accent: '#8B5CF6', // Violet
                text: '#1E293B', // Slate 800 (Dark text)
                muted: '#64748B', // Slate 500
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'], // Switch to Outfit for a more modern look
            },
            animation: {
                'blob': 'blob 7s infinite',
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}

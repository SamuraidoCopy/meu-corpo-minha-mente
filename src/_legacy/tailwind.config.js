/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Lato', 'sans-serif'],
                serif: ['"Libre Baskerville"', 'serif'],
            },
            colors: {
                wood: '#81C784', // Soft Green
                fire: '#E57373', // Soft Red
                earth: '#FFD54F', // Soft Amber
                metal: '#B0BEC5', // Blue Grey
                water: '#546E7A', // Deep Blue Grey
                paper: '#Fdfbf7', // Warm White Background
            }
        },
    },
    plugins: [],
}

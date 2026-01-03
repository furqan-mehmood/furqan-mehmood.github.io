/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./script.js", // Include script.js for any dynamic classes
    ],
    theme: {
        extend: {
            colors: {
                // Primary background and text colors
                'dark-bg': '#1a1a2e',      // A deep, slightly warm dark blue/purple
                'dark-card': '#16213e',    // A slightly lighter shade for cards
                'dark-border': '#2b3a5a',  // For borders and dividers
                'light-text': '#e0e0e0',   // Light gray for general text
                'medium-text': '#a0a0a0',  // Medium gray for secondary text

                // Accent colors for primary actions, headings, and highlights
                'accent-blue': '#0f4c75',  // A strong, modern blue
                'accent-emerald': '#6fffe9',// A bright, vibrant emerald
                'accent-purple': '#a033ff', // A rich purple
                'accent-yellow': '#ffe66d', // A soft, engaging yellow
            },
            fontFamily: {
                // Adding a modern, clean sans-serif font
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
};
// constants/colors.js

export const lightColors = {
    background: '#FFFFFF',      // White background
    text: '#333333',            // Dark text for active elements
    subText: '#666666',         // Medium gray for subtle text (inactive elements, descriptions)
    primaryRed: '#FF0000',      // Bright Red for accents/buttons
    cardBackground: '#F9F9F9',  // Subtle off-white for main content blocks
    cardBorder: '#DDDDDD',
    headerText: '#333333',
    modalBackground: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black for modal overlay
    modalContentBackground: 'white',
    inputBackground: 'white',
    inputBorder: '#CCCCCC',
    unitToggleBackground: '#F0F0F0', // Light gray background for the unit switch container
    unitToggleActive: '#FF0000', // Red for active unit text
    unitToggleInactive: '#888888', // Gray for inactive unit text
    rpeSectionBorder: '#EEEEEE', // Light gray border for RPE sections
    arrowButton: '#FF0000',     // Red for navigation arrows
    shadowColor: '#000000',     // Black for shadows (subtle in light mode)
  };
  
  export const darkColors = {
    background: '#1A1A1A',      // Dark black background
    text: '#FFFFFF',            // White text for active elements
    subText: '#AAAAAA',         // Light gray for subtle text (inactive elements, descriptions)
    primaryRed: '#FF0000',      // Bright Red for accents/buttons (same as light mode for consistency)
    cardBackground: '#2C2C2C',  // Darker gray for main content blocks
    cardBorder: '#444444',      // Even darker gray for card borders
    headerText: '#FFFFFF',
    modalBackground: 'rgba(0, 0, 0, 0.8)', // More opaque black for dark modal overlay
    modalContentBackground: '#333333', // Dark gray for modal content background
    inputBackground: '#444444',
    inputBorder: '#666666',
    unitToggleBackground: '#444444', // Dark gray background for the unit switch container
    unitToggleActive: '#FF0000', // Red for active unit text
    unitToggleInactive: '#AAAAAA', // Gray for inactive unit text
    rpeSectionBorder: '#555555', // Dark gray border for RPE sections
    arrowButton: '#FF0000',     // Red for navigation arrows
    shadowColor: '#000000',     // Black for shadows (can be subtle or omitted in dark mode too)
  };
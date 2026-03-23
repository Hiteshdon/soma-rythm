# SomaRhythm Music Academy Website

A modern, visually rich, responsive music coaching website built with HTML, CSS, and vanilla JavaScript.

## Features

- **Premium Dark Theme** with purple/teal/gold neon accents
- **Glassmorphism Design** with subtle glows and gradients
- **Motion Graphics:**
  - Canvas-based animated equalizer/sound wave in hero
  - Floating musical note particles
  - Smooth scroll reveal animations (IntersectionObserver)
  - Hover micro-interactions
- **Fully Responsive** (mobile-first design)
- **Sticky Navbar** with active section highlighting
- **Mobile Hamburger Menu** with slide-in animation
- **Enrollment Modal** with form validation
- **Toast Notifications** for user feedback
- **Copy to Clipboard** functionality for phone/email
- **Back to Top** floating button
- **Accessible** (ARIA labels, keyboard navigation, focus trapping)

## Project Structure

```
somarhythm-music-academy/
├── index.html      # Main HTML file
├── styles.css      # All styles with CSS variables
├── script.js       # All JavaScript functionality
├── assets/         # Optional folder for images
└── README.md       # This file
```

## How to Run Locally

### Option 1: VS Code Live Server (Recommended)

1. **Open VS Code**

2. **Open the project folder:**
   - File → Open Folder → Navigate to `D:\somarhythm-music-academy`

3. **Install Live Server Extension:**
   - Click Extensions icon in sidebar (or press `Ctrl+Shift+X`)
   - Search for "Live Server" by Ritwick Dey
   - Click Install

4. **Start the server:**
   - Right-click on `index.html` in the Explorer
   - Select "Open with Live Server"
   - OR click "Go Live" in the bottom status bar

5. The website will open in your default browser at `http://127.0.0.1:5500`

### Option 2: Direct File Opening

Simply double-click `index.html` to open it in your browser.

> Note: Some features like the Google Maps embed may require a local server.

### Option 3: Python HTTP Server

If you have Python installed:

```bash
# Navigate to project folder
cd D:\somarhythm-music-academy

# Python 3
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

### Option 4: Node.js HTTP Server

If you have Node.js installed:

```bash
# Install http-server globally (one-time)
npm install -g http-server

# Navigate to project folder and run
cd D:\somarhythm-music-academy
http-server

# Open the URL shown in terminal
```

## Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --color-primary: #9b4dff;      /* Main purple */
    --color-secondary: #00d9c4;    /* Teal accent */
    --color-accent: #ffd700;       /* Gold accent */
}
```

### YouTube Videos
Replace placeholder video IDs in `index.html`:
```html
<!-- Find and replace these URLs -->
src="https://www.youtube.com/embed/VIDEO_ID_1"
src="https://www.youtube.com/embed/VIDEO_ID_2"

<!-- With your actual YouTube video IDs -->
src="https://www.youtube.com/embed/dQw4w9WgXcQ"
```

### Contact Information
Update in `index.html` under the Contact section:
- Address
- Phone number
- Email address
- Business hours
- Google Maps embed URL

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Technologies Used

- HTML5 (Semantic markup)
- CSS3 (Variables, Flexbox, Grid, Animations)
- Vanilla JavaScript (ES6+)
- Google Fonts (Montserrat, Playfair Display)
- Canvas API (Equalizer animation)
- IntersectionObserver API (Scroll animations)

## License

© 2026 SomaRhythm Music Academy. All rights reserved.

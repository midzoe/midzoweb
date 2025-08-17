# Midzo - Global Travel Companion

A comprehensive travel companion application for study, work, tourism, and business across the globe.

## Features

- Multi-category services (Study, Professional, Tourism, Business)
- User authentication and personalized dashboard
- Interactive service finder for each category
- Responsive design with Tailwind CSS
- Modern UI with React and TypeScript

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Project Structure

```
midzo/
├── src/
│   ├── components/
│   │   ├── study/          # Study-related components
│   │   ├── tourism/        # Tourism-related components
│   │   ├── About.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Destinations.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Login.tsx
│   │   ├── Navbar.tsx
│   │   ├── NewsSlider.tsx
│   │   └── Services.tsx
│   ├── context/
│   │   └── AuthContext.tsx # Authentication context
│   ├── data/              # Static data and configurations
│   ├── App.tsx           # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css       # Global styles
├── public/            # Static assets
├── index.html        # HTML template
├── package.json     # Project dependencies
├── tsconfig.json   # TypeScript configuration
└── vite.config.ts # Vite configuration
```

## Default Login Credentials

- Username: midzo
- Password: midzolo

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- React Router
- Headless UI
- Hero Icons
- Swiper

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
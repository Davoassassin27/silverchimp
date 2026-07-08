# SilverChimp Web Deployment

SilverChimp is a mobile app for powerlifting tournaments with features for event management, athlete registration, attempt editing, and live ranking display.

## Web Version

This repository contains the static web build of SilverChimp, suitable for deployment on Vercel or other static hosting services.

## Project Structure

- `index.html` - Main application page (home screen)
- `events.html` - Events management page
- `ranking.html` - Live ranking display page
- `settings.html` - Settings page
- `assets/` - Static assets (images, icons)
- `category/` - Category detail pages
- `event/` - Event detail pages
- `_expo/` - Expo-specific static assets
- `_sitemap.html` - Sitemap file
- `+not-found.html` - 404 error page
- `favicon.ico` - App favicon

## Vercel Deployment

To deploy this project on Vercel:

1. Push this repository to GitHub
2. Go to https://vercel.com and import your project
3. Use the following vercel.json configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "**.html",
      "use": "@vercel/static",
      "config": {
        "distDir": "."
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VERCEL_ENV": "production"
  }
}
```

## Features

- Static HTML implementation of the mobile app
- Responsive design for mobile and desktop
- Live tournament scoring
- Event and category management
- Athlete registration and tracking
- IPF GL point calculation

## Current Status

✅ Web build successful
✅ Ready for Vercel deployment
✅ Static HTML files generated
✅ Mobile-responsive design implemented

## References

- Source: React Native Expo app
- Framework: React Native with Expo SDK 57
- Features: Offline data persistence, GL scoring, live ranking, modern UI/UX

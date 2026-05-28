# RoadWatch – AI-Powered Road Monitoring

RoadWatch empowers citizens to report road issues (potholes, waterlogging, etc.) and monitor public spending on repairs via an interactive dashboard. 

## Features
- **AI Chatbot**: Report issues naturally via text or photo (mock AI analysis).
- **Interactive Live Map**: View reported issues with severity markers and heatmap overlays.
- **Complaint Timeline**: Track the status of your reported issues (Pending -> Resolved -> Verified).
- **Public Spending Dashboard**: View sanctioned vs used budget for road projects.
- **Authority Dashboard**: Authorities can view complaints, mark them as resolved, and upload verification photos.

## Tech Stack
- React 19
- Vite & TanStack Router
- Tailwind CSS & Shadcn UI
- Leaflet for Maps
- Mock API for frontend demonstration without requiring backend setup

## Run Instructions
1. Ensure you have Node.js installed.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser (typically `http://localhost:5173`).

## Demo Roles
To test the application flows quickly, you can use the Mock Login page:
- **Citizen**: Can report issues, chat with AI, view the map and their timeline.
- **Authority**: Can access the Admin Dashboard to mark complaints as resolved and upload verification images.

## Deployment
Since this uses Vite, you can easily deploy it as a static site:
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. The output will be in the `dist` directory.
3. You can deploy the `dist` folder to services like Vercel, Netlify, or GitHub Pages.

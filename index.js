import express from "express";
import { createServer } from "vercel-express";
import panelRoutes from "./api/panel.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Auto-load routes dari panel.js
for (const route of panelRoutes) {
  app[route.method.toLowerCase()](route.path, route.handler);
}

// Export serverless function untuk Vercel
export default createServer(app);

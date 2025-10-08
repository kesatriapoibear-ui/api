// index.js
import express from "express"
import panelRoutes from "./panel.js"
import aiRoutes from "./ai.js" // file ai.js berisi route Perplexity

const app = express()
app.use(express.json())

// Gabungkan semua route panel
for (const route of panelRoutes) {
  app[route.method.toLowerCase()](route.path, route.handler)
}

// Gabungkan route AI
for (const route of aiRoutes) {
  app[route.method.toLowerCase()](route.path, route.handler)
}

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "API is running",
    routes: [
      ...panelRoutes.map(r => r.path),
      ...aiRoutes.map(r => r.path)
    ]
  })
})

export default app

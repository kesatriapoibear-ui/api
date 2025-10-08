import express from "express"
import panelRoutes from "./api/panel.js"
import aiRoutes from "./api/ai.js"

const app = express()
app.use(express.json())

// Gabungkan semua route
const routes = [...panelRoutes, ...aiRoutes]

for (const route of routes) {
  app[route.method.toLowerCase()](route.path, route.handler)
}

// Endpoint root
app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
    status: "online",
    endpoints: routes.map(r => ({ method: r.method, path: r.path })),
  })
})

export default app

// index.js
import express from "express"
import panelRoutes from "./api/panel.js"

const app = express()
app.use(express.json())

for (const route of panelRoutes) {
  app[route.method.toLowerCase()](`/api/panel${route.path}`, route.handler)
}

export default app

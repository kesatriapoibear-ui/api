/*
    Credit By : @GyzenVtx
    Support : @AboutGyzenLyoraa
    Note :
    • Jangan Jual Source Code Free
    • Error Fix Sendiri
    • Jangan Hapus Ni Credit
    • See U Again
*/

import fetch from "node-fetch"

const apikey = process.env.PTERO_API_KEY || "ptlc_SeY6SoHDLMWnOZjyYo409buy99aDzIwPtFbLBB1nUIv"
const capikey = process.env.PTERO_CLIENT_KEY || "ptla_LT7n7RxK628BTqrnYwmaOKs6tNUUIq7ziFzsFirfkpb"
const domain = process.env.PTERO_DOMAIN || "https://alifserver.privateserverr.my.id"
const nestid = process.env.PTERO_NEST_ID || "5"
const egg = process.env.PTERO_EGG_ID || "15"
const loc = process.env.PTERO_LOCATION_ID || "1"

export default [
  {
    method: "POST",
    path: "/create",
    handler: async (req, res) => {
      const { username, email, ram, disk, cpu } = req.body
      const password = username + Math.floor(Math.random() * 10000)
      const name = username + "-server"

      try {
        const userRes = await fetch(`${domain}/api/application/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apikey}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            username,
            first_name: username,
            last_name: "User",
            password,
            language: "en",
          }),
        })
        const userData = await userRes.json()
        if (userData.errors)
          return res.json({ error: userData.errors[0].detail })
        const userId = userData.attributes.id

        const eggData = await fetch(`${domain}/api/application/nests/${nestid}/eggs/${egg}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apikey}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        const eggJson = await eggData.json()
        const startup = eggJson.attributes.startup

        const serverRes = await fetch(`${domain}/api/application/servers`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apikey}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            user: userId,
            egg: parseInt(egg),
            docker_image: eggJson.attributes.docker_image,
            startup,
            environment: {
              INST: "npm",
              USER_UPLOAD: "0",
              AUTO_UPDATE: "0",
              CMD_RUN: "npm start",
            },
            limits: {
              memory: ram,
              swap: 0,
              disk: typeof disk !== "undefined" ? disk : ram,
              io: 500,
              cpu: cpu ?? 100,
            },
            feature_limits: {
              databases: 5,
              backups: 5,
              allocations: 5,
            },
            deploy: {
              locations: [parseInt(loc)],
              dedicated_ip: false,
              port_range: [],
            },
          }),
        })

        const serverData = await serverRes.json()
        if (serverData.errors)
          return res.json({ error: serverData.errors[0].detail })

        res.json({
          username,
          password,
          email,
          panel_url: `${domain}`,
          server_id: serverData.attributes.id,
        })
      } catch (err) {
        res.status(500).json({ error: "Gagal membuat panel", detail: err.message })
      }
    },
  },
  {
    method: "GET",
    path: "/servers",
    handler: async (req, res) => {
      try {
        const fetchServers = await fetch(`${domain}/api/application/servers`, {
          headers: {
            Authorization: `Bearer ${apikey}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        const serverData = await fetchServers.json()
        if (!serverData || !Array.isArray(serverData.data)) {
          return res.status(400).json({ error: "Invalid server response" })
        }
        res.json(serverData.data)
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch servers", detail: err.message })
      }
    },
  },
  {
    method: "DELETE",
    path: "/server/:id",
    handler: async (req, res) => {
      try {
        const id = req.params.id
        await fetch(`${domain}/api/application/servers/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${apikey}`,
            Accept: "application/json",
          },
        })
        res.json({ success: true })
      } catch (err) {
        res.status(500).json({ error: "Gagal hapus server", detail: err.message })
      }
    },
  },
  {
    method: "POST",
    path: "/create-admin",
    handler: async (req, res) => {
      const { username, email } = req.body
      const password = username + Math.floor(Math.random() * 10000)

      try {
        const userRes = await fetch(`${domain}/api/application/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${capikey}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            username,
            first_name: username,
            last_name: "Admin",
            password,
            language: "en",
            root_admin: true,
          }),
        })
        const userData = await userRes.json()
        if (userData.errors)
          return res.json({ error: userData.errors[0].detail })

        res.json({
          username,
          password,
          panel_url: domain,
        })
      } catch (err) {
        res.status(500).json({ error: "Gagal membuat admin", detail: err.message })
      }
    },
  },
  {
    method: "GET",
    path: "/admins",
    handler: async (req, res) => {
      try {
        const fetchUsers = await fetch(`${domain}/api/application/users`, {
          headers: {
            Authorization: `Bearer ${capikey}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        const userData = await fetchUsers.json()
        if (!userData || !Array.isArray(userData.data)) {
          return res.status(400).json({ error: "Invalid admin response" })
        }

        const admins = userData.data
          .filter((u) => u.attributes.root_admin === true)
          .map((u) => ({
            id: u.attributes.id,
            username: u.attributes.username.trim(),
          }))

        res.json(admins)
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch admins", detail: err.message })
      }
    },
  },
  {
    method: "DELETE",
    path: "/admin/:id",
    handler: async (req, res) => {
      try {
        const id = req.params.id
        await fetch(`${domain}/api/application/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${capikey}`,
            Accept: "application/json",
          },
        })
        res.json({ success: true })
      } catch (err) {
        res.status(500).json({ error: "Gagal hapus admin", detail: err.message })
      }
    },
  },
  {
    method: "GET",
    path: "/api/",
    handler: (req, res) => {
      res.json({
        message: "Panel API is running",
        endpoints: {
         "POST /api/panel/create",
      "GET /api/panel/servers",
      "DELETE /api/panel/server/:id", 
      "POST /api/panel/create-admin",
      "GET /api/panel/admins",
      "DELETE /api/panel/admin/:id",
      "GET /api/panel/",
        },
        status: "online",
      })
    },
  },
]

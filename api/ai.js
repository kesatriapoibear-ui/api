import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"

puppeteer.use(StealthPlugin())

const VALID_MODELS = [
  "r1-1776",
  "sonar-pro",
  "sonar",
  "sonar-reasoning-pro",
  "sonar-reasoning",
]

// Fungsi safe untuk tanya Perplexity
async function askPerplexity(text, model = "r1-1776") {
  if (!VALID_MODELS.includes(model)) throw new Error(`Model tidak valid: ${model}`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()
    await page.goto("https://playground.perplexity.ai/", { waitUntil: "networkidle2" })

    await page.waitForSelector("select#lamma-select")
    await page.select("select#lamma-select", model)

    await page.waitForSelector('textarea[placeholder="Ask anything…"]')
    await page.type('textarea[placeholder="Ask anything…"]', text)

    await page.waitForFunction(() => {
      const btn = document.querySelector('button[aria-label="Submit"]')
      return btn && !btn.disabled
    })

    await page.click('button[aria-label="Submit"]')

    // Tunggu jawaban final (maks 20 detik)
    const answer = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new MutationObserver((mutations) => {
          for (const m of mutations) {
            const msg = m.target.textContent
            if (msg && msg.trim().length > 0) {
              observer.disconnect()
              resolve(msg.trim())
            }
          }
        })
        const container = document.querySelector("div[class*=message]")
        if (container) observer.observe(container, { childList: true, subtree: true })
        setTimeout(() => {
          observer.disconnect()
          resolve("Timeout: Jawaban tidak muncul")
        }, 20000)
      })
    })

    return answer
  } finally {
    await browser.close()
  }
}

export default [
  {
    method: "GET",
    path: "/api/ai",
    handler: async (req, res) => {
      const { text, model = "r1-1776" } = req.query
      if (!text) return res.status(400).json({ status: false, error: "'text' required" })

      try {
        const response = await askPerplexity(text, model)
        res.json({ status: true, data: response })
      } catch (err) {
        res.status(500).json({ status: false, error: err.message })
      }
    },
  },
  {
    method: "POST",
    path: "/api/ai",
    handler: async (req, res) => {
      const { text, model = "r1-1776" } = req.body
      if (!text) return res.status(400).json({ status: false, error: "'text' required" })

      try {
        const response = await askPerplexity(text, model)
        res.json({ status: true, data: response })
      } catch (err) {
        res.status(500).json({ status: false, error: err.message })
      }
    },
  },
]

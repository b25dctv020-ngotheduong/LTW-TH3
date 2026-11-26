import { randomUUID } from 'node:crypto'
import { defineConfig, loadEnv } from 'vite'
import { seedExpenses, validateExpense } from './src/expenses.js'

function demoApi() {
  let expenses = [...seedExpenses]

  async function middleware(req, res, next) {
    const path = req.url.split('?')[0]
    const collection = path === '/api/expenses'
    const match = path.match(/^\/api\/expenses\/([^/]+)$/)
    if (!collection && !match) return next()

    function send(status, data) {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(data))
    }

    if (collection && req.method === 'GET') return send(200, expenses)

    if (collection && req.method === 'POST') {
      try {
        let body = ''
        for await (const chunk of req) {
          body += chunk
          if (body.length > 16_384) {
            send(413, { error: 'Dữ liệu quá dài.' })
            return
          }
        }
        const { description, amount, category, date } = JSON.parse(body)
        const expense = { description: description.trim(), amount, category, date }
        if (Object.keys(validateExpense(expense)).length) {
          return send(400, { error: 'Khoản chi không hợp lệ.' })
        }
        const saved = { ...expense, id: randomUUID() }
        expenses.push(saved)
        return send(201, saved)
      } catch {
        return send(400, { error: 'Khoản chi không hợp lệ.' })
      }
    }

    if (match && req.method === 'DELETE') {
      const index = expenses.findIndex(expense => expense.id === match[1])
      if (index < 0) return send(404, { error: 'Khoản chi không tồn tại.' })
      const [deleted] = expenses.splice(index, 1)
      return send(200, deleted)
    }

    return send(405, { error: 'Phương thức không được hỗ trợ.' })
  }

  return {
    name: 'local-expenses-demo',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const endpoint = env.VITE_MOCKAPI_URL?.trim().replace(/\/+$/, '')
  return { plugins: endpoint === '/api/expenses' ? [demoApi()] : [] }
})

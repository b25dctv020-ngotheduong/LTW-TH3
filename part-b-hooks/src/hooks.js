import { createContext, useEffect, useRef, useState } from 'react'
import { categories, validateExpense } from './expenses.js'

export const ThemeContext = createContext(null)

export function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return now
}

export function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}

async function request(url, options) {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  if (options?.method === 'DELETE') return
  return response.json()
}

function normalizeExpense(record) {
  if (!record || !['string', 'number'].includes(typeof record.id) ||
      typeof record.description !== 'string' || !categories.includes(record.category) ||
      typeof record.date !== 'string' || !['string', 'number'].includes(typeof record.amount)) {
    throw new Error('Dữ liệu khoản chi sai cấu trúc.')
  }
  const candidate = {
    id: String(record.id),
    description: record.description.trim(),
    amount: Number(record.amount),
    category: record.category,
    date: record.date,
  }
  if (!candidate.id || Object.keys(validateExpense(candidate)).length) {
    throw new Error('Dữ liệu khoản chi không hợp lệ.')
  }
  return candidate
}

export function useFetch(endpoint) {
  const [expenses, setExpenses] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [pending, setPending] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const mutation = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    request(endpoint, { signal: controller.signal })
      .then(data => {
        if (controller.signal.aborted) return
        setExpenses(data.map(normalizeExpense).reverse())
        setLoadState('ready')
      })
      .catch(error => {
        if (controller.signal.aborted) return
        setLoadError(`Không tải được danh sách. ${error.message}`)
        setLoadState('error')
      })

    return () => {
      controller.abort()
      mutation.current?.abort()
      mutation.current = null
    }
  }, [endpoint, reloadCount])

  function retry() {
    setLoadError('')
    setLoadState('loading')
    setReloadCount(count => count + 1)
  }

  async function mutate(method, expense) {
    if (loadState !== 'ready' || mutation.current) return false
    const controller = new AbortController()
    mutation.current = controller
    setPending(method)
    setActionError('')

    try {
      if (method === 'POST') {
        const data = await request(endpoint, {
          method,
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expense),
        })
        const saved = normalizeExpense(data)
        if (controller.signal.aborted) return false
        setExpenses(current => [saved, ...current])
      } else {
        await request(`${endpoint}/${encodeURIComponent(expense.id)}`, { method, signal: controller.signal })
        if (controller.signal.aborted) return false
        setExpenses(current => current.filter(entry => entry.id !== expense.id))
      }
      return true
    } catch (error) {
      if (!controller.signal.aborted) {
        const action = method === 'POST' ? 'thêm' : 'xóa'
        setActionError(`Không ${action} được khoản chi. ${error.message}`)
      }
      return false
    } finally {
      if (mutation.current === controller) {
        mutation.current = null
        setPending('')
      }
    }
  }

  return { expenses, loadState, loadError, actionError, pending, retry, mutate }
}

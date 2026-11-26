import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ExpenseFilters, ExpenseForm, ExpenseList, ExpenseSummary, Header } from './components.jsx'
import { money, selectExpenses, sumExpenses } from './expenses.js'
import { ThemeContext, useDebounce, useFetch } from './hooks.js'
import './styles.css'

const configuredEndpoint = import.meta.env.VITE_MOCKAPI_URL?.trim()
const endpoint = configuredEndpoint?.replace(/\/+$/, '') || 'https://6b07a4da58419b87a4387843.mockapi.io/expenses'
const demoMode = endpoint === '/api/expenses'

function App() {
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [clockVisible, setClockVisible] = useState(true)
  const [theme, setTheme] = useState('light')
  const { expenses, loadState, loadError, actionError, pending, retry, mutate } = useFetch(endpoint)
  const appliedQuery = useDebounce(query, 300)
  const total = sumExpenses(expenses)
  const visibleExpenses = selectExpenses(expenses, category, appliedQuery)
  const ready = loadState === 'ready'
  const disabled = !ready || Boolean(pending)

  useEffect(() => {
    document.title = ready ? `${money(total)} | Sổ chi tiêu` : 'Sổ chi tiêu'
  }, [ready, total])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function deleteExpense(expense) {
    if (window.confirm(`Xóa khoản chi “${expense.description}”?`)) {
      void mutate('DELETE', expense)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(current => current === 'light' ? 'dark' : 'light') }}>
      <div className="shell">
        <Header clockVisible={clockVisible} onToggleClock={() => setClockVisible(visible => !visible)} />
        <main className="dashboard">
          {ready && <ExpenseSummary expenses={expenses} />}
          <div className="entry-column">
            {demoMode && <p className="demo-note">Dữ liệu dùng thử trên máy</p>}
            <ExpenseForm onAdd={expense => mutate('POST', expense)} disabled={disabled} />
            {pending && <p className="status" role="status">{pending === 'POST' ? 'Đang thêm khoản chi…' : 'Đang xóa khoản chi…'}</p>}
            {actionError && <p className="status error" role="alert">{actionError}</p>}
          </div>
          <section className="panel ledger">
            <h2>Khoản chi</h2>
            <ExpenseFilters selected={category} onSelect={setCategory} query={query} onQuery={setQuery} />
            {loadState === 'loading' && <p className="status" role="status">Đang tải danh sách…</p>}
            {loadState === 'error' && (
              <div className="status">
                <p className="error" role="alert">{loadError}</p>
                <button type="button" className="secondary" onClick={retry}>Thử lại</button>
              </div>
            )}
            {ready && <ExpenseList expenses={visibleExpenses} onDelete={deleteExpense} disabled={disabled} />}
          </section>
        </main>
      </div>
    </ThemeContext.Provider>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)

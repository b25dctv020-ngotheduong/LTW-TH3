import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import { ExpenseFilters, ExpenseForm, ExpenseList, ExpenseSummary, Header } from './components.jsx'
import { money, seedExpenses, selectExpenses, sumExpenses } from './expenses.js'
import './styles.css'

class App extends Component {
  state = { expenses: seedExpenses, category: '', query: '', appliedQuery: '', clockVisible: true }
  nextId = seedExpenses.length + 1

  componentDidMount() {
    this.updateTitle()
  }

  componentDidUpdate(_previousProps, previousState) {
    if (previousState.expenses !== this.state.expenses) this.updateTitle()
  }

  componentWillUnmount() {
    window.clearTimeout(this.searchTimer)
  }

  updateTitle() {
    document.title = `${money(sumExpenses(this.state.expenses))} | Sổ chi tiêu`
  }

  search = query => {
    this.setState({ query })
    window.clearTimeout(this.searchTimer)
    this.searchTimer = window.setTimeout(() => this.setState({ appliedQuery: query }), 300)
  }

  addExpense = expense => {
    const entry = { ...expense, id: String(this.nextId++) }
    this.setState(({ expenses }) => ({ expenses: [entry, ...expenses] }))
  }

  deleteExpense = expense => {
    if (!window.confirm(`Xóa khoản chi “${expense.description}”?`)) return
    this.setState(({ expenses }) => ({ expenses: expenses.filter(entry => entry.id !== expense.id) }))
  }

  render() {
    const { expenses, category, query, appliedQuery, clockVisible } = this.state
    const visibleExpenses = selectExpenses(expenses, category, appliedQuery)
    return (
      <div className="shell">
        <Header clockVisible={clockVisible} onToggleClock={() => this.setState(state => ({ clockVisible: !state.clockVisible }))} />
        <main className="dashboard">
          <ExpenseSummary expenses={expenses} />
          <div className="entry-column">
            <ExpenseForm onAdd={this.addExpense} />
          </div>
          <section className="panel ledger">
            <h2>Khoản chi</h2>
            <ExpenseFilters selected={category} onSelect={category => this.setState({ category })} query={query} onQuery={this.search} />
            <ExpenseList expenses={visibleExpenses} onDelete={this.deleteExpense} />
          </section>
        </main>
      </div>
    )
  }
}

createRoot(document.getElementById('root')).render(<App />)

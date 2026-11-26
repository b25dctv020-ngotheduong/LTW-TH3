import React, { useContext, useRef, useState } from 'react'
import { ThemeContext, useClock } from './hooks.js'
import { categories, categoryStyle, displayDate, emptyExpense, money, sumExpenses, validateExpense } from './expenses.js'

function Clock() {
  const now = useClock()
  return <time className="clock" dateTime={now.toISOString()}>{now.toLocaleTimeString('vi-VN')}</time>
}

export function Header({ clockVisible, onToggleClock }) {
  const { theme, toggleTheme } = useContext(ThemeContext)
  return (
    <header className="header">
      <h1>Sổ chi tiêu</h1>
      <div className="header-actions">
        {clockVisible && <Clock />}
        <button type="button" className="secondary" onClick={onToggleClock}>
          {clockVisible ? 'Ẩn đồng hồ' : 'Hiện đồng hồ'}
        </button>
        <button type="button" className="secondary" aria-pressed={theme === 'dark'} onClick={toggleTheme}>
          Giao diện tối
        </button>
      </div>
    </header>
  )
}

export function ExpenseForm({ onAdd, disabled }) {
  const [values, setValues] = useState(emptyExpense)
  const [errors, setErrors] = useState({})
  const descriptionInput = useRef(null)

  function change({ target: { name, value } }) {
    setValues(previous => ({ ...previous, [name]: value }))
    setErrors(previous => ({ ...previous, [name]: undefined }))
  }

  async function submit(event) {
    event.preventDefault()
    if (disabled) return
    const validationErrors = validateExpense(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const added = await onAdd({ ...values, description: values.description.trim(), amount: Number(values.amount) })
    if (added) {
      setValues(emptyExpense())
      descriptionInput.current?.focus()
    }
  }

  return (
    <section className="panel">
      <h2>Thêm khoản chi</h2>
      <form onSubmit={submit} noValidate>
        <fieldset className="form-grid">
          <div className="field">
            <label htmlFor="description">Nội dung</label>
            <input ref={descriptionInput} readOnly={disabled} id="description" name="description" value={values.description} onChange={change} placeholder="Ví dụ: Cơm trưa" required aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : undefined} />
            {errors.description && <span id="description-error" className="field-error" role="alert">{errors.description}</span>}
          </div>
          <div className="field">
            <label htmlFor="amount">Số tiền (đồng)</label>
            <input readOnly={disabled} id="amount" name="amount" inputMode="numeric" value={values.amount} onChange={change} placeholder="0" required aria-invalid={Boolean(errors.amount)} aria-describedby={errors.amount ? 'amount-error' : undefined} />
            {errors.amount && <span id="amount-error" className="field-error" role="alert">{errors.amount}</span>}
          </div>
          <div className="field">
            <label htmlFor="category">Loại</label>
            <select disabled={disabled} id="category" name="category" value={values.category} onChange={change}>
              {categories.map(category => <option key={category}>{category}</option>)}
            </select>
            {errors.category && <span className="field-error" role="alert">{errors.category}</span>}
          </div>
          <div className="field">
            <label htmlFor="date">Ngày chi</label>
            <input readOnly={disabled} id="date" type="date" name="date" value={values.date} onChange={change} required aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? 'date-error' : undefined} />
            {errors.date && <span id="date-error" className="field-error" role="alert">{errors.date}</span>}
          </div>
          <button className="primary" type="submit" disabled={disabled}>Thêm khoản chi</button>
        </fieldset>
      </form>
    </section>
  )
}

export function ExpenseFilters({ selected, onSelect, query, onQuery }) {
  return (
    <div className="filters">
      <div className="field">
        <label htmlFor="search">Tìm theo nội dung</label>
        <input id="search" type="search" value={query} onChange={event => onQuery(event.target.value)} placeholder="Tìm khoản chi…" />
      </div>
      <div className="filter-buttons" role="group" aria-label="Lọc theo loại">
        {['', ...categories].map(category => (
          <button type="button" className="filter" key={category} aria-pressed={selected === category} onClick={() => onSelect(category)}>
            {category || 'Tất cả'}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ExpenseList({ expenses, onDelete, disabled }) {
  return (
    <>
      {expenses.length === 0 && <p className="status">Không có khoản chi phù hợp.</p>}
      <ul className="expense-list">
        {expenses.map(expense => (
          <li key={expense.id} className="expense-row">
            <div>
              <strong>{expense.description}</strong>
              <div className="expense-meta">
                <span className={`category ${categoryStyle[expense.category]}`}>{expense.category}</span>
                <time dateTime={expense.date}>{displayDate(expense.date)}</time>
              </div>
            </div>
            <span className="row-amount">{money(expense.amount)}</span>
            <button type="button" className="delete" disabled={disabled} aria-label={`Xóa ${expense.description}`} onClick={() => onDelete(expense)}>Xóa</button>
          </li>
        ))}
      </ul>
      <div className="list-total">
        <span>Tổng đang hiển thị</span><strong>{money(sumExpenses(expenses))}</strong>
      </div>
    </>
  )
}

export function ExpenseSummary({ expenses }) {
  return (
    <section className="panel summary">
      <p className="summary-label">Tổng chi</p>
      <p className="summary-amount">{money(sumExpenses(expenses))}</p>
      <h2>Theo loại</h2>
      <dl>
        {categories.map(category => (
          <div key={category}>
            <dt><span className={`category ${categoryStyle[category]}`}>{category}</span></dt>
            <dd>{money(sumExpenses(expenses.filter(expense => expense.category === category)))}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

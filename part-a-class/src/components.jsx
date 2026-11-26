import React, { Component } from 'react'
import { categories, categoryStyle, displayDate, emptyExpense, money, sumExpenses, validateExpense } from './expenses.js'

export class Clock extends Component {
  state = { now: new Date() }

  componentDidMount() {
    this.timer = window.setInterval(() => this.setState({ now: new Date() }), 1000)
  }

  componentWillUnmount() {
    window.clearInterval(this.timer)
  }

  render() {
    const { now } = this.state
    return <time className="clock" dateTime={now.toISOString()}>{now.toLocaleTimeString('vi-VN')}</time>
  }
}

export class Header extends Component {
  render() {
    const { clockVisible, onToggleClock } = this.props
    return (
      <header className="header">
        <h1>Sổ chi tiêu</h1>
        <div className="header-actions">
          {clockVisible && <Clock />}
          <button type="button" className="secondary" onClick={onToggleClock}>
            {clockVisible ? 'Ẩn đồng hồ' : 'Hiện đồng hồ'}
          </button>
        </div>
      </header>
    )
  }
}

export class ExpenseForm extends Component {
  state = { values: emptyExpense(), errors: {} }

  change = ({ target: { name, value } }) => {
    this.setState(({ values, errors }) => ({
      values: { ...values, [name]: value },
      errors: { ...errors, [name]: undefined },
    }))
  }

  submit = event => {
    event.preventDefault()
    const { values } = this.state
    const errors = validateExpense(values)
    this.setState({ errors })
    if (Object.keys(errors).length > 0) return

    this.props.onAdd({ ...values, description: values.description.trim(), amount: Number(values.amount) })
    this.setState({ values: emptyExpense() })
  }

  render() {
    const { values, errors } = this.state
    return (
      <section className="panel">
        <h2>Thêm khoản chi</h2>
        <form onSubmit={this.submit} noValidate>
          <fieldset className="form-grid">
            <div className="field">
              <label htmlFor="description">Nội dung</label>
              <input id="description" name="description" value={values.description} onChange={this.change} placeholder="Ví dụ: Cơm trưa" required aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : undefined} />
              {errors.description && <span id="description-error" className="field-error" role="alert">{errors.description}</span>}
            </div>
            <div className="field">
              <label htmlFor="amount">Số tiền (đồng)</label>
              <input id="amount" name="amount" inputMode="numeric" value={values.amount} onChange={this.change} placeholder="0" required aria-invalid={Boolean(errors.amount)} aria-describedby={errors.amount ? 'amount-error' : undefined} />
              {errors.amount && <span id="amount-error" className="field-error" role="alert">{errors.amount}</span>}
            </div>
            <div className="field">
              <label htmlFor="category">Loại</label>
              <select id="category" name="category" value={values.category} onChange={this.change}>
                {categories.map(category => <option key={category}>{category}</option>)}
              </select>
              {errors.category && <span className="field-error" role="alert">{errors.category}</span>}
            </div>
            <div className="field">
              <label htmlFor="date">Ngày chi</label>
              <input id="date" type="date" name="date" value={values.date} onChange={this.change} required aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? 'date-error' : undefined} />
              {errors.date && <span id="date-error" className="field-error" role="alert">{errors.date}</span>}
            </div>
            <button className="primary" type="submit">Thêm khoản chi</button>
          </fieldset>
        </form>
      </section>
    )
  }
}

export class ExpenseFilters extends Component {
  render() {
    const { selected, onSelect, query, onQuery } = this.props
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
}

export class ExpenseList extends Component {
  render() {
    const { expenses, onDelete } = this.props
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
              <button type="button" className="delete" aria-label={`Xóa ${expense.description}`} onClick={() => onDelete(expense)}>Xóa</button>
            </li>
          ))}
        </ul>
        <div className="list-total">
          <span>Tổng đang hiển thị</span><strong>{money(sumExpenses(expenses))}</strong>
        </div>
      </>
    )
  }
}

export class ExpenseSummary extends Component {
  render() {
    const { expenses } = this.props
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
}

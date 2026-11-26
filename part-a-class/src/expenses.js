export const categories = ['Ăn uống', 'Đi lại', 'Học tập', 'Giải trí']

export const categoryStyle = {
  'Ăn uống': 'food',
  'Đi lại': 'travel',
  'Học tập': 'study',
  'Giải trí': 'fun',
}

export function today() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function emptyExpense() {
  return { description: '', amount: '', category: categories[0], date: today() }
}

export function validateExpense(values) {
  const errors = {}
  if (!values.description.trim()) errors.description = 'Nhập nội dung khoản chi.'
  if (!/^\d+$/.test(values.amount) || !Number.isSafeInteger(Number(values.amount)) || Number(values.amount) <= 0) {
    errors.amount = 'Nhập số tiền nguyên dương, tính bằng đồng.'
  }
  if (!categories.includes(values.category)) errors.category = 'Chọn một loại khoản chi.'
  const parsedDate = new Date(values.date)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== values.date) {
    errors.date = 'Chọn ngày chi hợp lệ.'
  }
  return errors
}

export function selectExpenses(expenses, category, query) {
  const search = query.trim().toLocaleLowerCase('vi')
  return expenses.filter(expense =>
    (!category || expense.category === category) &&
    expense.description.toLocaleLowerCase('vi').includes(search)
  )
}

export function sumExpenses(expenses) {
  return expenses.reduce((total, expense) => total + BigInt(expense.amount), 0n)
}

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
export const money = amount => currency.format(amount)
export const displayDate = date => date.split('-').reverse().join('/')

export const seedExpenses = [
  { id: '1', description: 'Cơm trưa', amount: 45000, category: 'Ăn uống', date: today() },
  { id: '2', description: 'Gửi xe', amount: 10000, category: 'Đi lại', date: today() },
  { id: '3', description: 'In tài liệu', amount: 28000, category: 'Học tập', date: today() },
  { id: '4', description: 'Vé xem phim', amount: 85000, category: 'Giải trí', date: today() },
]

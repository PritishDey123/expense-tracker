import { useState } from 'react'
import { useExpenses } from './hooks/useExpenses'
import { createExpense, editExpense, deleteExpense } from './api/client'
import { LedgerStub } from './components/LedgerStub'
import { Tape } from './components/Tape'
import { NewExpenseForm } from './components/NewExpenseForm'
import type { NewExpenseInput, ExpenseEditInput } from './api/types'
import './App.css'

/** App shell: header, ledger stub, and the scrolling tape of expense entries. */
function App() {
  const { items, loading, error, hasNext, loadMore, setItems } = useExpenses({})
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreate(input: NewExpenseInput) {
    const created = await createExpense(input)
    setItems((prev) => [created, ...prev])
    setIsCreating(false)
  }

  async function handleEditSave(id: string, changes: ExpenseEditInput) {
    const updated = await editExpense(id, changes)
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }

  async function handleDelete(id: string) {
    await deleteExpense(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="app">
      <LedgerStub items={items} />
      <main className="app__tape-panel">
        <header className="app__header">
          <h1>Expense Tracker</h1>
          <button type="button" className="app__new-button" onClick={() => setIsCreating(true)}>
            + New
          </button>
        </header>
        {isCreating && <NewExpenseForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />}
        <Tape
          items={items}
          loading={loading}
          error={error}
          hasNext={hasNext}
          onLoadMore={loadMore}
          onEditSave={handleEditSave}
          onDelete={handleDelete}
        />
      </main>
    </div>
  )
}

export default App

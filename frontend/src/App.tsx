import { useExpenses } from './hooks/useExpenses'
import { LedgerStub } from './components/LedgerStub'
import { Tape } from './components/Tape'
import './App.css'

/** App shell: header, ledger stub, and the scrolling tape of expense entries. */
function App() {
  const { items, loading, error, hasNext, loadMore } = useExpenses({})

  return (
    <div className="app">
      <LedgerStub items={items} />
      <main className="app__tape-panel">
        <header className="app__header">
          <h1>Expense Tracker</h1>
          <button type="button" className="app__new-button">
            + New
          </button>
        </header>
        <Tape items={items} loading={loading} error={error} hasNext={hasNext} onLoadMore={loadMore} />
      </main>
    </div>
  )
}

export default App

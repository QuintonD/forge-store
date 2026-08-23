import { Component } from 'react'
import { RefreshCcw, AlertTriangle } from 'lucide-react'

export class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('[boundary]', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto mt-24 max-w-md rounded-2xl border border-line-soft bg-surface p-7 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-red-500/10 text-red-600">
            <AlertTriangle size={22} aria-hidden />
          </span>
          <h1 className="mt-4 text-lg font-bold text-ink">Something generated went wrong</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
            The view hit an unexpected state. Your library is safe — nothing was lost.
          </p>
          <p className="mt-3 truncate rounded-lg border border-line-soft bg-canvas px-3 py-2 font-mono text-[11px] text-ink-secondary" title={this.state.error.message}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.98]"
          >
            <RefreshCcw size={14} aria-hidden /> Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

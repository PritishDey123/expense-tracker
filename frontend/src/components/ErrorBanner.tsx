import './ErrorBanner.css'

interface ErrorBannerProps {
  message: string
}

/** States what failed and what happened, in the interface's own voice — never an apology. */
export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      {message}
    </div>
  )
}

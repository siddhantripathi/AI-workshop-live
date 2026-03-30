import { useState } from 'react'
import './App.css'

const WEBHOOK_URL = 'https://tripps.app.n8n.cloud/webhook-test/youtube-aggregator'

// --- Sub-components ---

function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo-mark">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="8" fill="var(--accent)" />
            <path d="M11 8.5L20 14L11 19.5V8.5Z" fill="white" />
          </svg>
          <span>VideoIQ</span>
        </div>
        <nav className="header-nav">
          <span className="nav-badge">Powered by AI</span>
        </nav>
      </div>
    </header>
  )
}

function AnalyzerForm({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('')
  const [validationError, setValidationError] = useState('')

  function isYouTubeUrl(value) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(value.trim())
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) {
      setValidationError('Please enter a YouTube URL.')
      return
    }
    if (!isYouTubeUrl(url)) {
      setValidationError('That doesn\'t look like a valid YouTube URL.')
      return
    }
    setValidationError('')
    onSubmit(url.trim())
  }

  return (
    <form className="analyzer-form" onSubmit={handleSubmit} noValidate>
      <div className="input-group">
        <div className="input-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <input
          type="url"
          className="url-input"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (validationError) setValidationError('')
          }}
          disabled={isLoading}
          aria-label="YouTube video URL"
          aria-describedby={validationError ? 'url-error' : undefined}
        />
      </div>

      {validationError && (
        <p id="url-error" className="validation-error" role="alert">
          {validationError}
        </p>
      )}

      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Analyzing…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Analyze Video
          </>
        )}
      </button>
    </form>
  )
}

function SuccessBanner() {
  return (
    <div className="success-banner" role="status">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
      Analysis complete and saved to database.
    </div>
  )
}

// Thumbnail + title + category header using the YouTube video ID
function VideoHeader({ videoId, title, category }) {
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  return (
    <div className="video-header">
      <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="thumb-link" aria-label={`Watch "${title}" on YouTube`}>
        <img src={thumbUrl} alt={title} className="video-thumb" loading="lazy" />
        <span className="thumb-play" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </a>
      <div className="video-meta">
        <h2 className="video-title">{title}</h2>
        {category && <span className="category-badge">{category}</span>}
      </div>
    </div>
  )
}

// Sentiment score (0–1) rendered as a labelled progress bar
function SentimentMeter({ score }) {
  const pct = Math.round(score * 100)

  // Map 0–100 score to a human label + colour class
  const { label, cls } =
    pct >= 66 ? { label: 'Positive', cls: 'sentiment-positive' } :
    pct >= 34 ? { label: 'Neutral',  cls: 'sentiment-neutral'  } :
                { label: 'Negative', cls: 'sentiment-negative' }

  return (
    <section className="result-section">
      <h2 className="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
        Sentiment
      </h2>
      <div className="sentiment-row">
        <div className="sentiment-track" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Sentiment: ${pct}%`}>
          <div className={`sentiment-fill ${cls}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`sentiment-label ${cls}`}>{label} ({pct}%)</span>
      </div>
    </section>
  )
}

// Entity chips — named people, orgs, places extracted by the LLM
function EntitiesSection({ entities }) {
  if (!entities?.length) return null
  return (
    <section className="result-section">
      <h2 className="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Key Entities
      </h2>
      <div className="entities-grid">
        {entities.map((entity, i) => (
          <span key={i} className="entity-chip">{entity}</span>
        ))}
      </div>
    </section>
  )
}

// Numbered takeaways list
function TakeawaysSection({ takeaways }) {
  if (!takeaways?.length) return null
  return (
    <section className="result-section">
      <h2 className="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        Key Takeaways
      </h2>
      <ol className="takeaways-list">
        {takeaways.map((item, i) => (
          <li key={i} className="takeaway-item">
            <span className="takeaway-num">{i + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function ResultsCard({ data }) {
  return (
    <div className="results-card">
      <SuccessBanner />
      <VideoHeader videoId={data.video_ID} title={data.title} category={data.category} />
      {data.sentiment != null && <SentimentMeter score={data.sentiment} />}
      <EntitiesSection entities={data.entities} />
      <TakeawaysSection takeaways={data.takeaways} />
    </div>
  )
}

function ErrorCard({ message }) {
  return (
    <div className="error-card" role="alert">
      <div className="error-icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <strong className="error-title">Something went wrong</strong>
        <p className="error-message">{message}</p>
      </div>
    </div>
  )
}

// --- Main App ---

export default function App() {
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [data, setData] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleAnalyze(url) {
    setStatus('loading')
    setData(null)
    setErrorMessage('')

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        // Surface HTTP-level errors in plain English
        const statusText = response.statusText || 'Unknown server error'
        throw new Error(`Server responded with ${response.status}: ${statusText}`)
      }

      const json = await response.json()

      // Handle both array and object responses from n8n
      const result = Array.isArray(json) ? json[0] : json

      setData(result)
      setStatus('success')
    } catch (err) {
      // Network failures, JSON parse errors, etc.
      const friendly =
        err instanceof TypeError
          ? 'Unable to reach the server. Check your internet connection and try again.'
          : err.message || 'An unexpected error occurred. Please try again.'

      setErrorMessage(friendly)
      setStatus('error')
    }
  }

  return (
    <div className="app-wrapper">
      <Header />

      <main className="main-content">
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-pill">AI-Powered Analysis</div>
          <h1 className="hero-title">
            Understand any YouTube video
            <br />
            <span className="hero-accent">in seconds</span>
          </h1>
          <p className="hero-subtitle">
            Paste a YouTube URL and our AI will extract the transcript, summarise
            the content, and surface the key insights — all saved automatically.
          </p>
        </section>

        {/* Form */}
        <section className="form-section">
          <AnalyzerForm onSubmit={handleAnalyze} isLoading={status === 'loading'} />
        </section>

        {/* Loading skeleton */}
        {status === 'loading' && (
          <div className="loading-area" aria-live="polite" aria-label="Analyzing video…">
            <div className="skeleton skeleton-wide" />
            <div className="skeleton skeleton-medium" />
            <div className="skeleton skeleton-medium" />
            <div className="skeleton skeleton-narrow" />
          </div>
        )}

        {/* Error */}
        {status === 'error' && <ErrorCard message={errorMessage} />}

        {/* Results */}
        {status === 'success' && data && <ResultsCard data={data} />}
      </main>

      <footer className="app-footer">
        <p>VideoIQ &mdash; Powered by n8n &amp; AI</p>
      </footer>
    </div>
  )
}

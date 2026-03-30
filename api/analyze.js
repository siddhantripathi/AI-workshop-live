const N8N_WEBHOOK = 'https://tripps.app.n8n.cloud/webhook/youtube-aggregator'

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const upstream = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })

    const text = await upstream.text()

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `Upstream error ${upstream.status}: ${text || upstream.statusText}`,
      })
    }

    // Parse JSON and forward to the browser
    let data
    try {
      data = JSON.parse(text)
    } catch {
      return res.status(502).json({ error: 'Invalid JSON from upstream webhook.' })
    }

    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'Failed to reach the analysis service.',
    })
  }
}

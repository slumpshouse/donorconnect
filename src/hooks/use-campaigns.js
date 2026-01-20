import { useEffect, useState } from 'react'

export function useCampaigns() {
	const [campaigns, setCampaigns] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	async function fetchCampaigns(signal) {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch('/api/campaigns', { credentials: 'same-origin', signal })
			if (!res.ok) {
				const err = await res.json().catch(() => ({}))
				throw new Error(err?.error || `Failed to load campaigns (${res.status})`)
			}
			const payload = await res.json().catch(() => ({}))
			setCampaigns(payload.campaigns || [])
		} catch (e) {
			if (e.name !== 'AbortError') setError(e)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const controller = new AbortController()
		fetchCampaigns(controller.signal)
		return () => controller.abort()
	}, [])

	function refetch() {
		const controller = new AbortController()
		return fetchCampaigns(controller.signal)
	}

	return { campaigns, loading, error, refetch }
}
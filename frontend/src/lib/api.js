export const apiFetch = async (url, options = {}) => {
    const headers = {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
    }
    return fetch(url, {
        headers,
        ...options
    })
}

export const apiJson = async (url, options = {}) => {
    const res = await apiFetch(url, options)

    let data = null
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
        data = await res.json()
    }
    if (!res.ok) {
        const message =
            data?.error?.message ||
            data?.message ||
            `Request failed with status ${res.status}`
        const err = new Error(message)
        err.status = res.status
        err.data = data
        throw err
    }
    return data
}
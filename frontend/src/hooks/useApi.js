import { useState, useEffect, useCallback } from 'react'

export const useApi = (apiFunc, deps = [], options = {}) => {
  const { immediate = true, defaultData = null } = options
  const [data, setData] = useState(defaultData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFunc(...args)
      setData(res.data)
      return res.data
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An error occurred'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (immediate) execute()
  }, [execute])

  return { data, loading, error, execute, setData }
}

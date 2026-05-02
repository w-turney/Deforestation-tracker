import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home.jsx'
import Aoi from './pages/Aoi.jsx'
import { apiJson } from './lib/api.js'
import './css/App.css'

function App() {
  const [allAois, setAllAois] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      setError(null)
      setLoading(true)
      try {
        await apiJson('/auth/session', { method: 'POST' })
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <>
      {loading && (
        <div className='message info'>Authenticating user...</div>
      )}
      {error && (
        <div className="message error">
          <strong>Error:</strong> {error}
        </div>
      )}
      {!loading && !error && (
        <Routes>
          <Route path='/' element={<Home allAois={allAois} setAllAois={setAllAois} />} />
          <Route path='/aoi/:id' element={<Aoi setAllAois={setAllAois} />} />
        </Routes>
      )}
    </>
  )
}

export default App
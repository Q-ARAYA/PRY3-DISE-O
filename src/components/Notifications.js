import React, { useEffect, useState } from 'react'
import Notifier from '../services/Notifier'
import './Account.css'

function Toast({ id, type, text, onClose }) {
  return (
    <div className={`toast toast--${type}`} role="status">
      <div className="toast-body">{text}</div>
      <button className="toast-close" onClick={() => onClose(id)} aria-label="Cerrar">✕</button>
    </div>
  )
}

export default function Notifications() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (e) => {
      const { type, text, options } = e.detail || {}
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
      const timeout = (options && options.duration) || 3800
      setToasts((t) => [...t, { id, type: type || 'info', text: text || '' }])
      setTimeout(() => {
        setToasts((t) => t.filter(x => x.id !== id))
      }, timeout)
    }

    window.addEventListener(Notifier._eventName, handler)
    return () => window.removeEventListener(Notifier._eventName, handler)
  }, [])

  const remove = (id) => setToasts((t) => t.filter(x => x.id !== id))

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} id={t.id} type={t.type} text={t.text} onClose={remove} />
      ))}
    </div>
  )
}


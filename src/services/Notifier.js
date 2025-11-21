const NOTIFY_EVENT = 'pry3_notify'

const dispatch = (type, text, options = {}) => {
  try {
    const detail = { type, text, options }
    window.dispatchEvent(new CustomEvent(NOTIFY_EVENT, { detail }))
  } catch (e) {
    // If CustomEvent fails, silently log — avoid native alerts
    // so UI notifications remain consistent
    // eslint-disable-next-line no-console
    console.warn('Notifier dispatch failed', e)
  }
}

const notifier = {
  success: (text, options) => dispatch('success', text, options),
  error: (text, options) => dispatch('error', text, options),
  info: (text, options) => dispatch('info', text, options),
  _eventName: NOTIFY_EVENT,
}

export default notifier

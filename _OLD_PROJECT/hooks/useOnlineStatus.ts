import { useState, useEffect, useCallback } from 'react'
import { serviceWorkerManager } from '../lib/serviceWorkerManager'

type ServiceWorkerStatus = ReturnType<typeof serviceWorkerManager.getStatus>

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [wasOffline, setWasOffline] = useState<boolean>(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setWasOffline(true)
      window.dispatchEvent(new CustomEvent('app:online'))
      setTimeout(() => setWasOffline(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      window.dispatchEvent(new CustomEvent('app:offline'))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  }
}

export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus>(serviceWorkerManager.getStatus())
  const [showUpdatePrompt, setShowUpdatePrompt] = useState<boolean>(false)

  useEffect(() => {
    const handleUpdate = () => {
      setStatus(serviceWorkerManager.getStatus())
      setShowUpdatePrompt(true)
    }
    const handleReady = () => {
      setStatus(serviceWorkerManager.getStatus())
    }

    serviceWorkerManager.on('updateAvailable', handleUpdate)
    serviceWorkerManager.on('ready', handleReady)

    return () => {
      serviceWorkerManager.off('updateAvailable', handleUpdate)
      serviceWorkerManager.off('ready', handleReady)
    }
  }, [])

  const update = useCallback(() => {
    serviceWorkerManager.skipWaiting()
  }, [])

  const dismissUpdate = useCallback(() => {
    setShowUpdatePrompt(false)
  }, [])

  return {
    ...status,
    showUpdatePrompt,
    update,
    dismissUpdate,
  }
}

export default useOnlineStatus

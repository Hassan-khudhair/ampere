'use client'

import { useState, useEffect } from 'react'

// Chrome/Edge fires this event before showing the native install prompt
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAState {
  // true when the app is running in standalone mode (already installed)
  isInstalled: boolean
  // true on iOS Safari (not Chrome/Firefox on iOS)
  isIOS: boolean
  // true when beforeinstallprompt is available (Android/Desktop Chrome)
  canInstall: boolean
  // call this to trigger the native install dialog
  promptInstall: () => Promise<void>
  // whether the device is currently online
  isOnline: boolean
}

export function usePWA(): PWAState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detect standalone mode (app is installed)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
    setIsInstalled(standalone)

    // Detect iOS Safari
    const ua = window.navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
    setIsIOS(ios)

    // Online status
    setIsOnline(navigator.onLine)
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    // Capture the beforeinstallprompt event (Android/Desktop Chrome)
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)

    // Detect when the app is installed from the browser
    const handleInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setDeferredPrompt(null)
  }

  return {
    isInstalled,
    isIOS,
    canInstall: !!deferredPrompt,
    promptInstall,
    isOnline,
  }
}

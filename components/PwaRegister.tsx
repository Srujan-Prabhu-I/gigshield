"use client"

import { useEffect } from "react"

export default function PwaRegister() {
  useEffect(() => {
    // Automatic cache busting based on app version
    const checkVersionAndClearCache = async () => {
      // Get stored version from localStorage
      const storedVersion = localStorage.getItem('app-version')
      const currentVersion = (window as any).APP_VERSION || 'unknown'
      
      // If version changed, clear all caches and service workers
      if (storedVersion !== currentVersion) {
        console.log(`🔄 Cache busting: ${storedVersion} → ${currentVersion}`)
        
        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          )
          console.log('✅ Caches cleared')
        }
        
        // Unregister all service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(
            registrations.map(reg => reg.unregister())
          )
          console.log('✅ Service workers unregistered')
        }
        
        // Store new version
        localStorage.setItem('app-version', currentVersion)
        
        // Don't auto-reload; let user refresh naturally or assets load from cleared cache
        console.log('✅ Cache busted successfully')
      }
    }
    
    checkVersionAndClearCache()
  }, []);

  return null;
}

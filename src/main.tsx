// src/main.tsx
// P4: boot directly into cloud mode via CloudApp (Supabase auth gate).
import React from 'react'
import { createRoot } from 'react-dom/client'
import { CloudApp } from './ui/CloudApp'
import { getSupabase } from './config/supabase'
import './styles.css'
import { registerServiceWorker } from './pwa'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CloudApp client={getSupabase()} />
  </React.StrictMode>,
)

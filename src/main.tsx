import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// @ts-ignore
import Popup from './Popup.jsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup/>
  </StrictMode>,
)

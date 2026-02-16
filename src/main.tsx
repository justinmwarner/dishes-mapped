import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './style.css'
import App from './App'

const appElement = document.getElementById('app')

if (appElement) {
  createRoot(appElement).render(<App />)
}

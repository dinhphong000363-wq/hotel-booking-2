import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { viVN } from './config/clerkLocalization.js'
import { AppProvider } from './conext/AppContext.jsx'
// import { loadGoogleMapsAPI } from './utils/loadGoogleMaps.js'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

// Load Google Maps API khi app khởi động
// KHÔNG CẦN THIẾT - Đang dùng Leaflet + OpenStreetMap (miễn phí)
// loadGoogleMapsAPI()
//   .then(() => {
//     console.log('✅ Google Maps API loaded successfully');
//   })
//   .catch((error) => {
//     console.error('❌ Failed to load Google Maps API:', error);
//   });

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} localization={viVN}>
    <BrowserRouter>
      <AppProvider >
        <App />
      </AppProvider>
    </BrowserRouter>
  </ClerkProvider>,
)

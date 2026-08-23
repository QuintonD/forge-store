import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import { SyncProvider } from './lib/sync/engine'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Toasts } from './components/Toasts'
import { DemoModal } from './components/DemoModal'
import { BottomNav } from './components/BottomNav'
import { OfflineBanner } from './components/OfflineBanner'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Home } from './pages/Home'
import { Browse } from './pages/Browse'
import { Charts } from './pages/Charts'
import { SearchPage } from './pages/Search'
import { LibraryPage } from './pages/Library'
import { AppDetail } from './pages/AppDetail'
import { SubmitPage } from './pages/Submit'
import { TrustPage } from './pages/Trust'
import { DeveloperPage } from './pages/Developer'
import { SyncPage } from './pages/Sync'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  return null
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <SyncProvider>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col">
            <OfflineBanner />
            <Header />
            <ErrorBoundary key="app">
              <main className="flex-1 pb-16 md:pb-0">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/category/:cat" element={<Browse />} />
                  <Route path="/collection/:cat" element={<Browse />} />
                  <Route path="/charts" element={<Charts />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/app/:id" element={<AppDetail />} />
                  <Route path="/developer/:name" element={<DeveloperPage />} />
                  <Route path="/submit" element={<SubmitPage />} />
                  <Route path="/trust" element={<TrustPage />} />
                  <Route path="/sync" element={<SyncPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </ErrorBoundary>
            <Footer />
          </div>
          <DemoModal />
          <Toasts />
          <BottomNav />
        </SyncProvider>
      </BrowserRouter>
    </StoreProvider>
  )
}

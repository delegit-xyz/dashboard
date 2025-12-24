import { Navigation } from './navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from './header'
import { Theme, ThemeProvider } from './components/theme-provider'
import { useLocalStorage } from 'usehooks-ts'
import { Toaster } from '@/components/ui/sonner'
import './index.css'
import { Content } from './Content'
import 'dot-connect/font.css'
import { config } from './walletConfigs'
import { ReactiveDotProvider } from '@reactive-dot/react'
import { Suspense } from 'react'
import { AccountContextProvider } from './contexts/AccountsContext'
import { LocksContextProvider } from './contexts/LocksContext'
import { DelegateContextProvider } from '@/contexts/DelegatesContext'
import { NetworkContextProvider } from './contexts/NetworkContext'
import { THEME_KEY } from './lib/constants'
import ErrorBoundary from './components/ErrorBoundary'

const App = () => {
  const [settings] = useLocalStorage(THEME_KEY, {
    themeMode: 'light',
  })

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme={settings?.themeMode as Theme}>
        <ReactiveDotProvider config={config}>
          <Suspense fallback={<div>Loading...</div>}>
            <NetworkContextProvider>
              <DelegateContextProvider>
                <AccountContextProvider>
                  <LocksContextProvider>
                    <TooltipProvider>
                      <div className="bg-muted/40 flex min-h-screen w-full flex-col">
                        <Navigation />
                        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                          <Header />
                          <Content />
                        </div>
                      </div>
                    </TooltipProvider>
                  </LocksContextProvider>
                </AccountContextProvider>
              </DelegateContextProvider>
            </NetworkContextProvider>
          </Suspense>
        </ReactiveDotProvider>
      </ThemeProvider>
      <Toaster />
    </ErrorBoundary>
  )
}

export default App

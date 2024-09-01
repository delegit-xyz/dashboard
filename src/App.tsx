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
import { ReDotProvider, ReDotChainProvider } from '@reactive-dot/react'
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
        <ReDotProvider config={config}>
          <ReDotChainProvider chainId="polkadot">
            <Suspense fallback={<div>Loading...</div>}>
              <NetworkContextProvider>
                <DelegateContextProvider>
                  <AccountContextProvider>
                    <LocksContextProvider>
                      <TooltipProvider>
                        <div className="flex min-h-screen w-full flex-col bg-muted/40">
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
          </ReDotChainProvider>
        </ReDotProvider>
      </ThemeProvider>
      <Toaster />
    </ErrorBoundary>
  )
}

export default App

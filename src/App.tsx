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
import { DelegateeContextProvider } from '@/contexts/DelegateesContext'

const App = () => {
  const [settings] = useLocalStorage('fellowship-settings', {
    themeMode: 'light',
  })

  return (
    <>
      <ThemeProvider defaultTheme={settings?.themeMode as Theme}>
        <ReDotProvider config={config}>
          <ReDotChainProvider chainId="polkadot">
            <Suspense>
              <DelegateeContextProvider>
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
              </DelegateeContextProvider>
            </Suspense>
          </ReDotChainProvider>
        </ReDotProvider>
      </ThemeProvider>
      <Toaster />
    </>
  )
}

export default App

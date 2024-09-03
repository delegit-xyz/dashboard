import {
  Polkicon,
  ConnectConfiguration,
  SelectedAccountType,
  Connect,
} from '@polkadot-ui/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { routes } from '@/lib/utils'
import { ArrowDownToDot, PanelLeft, Unplug } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
// import {
//   Menubar,
//   MenubarContent,
//   MenubarItem,
//   MenubarMenu,
//   MenubarSeparator,
//   MenubarShortcut,
//   MenubarTrigger,
// } from '@/components/ui/menubar'
import { SupportedNetworkNames, useNetwork } from './contexts/NetworkContext'
import { useState } from 'react'
import { useAccounts } from './contexts/AccountsContext'
import { useEffect } from 'react'
import { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer'
import { Link } from 'react-router-dom'
import { useTheme } from '@/components/theme-provider'

interface NetworkDisplay {
  name: SupportedNetworkNames
  display: string
}
const networkList: NetworkDisplay[] = [
  { name: 'polkadot', display: 'Polkadot' },
  { name: 'polkadot-lc', display: 'Polkadot Light Client' },
  { name: 'kusama', display: 'Kusama' },
  { name: 'kusama-lc', display: 'Kusama Light Client' },
]

if (import.meta.env.DEV) {
  networkList.push(
    { name: 'westend', display: 'Westend' },
    { name: 'fast-westend', display: 'Fast Westend' },
  )
}

export const Header = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { theme } = useTheme()
  const { network, setNetwork } = useNetwork()
  const { selectedAccount, setSelectedAccount } = useAccounts()

  const [selAccount, setSelAccount] = useState(
    selectedAccount as SelectedAccountType,
  )

  const [config, setConfig] = useState<ConnectConfiguration>({})

  useEffect(() => {
    const configObject = {
      downloadIcon: <ArrowDownToDot width={'2rem'} />,
      disconnectIcon: <Unplug width={'2rem'} />,
    }
    setConfig(
      Object.assign(
        configObject,
        theme === 'light'
          ? {
              bg: {
                selected: '#D4D4D4',
              },
              hover: { bg: '#EAEAEA' },
            }
          : {
              bg: {
                selected: '#2B2B2B',
              },
              hover: { bg: '#3A3A3A' },
            },
      ),
    )
  }, [theme])

  useEffect(() => {
    setSelectedAccount(selAccount as InjectedPolkadotAccount)
  }, [selAccount, setSelectedAccount])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:sticky sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            {routes.map((r) => (
              <Link
                key={r.name}
                to={`/${r.link || ''}`}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <r.icon className="h-5 w-5" />
                {r.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full justify-between">
        <div>
          {/* TODO: split submenu based on routes 
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>New Window</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Share</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Print</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>*/}
        </div>
        <div className="flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="default" className="mx-2 cursor-pointer">
                {network.charAt(0).toUpperCase() + network.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {networkList.map(({ name, display }) => (
                <DropdownMenuItem
                  className="cursor-pointer"
                  key={name}
                  onClick={() => setNetwork(name)}
                >
                  {display}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog>
            <DialogTrigger asChild>
              {!selectedAccount?.address ? (
                <Button>Connect</Button>
              ) : (
                <Button
                  variant="outline"
                  size="default"
                  className="cursor-pointer overflow-hidden"
                >
                  <Polkicon
                    size={36}
                    address={selAccount?.address || ''}
                    className="mr-2"
                  />
                  {selAccount?.name}
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="text-sm">
              <DialogHeader>
                <div className="font-bold">Wallet Connect</div>
              </DialogHeader>
              <Connect
                setSelected={setSelAccount}
                selected={selAccount}
                config={config}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}

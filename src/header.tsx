import { Connect, ConnectConfiguration, Polkicon } from '@polkadot-ui/react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { routes } from '@/lib/utils'
import { ChevronDown, Download, PanelLeft, Unplug } from 'lucide-react'
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
import { useAccounts } from './contexts/AccountsContext'
import { useEffect, useState } from 'react'
import { SupportedNetworkNames, useNetwork } from './contexts/NetworkContext'
import { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer'

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
  const { network, setNetwork } = useNetwork()
  const [sAccount, setSAccount] = useState<InjectedPolkadotAccount>(
    {} as InjectedPolkadotAccount,
  )
  const { accounts, selectAccount, selectedAccount } = useAccounts()

  useEffect(() => {
    selectAccount(sAccount)
  }, [sAccount, selectAccount])

  useEffect(() => {
    if (!selectedAccount?.address && accounts.length > 0) {
      selectAccount(accounts[0])
    }
  }, [accounts, selectAccount, selectedAccount?.address])

  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const connectConfig: ConnectConfiguration = {
    downloadIcon: <Download />,
    disconnectIcon: <Unplug />,
  }

  return (
    <>
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
                <a
                  key={r.name}
                  href={`/${r.link || ''}`}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <r.icon className="h-5 w-5" />
                  {r.name}
                </a>
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
                <Button
                  size="default"
                  variant={'outline'}
                  className="mx-2 cursor-pointer capitalize"
                >
                  {network}
                  <ChevronDown className="ml-2 h-4 w-4" />
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

            {!accounts.length && (
              <Dialog onOpenChange={(v) => setModalOpen(v)} open={modalOpen}>
                <DialogTrigger asChild>
                  <Button>Connect</Button>
                </DialogTrigger>
                <DialogContent className="text-sm">
                  <DialogHeader>
                    <div className="font-bold">Connect</div>
                  </DialogHeader>
                  <Connect
                    type="split"
                    config={connectConfig}
                    selected={selectedAccount}
                    setSelected={setSAccount}
                  />
                </DialogContent>
              </Dialog>
            )}
            {!!accounts.length && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="cursor-pointer overflow-hidden"
                  >
                    <Polkicon
                      size={36}
                      address={selectedAccount?.address || ''}
                      className="mr-2"
                      outerColor="transparent"
                    />
                    {selectedAccount?.name}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {accounts.map((account, index) => (
                    <>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        key={account.address}
                        onClick={() => selectAccount(account)}
                      >
                        <Polkicon
                          size={28}
                          address={account.address || ''}
                          className="mr-2"
                          outerColor="transparent"
                        />
                        {account.name}
                      </DropdownMenuItem>
                      {index !== accounts.length - 1 && (
                        <DropdownMenuSeparator />
                      )}
                    </>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

/* eslint-disable react-hooks/exhaustive-deps */
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { routes } from '@/lib/utils'
import { useLocation } from 'react-router-dom'
import DelegitLogo from '@/assets/img/delegitLogo3_w.svg?react'
import { TbLoaderQuarter } from 'react-icons/tb'
import { FaCheckCircle } from 'react-icons/fa'

import { Github, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { useNetwork } from './contexts/NetworkContext'
import { Link } from 'react-router-dom'

const linkStyle = (pathname: string, link: string) => {
  return `link ${
    pathname === link
      ? 'bg-accent text-accent-foreground '
      : 'text-muted-foreground'
  } flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8`
}

export const Navigation = () => {
  const { lightClientLoaded, isLight } = useNetwork()
  const { pathname, search } = useLocation()
  const { theme, setTheme } = useTheme()

  return (
    <aside className="bg-card fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <DelegitLogo
          style={{
            maxHeight: '100%',
            width: '4rem',
          }}
          width={'2.2rem'}
          height={'2.2rem'}
          title="Delegit logo"
        />
        {routes.map((r) => {
          const link = '/' + (r.link || '')
          return (
            <Tooltip key={r.name}>
              <TooltipTrigger asChild>
                <Link
                  to={`${link}${search}`}
                  className={linkStyle(pathname, link)}
                >
                  <r.icon className="h-5 w-5" />
                  <span className="sr-only">{r.name}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{r.name}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        {isLight && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8"
              >
                {!lightClientLoaded ? (
                  <TbLoaderQuarter className="h-5 w-5 animate-spin" />
                ) : (
                  <FaCheckCircle className="text-[#00b300]" />
                )}
                <span className="sr-only">
                  Light Client {!lightClientLoaded ? `syncing` : `synced`}
                </span>
              </a>
            </TooltipTrigger>
            <TooltipContent side="right">
              Light Client {!lightClientLoaded ? `syncing` : `synced`}
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://github.com/wirednkod/delegit-xyz/"
              target="_blank"
              className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">Github</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Github</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <Moon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Toggle theme</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  )
}

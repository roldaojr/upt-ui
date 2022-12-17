import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Web3Modal } from '@web3modal/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { WagmiConfig } from 'wagmi'
import TopBar from '../components/topbar'
import { lightTheme, darkTheme } from '../themes'
import { wagmiClient, web3config } from '../web3config'
import { useEffect, useState } from 'react'

const queryClient = new QueryClient()

function App({ Component, pageProps }) {
  const [ isReady, setReady ] = useState(false)
  useEffect(() => setReady(true), [])

  return (
    <NextThemesProvider defaultTheme="system" attribute="class"
      value={{ light: lightTheme.className, dark: darkTheme.className}}
    >
      <NextUIProvider>
        {isReady ? (
          <WagmiConfig client={wagmiClient}>
            <QueryClientProvider client={queryClient}>
              <TopBar/>
              <Component {...pageProps} />
            </QueryClientProvider>
          </WagmiConfig>
        ) : ''}
        <ToastContainer />
        <Web3Modal {...web3config}/>
      </NextUIProvider>
    </NextThemesProvider>
  )
}

export default App

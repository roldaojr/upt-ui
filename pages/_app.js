import { useEffect, useState } from 'react'
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Web3Modal } from '@web3modal/react'
import { WagmiConfig } from 'wagmi'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { TxModalProvider } from '../contexts/TxModalContext'
import TopBar from '../components/topbar'
import { lightTheme, darkTheme } from '../themes'
import { wagmiClient, web3config } from '../web3config'
import TransactionModal from '../components/transaction-modal'

const queryClient = new QueryClient()

function App({ Component, pageProps }) {
  const [ isReady, setReady ] = useState(false)
  useEffect(() => setReady(true), [])

  return (
    <TxModalProvider>
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
          <TransactionModal />
        </NextUIProvider>
      </NextThemesProvider>
    </TxModalProvider>
  )
}

export default App

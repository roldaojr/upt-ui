import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import TopBar from '../components/topbar'
import { lightTheme, darkTheme } from '../themes'

const queryClient = new QueryClient()

function App({ Component, pageProps }) {
  return (
    <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className
      }}
    >
      <NextUIProvider>
        <QueryClientProvider client={queryClient}>
          <TopBar/>
          <Component {...pageProps} />
          <ToastContainer />
        </QueryClientProvider>
      </NextUIProvider>
    </NextThemesProvider>
  )
}

export default App

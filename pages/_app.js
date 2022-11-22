import { NextUIProvider } from '@nextui-org/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import TopBar from '../components/topbar'

const queryClient = new QueryClient()

function App({ Component, pageProps }) {
  return (
    <NextUIProvider>
      <QueryClientProvider client={queryClient}>
        <TopBar/>
        <Component {...pageProps} />
        <ToastContainer />
      </QueryClientProvider>
    </NextUIProvider>
  )
}

export default App

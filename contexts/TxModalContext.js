import { createContext, useContext, useState } from "react"

export const TxModalContext = createContext({})

export const useTxModal = () => useContext(TxModalContext)

export const TxModalProvider = ({ children }) => {
    const [ status, setStatus ] = useState(null)
    const [ tx, setTx ] = useState(null)
    const context = { status, setStatus, tx, setTx }

    return (
        <TxModalContext.Provider value={context}>
            {children}
        </TxModalContext.Provider>
    )
}

import { getClient } from '@wagmi/core'
import { useMutation } from 'react-query'
import { useTxModal } from '../contexts/TxModalContext'
import { getAppContract } from '../utils'

export const useContractMutation = (
    contractName, functionName, options = {}
) => {
    const { setStatus, setTx } = useTxModal()
    const mutationOptions = {
        ...options,
        onMutate: (...args) => {
            setStatus("send")
            if(options?.onMutate) options.onMutate(...args)
        },
        onError: (...args) => {
            setStatus("error")
            setTx(args[0])
            if(options?.onError) options.onError(...args)
        },
        onSuccess: (...args) => {
            setStatus("success")
            setTx(args[0])
            if(options?.onSuccess) options.onSuccess(...args)
        }
    }

    return useMutation(async args => {
        const client = getClient()
        const signer = await client.connector?.getSigner()
        const contract = getAppContract(contractName, client.data.chain.id)
        return contract.connect(signer)[functionName](...args)
    }, mutationOptions)
}

export default { useContractMutation }

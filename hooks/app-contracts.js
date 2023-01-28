import { getClient } from '@wagmi/core'
import { useMutation, useQueryClient } from 'react-query'
import { TransactionModal } from '../components/transaction-modal'
import { getAppContract } from '../utils'

export const useContractMutation = (
    contractName, functionName, options = {}
) => {
    const queryClient = useQueryClient()
    const { setStatus, setTx } = useTxModal()

    mutationOptions = {
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
            queryClient.invalidateQueries({ queryKey: ["positions"] })
            if(options?.onSuccess) options.onSuccess(...args)
        }
    }

    return useMutation(async args => {
        const client = getClient()
        const signer = await client.connector?.getSigner()
        const contract = getAppContract(contractName, client.data.chain.id)
        return contract.connect(signer)[functionName](...args)
    }, TransactionModal.mutationOptions(mutationOptions))
}

export default { useContractMutation }

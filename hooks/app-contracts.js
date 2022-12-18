import { getClient } from '@wagmi/core'
import { useMutation, useQueryClient } from 'react-query'
import { TransactionModal } from '../components/transaction-modal'
import { getAppContract } from '../utils'

export const useContractMutation = (
    contractName, functionName, options = {}
) => {
    const queryClient = useQueryClient()
    return useMutation(async args => {
        const client = getClient()
        const signer = await client.connector?.getSigner?.({
            chainId: client.chainId
        })
        const contract = getAppContract(contractName, client.chainId)
        return contract.connect(signer)[functionName](...args)
    }, TransactionModal.mutationOptions({
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["positions"] })
            if(options.onSuccess) options.onSuccess(...args)
        }
    }))
}

export default { useContractMutation }

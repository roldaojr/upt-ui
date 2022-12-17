import { useMutation, useQueryClient } from 'react-query'
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
        const chainId = await signer.getChainId()
        const contract = getAppContract(contractName, chainId)
        return contract.connect(signer)[functionName](...args)
    }, {
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["positions"] })
            if(options.onSuccess) options.onSuccess(...args)
        }
    })
}

export default { useContractMutation }

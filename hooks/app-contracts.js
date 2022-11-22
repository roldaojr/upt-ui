import { SignerCtrl } from '@web3modal/core'
import { useMutation } from 'react-query'
import { getAppContract, transactionToast } from '../utils'

export const useContractMutation = (
    contractName, functionName, options = {}
) => {
    return useMutation(async args => {
        const signer = await SignerCtrl.fetch()
        const chainId = await signer.getChainId()
        const contract = getAppContract(contractName, chainId)
        return contract.connect(signer)[functionName](...args)
    }, transactionToast(options))
}

export default { useContractMutation }

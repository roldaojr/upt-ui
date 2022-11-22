import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import appContracts from './contracts.json'

export const getAppContract = (name, chainId) => {
    if(!(chainId in appContracts)) {
        throw new Error(`Contract not available on network id ${chainId}`)
    }
    if(!(name in appContracts[chainId][0].contracts)) {
        throw new Error(`Contract not found ${name}`)
    }
    const { address, abi } = appContracts[chainId][0].contracts[name]
    return new ethers.Contract(address, abi)
}

export const getAppContractAddress = (name, chainId) => {
    if(!(name in appContracts[chainId][0].contracts)) {
        throw new Error(`Contract not found ${name}`)
    }
    return appContracts[chainId][0].contracts[name].address
}

export const onErrorToast = (options) => {
    return {
        ...options,
        onError: (...args) => {
            toast.error(args[0].message)
            if(options.onError) options.onError(...args)
        }
    }
}

export const transactionToast = (options) => {
    return {
        ...options,
        onError: (...args) => {
            toast.error(args[0].message)
            if(options.onError) options.onError(...args)
        },
        onSuccess: (...args) => {
            const [tx] = args
            toast.promise(tx.wait(), {
                pending: 'Transaction pending',
                success: 'Transaction confirmed',
                error: 'Transaction failed'
            })
            if(options.onSuccess) options.onSuccess(...args)
        }
    }
}

import { useMutation, useQueries, useQuery, useQueryClient } from 'react-query'
import { useNetwork, useSigner } from 'wagmi'
import { getClient } from '@wagmi/core'
import { ethers } from 'ethers'
import IUniswapV3Pool from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import INonfungiblePositionManager from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import IERC20Metadata from '@uniswap/v3-periphery/artifacts/contracts/interfaces/IERC20Metadata.sol/IERC20Metadata.json'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { Pool, Position } from '@uniswap/v3-sdk'
import { getAppContractAddress } from '../utils'
import { onErrorToast, transactionToast } from '../utils'

const MAX_UINT128 = ethers.BigNumber.from(2).pow(128).sub(1)

export const uniswapPositionManager = new ethers.Contract(
    '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    INonfungiblePositionManager.abi
)

const getPoolImmutables = async(poolContract) => {
    console.debug(`Getting pool immulatables`)
    const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] = await Promise.all([
        poolContract.factory(),
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        poolContract.tickSpacing(),
        poolContract.maxLiquidityPerTick(),
    ])
    return {
        factory,
        token0,
        token1,
        fee,
        tickSpacing,
        maxLiquidityPerTick,
    }
}

const getPoolState = async (poolContract) => {
    console.debug(`Getting pool state`)
    const [ liquidity, slot ] = await Promise.all([
        poolContract.liquidity(),
        poolContract.slot0()
    ])
    return {
        liquidity,
        sqrtPriceX96: slot[0],
        tick: slot[1],
        observationIndex: slot[2],
        observationCardinality: slot[3],
        observationCardinalityNext: slot[4],
        feeProtocol: slot[5],
        unlocked: slot[6],
    }
}

const getToken = async (address, provider) => {
    const tokenContract = new ethers.Contract(address, IERC20Metadata.abi, provider)
    const [ chainId, decimals, symbol ] = await Promise.all([
        provider.getChainId(),
        tokenContract.decimals(),
        tokenContract.symbol()
    ])
    const newToken = new Token(chainId, address, decimals, symbol)
    return newToken
}

const getPool = async (token0address, token1address, fee, provider) => {
    const token0 = await getToken(token0address, provider)
    const token1 = await getToken(token1address, provider)
    const poolAddress = Pool.getAddress(token0, token1, fee)
    const poolContract = new ethers.Contract(poolAddress, IUniswapV3Pool.abi, provider)
    const state = await getPoolState(poolContract)
    return new Pool(
        token0,
        token1,
        fee,
        state.sqrtPriceX96.toString(),
        state.liquidity.toString(),
        state.tick
    )
}

export const getPositionFees = async (id, provider) => {
    const { amount0, amount1 } = await uniswapPositionManager.connect(
        provider
    ).callStatic.collect({
        tokenId: id,
        recipient: "0x1010101010101010101010101010101010101010",
        amount0Max: MAX_UINT128,
        amount1Max: MAX_UINT128
    })
    return [ amount0, amount1 ]
}

const getPosition = async (id, provider) => {
    const {
        token0, token1, fee, liquidity, tickLower, tickUpper, ...extra
    } = await uniswapPositionManager.connect(provider).positions(id)
    const pool = await getPool(token0, token1, fee, provider)
    const position = new Position({pool, liquidity, tickLower, tickUpper})
    for(let prop in extra) {
        position[prop] = extra[prop]
    }
    const [ fees0, fees1 ] = await getPositionFees(id, provider)
    position.tokensOwed0 = CurrencyAmount.fromRawAmount(pool.token0, fees0)
    position.tokensOwed1 = CurrencyAmount.fromRawAmount(pool.token1, fees1)
    position.id = id
    return position
}

export const getPositions = async (signer) => {
    const address = await signer.getAddress()
    const positionManager = uniswapPositionManager.connect(signer)
    const positionCount = await positionManager.balanceOf(address)
    const index = [...Array(positionCount.toNumber()).keys()]
    const positions = await Promise.all(index.map(async i => {
        const tokenId = await positionManager.tokenOfOwnerByIndex(address, i)
        return tokenId.toNumber()
    }))
    return positions.sort((a, b) => a - b)
}

export const isApprovedForAll = async (signer) => {
    const address = await signer.getAddress()
    const chainId = await signer.getChainId()
    return uniswapPositionManager.connect(signer).isApprovedForAll(
        address, getAppContractAddress("UniswapPositionTools", chainId)
    )
}

export const isApprovedToken = async (tokenId, signer) => {
    const positionManager = uniswapPositionManager.connect(signer)
    const approvedTo = await positionManager.getApproved(tokenId)
    return (approvedTo == getAppContractAddress(
        'UniswapPositionTools', await signer.getChainId()
    ))
}

export const useFetchPostionById = (id, options = {enabled: true}) => {
    const { data: signer } = useSigner()
    const network = useNetwork()
    options.enabled = options.enabled && !!id && !!signer && !!network?.chain?.id
    return useQuery(
        ["positions", network?.chain?.id, id],
        () => getPosition(id, signer),
        onErrorToast(options)
    )
}

export const useFetchPositions = (options = {}) => {
    const { data: signer } = useSigner()
    const network = useNetwork()
    options.enabled = !!signer && !!network?.chain?.id
    const positionsIds = useQuery(
        ["positions", network?.chain?.id],
        () => getPositions(signer),
        options
    )
    const positions = useQueries(
        (positionsIds.data || []).map(id => ({
            queryKey: ['positions', network?.chain?.id, id],
            queryFn: () => getPosition(id, signer),
            enabled: !!signer && positionsIds.isSuccess,
            ...onErrorToast(options)
        }))
    )

    const allQueries = [ positionsIds, ...positions ]

    return {
        data: positions.map(p => p.data),
        isLoading: allQueries.map(q => q.isLoading).reduce((p, c) => p || c),
        isSuccess: allQueries.map(q => q.isSuccess).reduce((p, c) => p && c),
        isError: allQueries.map(q => q.isError).reduce((p, c) => p || c),
        errors: allQueries.map(q => q.error),
        refetch: positionsIds.refetch
    }
}

export const useIsApprovedForAll = (options = {}) => {
    const { data: signer } = useSigner()
    const network = useNetwork()
    options.enabled = !!signer && !!network?.chain?.id
    return useQuery(
        ["approved-for-all", network?.chain?.id],
        () => isApprovedForAll(signer),
        onErrorToast(options)
    )
}

export const useApprovalForAll = (options = {}) => {
    const queryClient = useQueryClient()
    const { data: signer } = useSigner()
    const network = useNetwork()
    options.enabled = !!signer && !!network?.chain?.id
    const approved = useIsApprovedForAll(options)
    const approval = useMutation(
        ["approve-for-all", network?.chain?.id],
        async () => {
            const chainId = await signer.getChainId()
            return uniswapPositionManager.connect(signer).setApprovalForAll(
                getAppContractAddress("UniswapPositionTools", chainId), !approved.data
            )
        },
        transactionToast({
            ...options,
            onSuccess: (...args) => {
                queryClient.invalidateQueries(["approved-for-all", network?.chain?.id])
                if(options.onSuccess) options.onSuccess(...args)
            }
        })
    )
    return {
        data: approved.data,
        isLoading: approved.isLoading || approval.isLoading,
        error: approval.error || approved.error,
        refetch: approved.refetch,
        mutate: approval.mutate,
        mutateAsync: approval.mutateAsync,
        reset: approval.reset,
    }
}

export const useIsApproved = (tokenId, options = {enabled: true}) => {
    const { data: signer } = useSigner()
    const network = useNetwork()
    options.enabled = options.enabled && !!signer && !!network?.chain?.id
    const allapproved = useIsApprovedForAll()
    const approvved = useQuery(
        ["approved", network?.chain?.id, tokenId],
        async () => {
            return isApprovedToken(tokenId, signer)
        },
        onErrorToast({...options, enabled: !!signer})
    )
    return {
        data: allapproved.data || approvved.data,
        isLoading: allapproved.isLoading || approvved.isLoading,
        error: allapproved.error || approvved.error,
    }
}

export const useApprovePosition = (tokenId, options = {}) => {
    const queryClient = useQueryClient()
    const { data: signer } = useSigner()
    const network = useNetwork()
    options.enabled = !!signer && !!network?.chain?.id
    const approved = useIsApproved(tokenId, signer)
    const approval = useMutation(
        ["approved", network?.chain?.id, tokenId],
        async () => {
            const address = getAppContractAddress(
                'UniswapPositionTools', network?.chain?.id
            )
            return uniswapPositionManager.connect(signer).approve(
                address, tokenId, { gasLimit: 500000 }
            )
        },
        transactionToast({
            ...options,
            onSuccess: (...args) => {
                queryClient.invalidateQueries(["approved", tokenId])
                if(options.onSuccess) options.onSuccess(...args)
            }
        })
    )
    return {
        data: approved.data,
        isLoading: approval.isLoading || approved.isLoading,
        error: approval.error || approved.error,
        refetch: approved.refetch,
        mutate: approval.mutate,
        mutateAsync: approval.mutateAsync,
        reset: approval.reset,
    }
}

export default {
    useFetchPositions,
    useFetchPostionById,
    useApprovalForAll,
    useIsApproved,
    useApprovePosition
}

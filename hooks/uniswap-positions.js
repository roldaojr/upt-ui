import { useMutation, useQueries, useQuery } from 'react-query'
import { SignerCtrl } from '@web3modal/core'
import { ethers } from 'ethers'
import IUniswapV3Pool from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import INonfungiblePositionManager from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import IERC20Metadata from '@uniswap/v3-periphery/artifacts/contracts/interfaces/IERC20Metadata.sol/IERC20Metadata.json'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { Pool, Position } from '@uniswap/v3-sdk'
import { getAppContractAddress } from '../utils'
import { onErrorToast, transactionToast } from '../utils'


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
    console.debug(`Pool address is ${poolAddress}`)
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

const getPosition = async id => {
    const signer = await SignerCtrl.fetch()
    const {
        token0, token1, fee, liquidity, tickLower, tickUpper,
        tokensOwed0, tokensOwed1, ...extra
    } = await uniswapPositionManager.connect(signer).positions(id)
    const pool = await getPool(token0, token1, fee, signer)
    const position = new Position({pool, liquidity, tickLower, tickUpper})
    position.tokensOwed0 = CurrencyAmount.fromRawAmount(pool.token0, tokensOwed0)
    position.tokensOwed1 = CurrencyAmount.fromRawAmount(pool.token1, tokensOwed1)
    for(let prop in extra) {
        position[prop] = extra[prop]
    }
    position.id = id
    return position
}

export const getPositions = async () => {
    const signer = await SignerCtrl.fetch()
    // signer is null. wallet not connected
    if(!signer) return []
    const address = await signer.getAddress()
    const positionManager = uniswapPositionManager.connect(signer)
    const positionCount = await positionManager.balanceOf(address)
    const index = [...Array(positionCount.toNumber()).keys()]
    const positions = await Promise.all(index.map(async i => {
        return positionManager.tokenOfOwnerByIndex(address, i)
    }))
    return positions
}

export const isApprovedForAll = async () => {
    const signer = await SignerCtrl.fetch()
    const address = await signer.getAddress()
    const chainId = await signer.getChainId()
    return uniswapPositionManager.connect(signer).isApprovedForAll(
        address, getAppContractAddress("UniswapPositionTools", chainId)
    )
}

export const isApprovedToken = async (tokenId) => {
    if(!tokenId) return false
    const signer = await SignerCtrl.fetch()
    const positionManager = uniswapPositionManager.connect(signer)
    const approvedTo = await positionManager.getApproved(tokenId)
    return (approvedTo == getAppContractAddress(
        'UniswapPositionTools', await signer.getChainId()
    ))
}

export const useFetchPostionById = (id, options) => {
    return useQuery(
        ["positions", id], () => getPosition(id),
        onErrorToast(options)
    )
}

export const useFetchPositions = (isConnected, options = {}) => {
    const positionsIds = useQuery(
        ["positions"],
        getPositions,
        {enabled: isConnected}
    )
    const positions = useQueries(
        (positionsIds.data || []).map(id => ({
            queryKey: ['positions', id],
            queryFn: () => getPosition(id),
            enabled: isConnected && !positionsIds.isLoading,
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

export const useFetchApprovedForAll = (options) => {
    return useQuery(["approved-for-all"], isApprovedForAll, onErrorToast(options))
}

export const useApprovalForAll = (options) => {
    const approved = useFetchApprovedForAll(options)
    const approval = useMutation(["approved-for-all"], async () => {
        const signer = await SignerCtrl.fetch()
        const chainId = await signer.getChainId()
        return uniswapPositionManager.connect(signer).setApprovalForAll(
            getAppContractAddress("UniswapPositionTools", chainId), !approved.data
        )
    }, transactionToast(options))
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

export const useIsApproved = (tokenId, options = {}) => {
    const allapproved = useApprovalForAll(options)
    const approvved = useQuery(["positions", tokenId, "approved"], async () => {
        return isApprovedToken(tokenId)
    }, onErrorToast({...options, enabled: !allapproved.isLoading,}))
    return {
        data: allapproved.data || approvved.data,
        isLoading: allapproved.isLoading || approvved.isLoading,
        error: allapproved.error || approvved.error,
    }
}

export const useApprovePosition = (tokenId, options = {}) => {
    const approved = useIsApproved(tokenId)
    const approval = useMutation(async () => {
        const signer = await SignerCtrl.fetch()
        const address = getAppContractAddress(
            'UniswapPositionTools', await signer.getChainId()
        )
        return uniswapPositionManager.connect(signer).approve(
            address, tokenId, { gasLimit: 500000 }
        )
    }, transactionToast(options))
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
    useApprovePosition,
}

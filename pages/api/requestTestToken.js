import { ethers } from 'ethers'
import { uniswapPositionManager } from '../../hooks/uniswap-positions'

const MAX_UINT128 = ethers.BigNumber.from(2).pow(128).sub(1)
const provider = new ethers.providers.JsonRpcProvider()
const positionMamager = uniswapPositionManager.connect(provider)

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

const requestTestToken = async (req, res) => {
    const { destAddress } = req.query
    // add ETH balance to wallet
    await provider.send("hardhat_setBalance", [
        destAddress, ethers.utils.parseEther("1").toHexString().replace("0x0", "0x")
    ])
    // get total positions
    const totalPositions = await positionMamager.totalSupply()
    // check random tokenId and check if is valid
    let tokenId, ownerAddress, validTokenId = null
    do {
        tokenId = await positionMamager.tokenByIndex(
            randomInteger(20000, totalPositions.toNumber())
        )
        ownerAddress = await positionMamager.ownerOf(tokenId)
        if(ownerAddress == destAddress) continue
        const position = await positionMamager.positions(tokenId)
        if(position.liquidity.eq(0)) continue
        const { amount0, amount1 } = await uniswapPositionManager.connect(
            provider
        ).callStatic.collect({
            tokenId,
            recipient: ownerAddress,
            amount0Max: MAX_UINT128,
            amount1Max: MAX_UINT128
        }, {from: ownerAddress})
        if(amount0.eq(0) && amount1.eq(0)) continue
        validTokenId = tokenId
    } while(!validTokenId)
    console.debug(`Valid token found ${tokenId}`)
    // send token to dest
    await provider.send("hardhat_setBalance", [
        ownerAddress, ethers.utils.parseEther("1").toHexString().replace("0x0", "0x")
    ])
    await provider.send("hardhat_impersonateAccount", [ownerAddress])
    const tx = await uniswapPositionManager.connect(
        provider.getSigner(ownerAddress)
    )["safeTransferFrom(address,address,uint256)"](
        ownerAddress, destAddress, tokenId
    )
    await provider.send("hardhat_stopImpersonatingAccount", [ownerAddress])
    await tx.wait()
    // return tokenId
    return res.json([validTokenId])
}

export default requestTestToken

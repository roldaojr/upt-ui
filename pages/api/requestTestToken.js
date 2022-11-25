import { ethers } from 'ethers'
import { uniswapPositionManager } from '../../hooks/uniswap-positions'


const getTestPostions = async (positionMamager, count) => {
    const positionsCount = await positionMamager.totalSupply()
    const positions = []
    while(positions.length < count) {
        const tokenId = await positionMamager.tokenByIndex(
            Math.floor(positionsCount.toNumber() * Math.random())
        )
        const position = await positionMamager.positions(tokenId)
        // check position balances
        if(
            (
                position.feeGrowthInside0LastX128.gt(0) ||
                position.feeGrowthInside1LastX128.gt(0)
            ) && position.liquidity.gt(0)
        ) {
            // add token to list
            console.log(position)
            positions.push(tokenId.toNumber())
        }
    }
    return positions
}


export default async (req, res) => {
    const { destAddress } = req.query
    // get provider
    const provider = new ethers.providers.JsonRpcProvider()
    // add ETH balance to wallet
    await provider.send("hardhat_setBalance", [
        destAddress, ethers.utils.parseEther("1").toHexString().replace("0x0", "0x")
    ])
    // get uniswap position manager
    const positionMamager = uniswapPositionManager.connect(provider)
    // get a random token
    const positions = await getTestPostions(positionMamager, 1)
    // get token owner signer
    for(let tokenId of positions) {
        const ownerAddress = await positionMamager.ownerOf(tokenId)
        await provider.send("hardhat_setBalance", [
            ownerAddress, ethers.utils.parseEther("1").toHexString().replace("0x0", "0x")
        ])
        await provider.send("hardhat_impersonateAccount", [ownerAddress])
        const ownerSigner = provider.getSigner(ownerAddress)
        const tx = await uniswapPositionManager.connect(ownerSigner)["safeTransferFrom(address,address,uint256)"](
            ownerAddress, destAddress, tokenId, { gasLimit: 500000 }
        )
        await provider.send("hardhat_stopImpersonatingAccount", [ownerAddress])
        await tx.wait()
    }
    return res.json(positions)
}

import { ethers } from 'ethers'
import { uniswapPositionManager } from '../../hooks/uniswap-positions'

const validPositions = [
    130829, 144860, 286254, 297360, 312783, 330767, 347068,
    363354, 367109, 368928, 370504, 76677, 86861
]

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
    const position = Math.round(Math.random() * (validPositions.length - 1))
    const positions = [validPositions[position]]
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

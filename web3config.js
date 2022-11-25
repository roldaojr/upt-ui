import { chains, providers } from '@web3modal/ethereum'

if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
    throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')
}

const trustWalletIcon = chainName => `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainName}/info/logo.png`

export const chainIcons = {
    unknown: trustWalletIcon("ethereum"),
    mainnet: trustWalletIcon("ethereum"),
    polygon: trustWalletIcon("polygon"),
    arbitrum: trustWalletIcon("arbitrum"),
    optimism: trustWalletIcon("optimism"),
    // testnets
    localhost: trustWalletIcon("ethereum"),
    goerli: trustWalletIcon("ethereum"),
    polygonMumbai: trustWalletIcon("polygon"),
}

const networks = {
    development: [ chains.localhost, chains.goerli ],
    preview: [ chains.goerli, chains.polygonMumbai ],
    production: [ chains.polygon, chains.arbitrum, chains.optimism ]
}

const currentEnv = (
    process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV
)

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

const web3config = {
    projectId,
    theme: 'light',
    accentColor: 'default',
    enableNetworkView: true,
    ethereum: {
      appName: 'uniswap-position-tools',
      chains: networks[currentEnv],
      providers: [providers.walletConnectProvider({ projectId })]
    }
}

export default web3config

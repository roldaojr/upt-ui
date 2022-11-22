import { chains, providers } from '@web3modal/ethereum'

if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
    throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')
}

const networks = {
    development: [ chains.localhost, chains.goerli ],
    staging: [ chains.goerli ],
    production: [ chains.polygon, chains.arbitrum, chains.optimism ]
}

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

const web3config = {
    projectId,
    theme: 'light',
    accentColor: 'default',
    ethereum: {
      appName: 'uniswap-position-tools',
      chains: networks[process.env.NODE_ENV],
      providers: [providers.walletConnectProvider({ projectId })]
    }
}

export default web3config

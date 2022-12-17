import { configureChains, createClient } from "wagmi"
import { EthereumClient, modalConnectors, walletConnectProvider } from "@web3modal/ethereum"
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import * as allchains from 'wagmi/chains'
import appContracts from './contracts.json'

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

const availableChains = Object.values(allchains).filter(
    c => Object.keys(appContracts).includes(c.id.toString())
)

let chains

switch(process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV) {
    case "development":
        chains = [allchains.localhost].concat(availableChains.filter(c => c.network != "localhost"))
        break
    case "preview":
        chains = availableChains.filter(c => c.network != "localhost")
        break
    default:
        chains = availableChains.filter(c => !c.testnet && c.network != "localhost")
        break
}

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

const { provider, webSocketProvider } = configureChains(
    chains, [ walletConnectProvider({ projectId }) ]
)

export const wagmiClient = createClient({
    connectors: modalConnectors({ appName: "upt", chains }),
    autoConnect: true,
    provider,
    webSocketProvider
})

export const ethereumClient = new EthereumClient(wagmiClient, chains)

export const web3config = {
    projectId: projectId,
    ethereumClient: ethereumClient,
    enableNetworkView: true
}

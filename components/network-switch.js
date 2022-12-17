import { useCallback } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { Dropdown, Image, Text } from '@nextui-org/react'
import { chainIcons } from '../web3config'
import { useWeb3ModalNetwork } from '@web3modal/react'

const networkIcon = chain => {
  const devChains = ['localhost', 'hardhat', 'goerli']
  const chainName = devChains.includes(chain?.name.toLowerCase()) ? 'ethereum' : chain?.name.toLowerCase()
  return (
    <Image src={chainIcons[chainName] || chainIcons.unknown} alt="" css={{ width: 24 }}/>
  )
}

const NetworkSelector = () => {
    const network = useNetwork()
    const { switchNetwork } = useSwitchNetwork()
    const changeNetwork = useCallback(item => {
      switchNetwork(parseInt(item.currentKey))
    }, [switchNetwork])
    console.log(network?.chains)

    const buttonOpts = (network?.chain?.unsupported) ? {color: "error"}
    : {color: "primary", icon: networkIcon(network?.chain)}

    return (
      <Dropdown>
        <Dropdown.Button auto flat {...buttonOpts}>
          <Text hideIn="xs">
            {(network?.chain?.unsupported) ? "Unsupported" : network?.chain?.name}
          </Text>
        </Dropdown.Button>
        <Dropdown.Menu
          items={network?.chains}
          onSelectionChange={changeNetwork}
          disallowEmptySelection
          selectionMode="single"
        >
          {chain => (
            <Dropdown.Item
              key={chain.id}
              icon={networkIcon(chain)}
            >
              {chain.name}
            </Dropdown.Item>  
          )}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
  
export default NetworkSelector

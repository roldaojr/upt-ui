import { useCallback } from 'react'
import { useNetwork, useSwitchNetwork } from '@web3modal/react'
import { Dropdown, Image, Text } from '@nextui-org/react'

const networkIcon = chain => {
  const devChains = [null, undefined, 'localhost', 'goerli', 'rapsten']
  const chainName = devChains.includes(chain?.name.toLowerCase()) ? 'ethereum' : chain?.name
  return (
    <Image src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainName}/info/logo.png`} alt="" css={{ width: 24 }}/>
  )
}

const NetworkSelector = () => {
    const { network } = useNetwork()
    const { switchNetwork } = useSwitchNetwork()
    const changeNetwork = useCallback(item => {
      switchNetwork({ chainId: parseInt(item.currentKey) })
    }, [switchNetwork])

    let buttonOpts = {}
    if(network?.chain?.unsupported) {
      buttonOpts = {color: "error"}
    } else {
      buttonOpts = {color: "primary", icon: networkIcon(network?.chain)}
    }

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

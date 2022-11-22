import { Fragment } from 'react'
import { Navbar, Spacer } from '@nextui-org/react'
import { Web3Modal, ConnectButton, useAccount } from '@web3modal/react'
import NetworkSelector from './network-switch'
import AccountStatus from './account-status'
import web3config from '../web3config'


const TopBar = () => {
  const { account } = useAccount()

  return (
    <Fragment>
      <Navbar isCompact isBordered variant="sticky">
        <Navbar.Brand hideIn="xs">UniswapV3 positions toolbox</Navbar.Brand>
        <Navbar.Brand showIn="xs">UPT</Navbar.Brand>
        <Navbar.Content>
          {account.isConnected ? (
            <>
              <NetworkSelector/>
              <AccountStatus/>
            </>
          ) : (
            <Navbar.Content>
              <ConnectButton />
            </Navbar.Content>
          )}
        </Navbar.Content>
      </Navbar>
      <Web3Modal config={web3config} />
      <Spacer/>
    </Fragment>
  )
}

export default TopBar

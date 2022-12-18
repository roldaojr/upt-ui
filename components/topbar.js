import { Fragment } from 'react'
import { Navbar, Spacer } from '@nextui-org/react'
import { AccountButton, ConnectButton } from '@web3modal/react'
import { useAccount } from 'wagmi'
import { ThemeSwitch } from './theme-switch'

const TopBar = () => {
  const { isConnected } = useAccount()

  return (
    <Fragment>
      <Navbar isCompact isBordered variant="sticky">
        <Navbar.Brand hideIn="xs">UniswapV3 positions toolbox</Navbar.Brand>
        <Navbar.Brand showIn="xs">UPT</Navbar.Brand>
        <Navbar.Content>
          <ThemeSwitch/>
          {isConnected ? (
            <AccountButton/>
          ) : (
            <ConnectButton icon="hide"/>
          )}
        </Navbar.Content>
      </Navbar>
      <Spacer/>
    </Fragment>
  )
}

export default TopBar

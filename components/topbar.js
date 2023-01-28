import { Fragment } from 'react'
import { Navbar, Spacer } from '@nextui-org/react'
import { Web3Button, Web3NetworkSwitch } from '@web3modal/react'
import { ThemeSwitch } from './theme-switch'

const TopBar = () => {
  return (
    <Fragment>
      <Navbar isCompact isBordered variant="sticky">
        <Navbar.Brand hideIn="xs">UniswapV3 positions toolbox</Navbar.Brand>
        <Navbar.Brand showIn="xs">UPT</Navbar.Brand>
        <Navbar.Content gap="$3">
          <ThemeSwitch/>
          <Web3NetworkSwitch/>
          <Web3Button label="Connect Wallet" icon="show" />
        </Navbar.Content>
      </Navbar>
      <Spacer/>
    </Fragment>
  )
}

export default TopBar

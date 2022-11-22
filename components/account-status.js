import { Jazzicon } from '@ukstv/jazzicon-react'
import { Avatar, Dropdown, Navbar } from '@nextui-org/react'
import { useAccount, useDisconnect } from '@web3modal/react'

const AccountStatusWidget = () => {
  const { account } = useAccount()
  const disconnect = useDisconnect()
  const icon = (
    <div style={{ width: '32px', height: '32px' }}>
      <Jazzicon address={account.address} />
    </div>
  )

  return (
    <Navbar.Content>
      <Dropdown placement="bottom-right">
          <Dropdown.Trigger>
            <Avatar icon={icon}/>
          </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item onClick={disconnect} color="error">
            Disconnect
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Navbar.Content>
  )
}

export default AccountStatusWidget

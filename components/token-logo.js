import { Avatar, User } from '@nextui-org/react'
import { useTokenLogos } from '../hooks/token-logos'

export const TokenLogo = ({address, ...props}) => {
    const tokenLogos = useTokenLogos()
    const tokenLogo = tokenLogos.data?.get(address)
    return (
        <Avatar src={tokenLogo} text="?" {...props}/>
    )
}

export const TokenAmount = ({token, amount, size, ...props}) => {
    const tokenLogos = useTokenLogos()
    const tokenLogo = tokenLogos.data?.get(token?.address)
    const text = `${amount} ${token?.symbol}`
    return (
        <User src={tokenLogo} name={text} {...props} size={size ?? "sm"}/>
    )
}

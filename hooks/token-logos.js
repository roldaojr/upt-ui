import { useQuery } from 'react-query'


export const useTokenLogos = () => {
    return useQuery('token-logos', async () => {
        const response = await fetch(process.env.NEXT_PUBLIC_TOKENLIST_URL)
        const tokenList = await response.json()
        const tokenLogos = new Map()

        for(let token of tokenList.tokens) {
            const tokenLogoURI = token.logoURI.replace(
                'ipfs:/', process.env.NEXT_PUBLIC_IPFS_GATEWAY
            )
            tokenLogos.set(token.address, tokenLogoURI)
        }
        return tokenLogos
    }, {refetchInterval: false})
}

export default { useTokenLogos }

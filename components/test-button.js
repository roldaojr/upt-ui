import { useMutation, useQueryClient } from 'react-query'
import { Button } from '@nextui-org/react'
import { useNetwork } from 'wagmi'
import { getClient } from '@wagmi/core'

const testNetworks = ["localhost", "hardhat"]

export const TestButton = () => {
    const { network } = useNetwork()
    const queryClient = useQueryClient()

    const getToken = useMutation(async () => {
        const client = getClient()
        const address = await client.connector.getAccount()
        return fetch(`/api/requestTestToken?destAddress=${address}`)
    }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["positions"] })
    })
    if(!testNetworks.includes(network?.chain?.network)) return null

    return (
        <Button
            color="warning" auto
            onPress={getToken.mutate}
            disabled={getToken.isLoading}
        >Request test tokens</Button>
    )
}

export default TestButton

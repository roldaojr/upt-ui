import { useCallback } from 'react'
import { Button } from '@nextui-org/react'
import { useQueryClient } from 'react-query'
import { FiRefreshCw } from 'react-icons/fi'


export const RefreshButton = () => {
    const queryClient = useQueryClient()
    const onClick = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["positions"] })
    }, [queryClient])

    return (
        <Button auto icon={<FiRefreshCw/>} onPress={onClick}/>
    )
}

export default RefreshButton

import { Button } from '@nextui-org/react'
import { useApprovalForAll } from '../hooks/uniswap-positions'

export const ApproveForAllButton = (props) => {
    const { data: approved, isLoading, mutate: approve, reset } = useApprovalForAll({
      onError: () => reset()
    })

    return (
      <Button
        auto
        ghost={approved}
        color="secondary"
        {...props}
        disabled={isLoading}
        onPress={approve}
      >
        {approved ? 'Disapprove for all tokens' : 'Approve for all tokens'}
      </Button>
    )
}

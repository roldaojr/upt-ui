import { Button, Input, Modal, Radio, Row, Text } from '@nextui-org/react'
import { Controller, useForm } from 'react-hook-form'
import {
  useApprovePosition, useFetchPostionById, useIsApproved
} from '../hooks/uniswap-positions'
import { useContractMutation } from '../hooks/app-contracts'

const RemoveLiqSwapModal = ({visible, onClose, tokenId}) => {
  // fetch token info
  const { data: position } = useFetchPostionById(tokenId)
  const {
    pool: { token0, token1 }
  } = position || {pool: {}}
  // approval hooks
  const isApproved = useIsApproved(tokenId)
  const approve = useApprovePosition(tokenId)
  // contract hook
  const removeLiqSwap = useContractMutation(
    "UniswapPositionTools", "removeLiquidityAndSwap", {onSuccess: onClose}
  )
  // form hook
  const { register, handleSubmit, control } = useForm({
    defaultValues: { percent: 100, swapTo: 0}
  })
  const formSubmit = ({ percent, swapTo }) => {
    const amount = BigInt(position.liquidity) * BigInt(percent) / BigInt(100)
    removeLiqSwap.mutate([tokenId, amount, swapTo])
  }

  return (
    <Modal closeButton aria-labelledby="modal-title" open={visible} onClose={onClose}>
      <form onSubmit={handleSubmit(formSubmit)}>
        <Modal.Header>
          <Text id="modal-title">Remove Liquidity and swap tokens</Text>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Input
              type="number" size="lg" css={{ width: "$full" }} label="Amount %"
              helperText="Amount of liquidity to remove"
              {...register("percent", {required: true, min: 0, max: 100})}
            />
          </Row>
          <Row>
            <Controller
              name="swapTo"
              control={control}
              render={({ field }) => (
                <Radio.Group {...field} aria-label='Swap tokens to'>
                  <Radio value={0}>Do not swap</Radio>
                  <Radio value={1}>Swap to {token0?.symbol}</Radio>
                  <Radio value={2}>Swap to {token1?.symbol}</Radio>
                </Radio.Group>
              )}
            />
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {isApproved.data ? (
            <Button type="submit" size="lg" css={{ width: "$full" }}
              disabled={removeLiqSwap.isLoading}
            >Remove Liquidity and swap</Button>
          ) : (
            <Button size="lg" css={{ width: "$full" }}
              disabled={approve.isLoading}
              onPress={() => approve.mutate()}
            >Approve</Button>
          )}
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default RemoveLiqSwapModal

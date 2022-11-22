import { Button, Input, Modal, Text } from '@nextui-org/react'
import { Price } from '@uniswap/sdk-core'
import { nearestUsableTick, priceToClosestTick } from '@uniswap/v3-sdk'
import { ethers } from 'ethers'
import {
  useApprovePosition, useFetchPostionById, useIsApproved
} from '../hooks/uniswap-positions'
import { useContractMutation } from '../hooks/app-contracts'
import { useForm } from 'react-hook-form'

const ChangeRangeModal = ({ visible, onClose, tokenId }) => {
  // fetch token info
  const { data: position, isLoading, error } = useFetchPostionById(tokenId)
  const {
    pool: { token0, token1, tickSpacing }
  } = position || {pool: {}}
  // token approve hooks
  const isApproved = useIsApproved(tokenId)
  const approve = useApprovePosition(tokenId)
  // contract hook
  const remint = useContractMutation(
    "UniswapPositionTools", "remint", {onSuccess: onClose}
  )
  // form hook
  const { register, handleSubmit } = useForm({
    defaultValues: {
      priceLower: position?.token0PriceLower.toSignificant(),
      priceUpper: position?.token0PriceUpper.toSignificant()
    }
  })
  const formSubmit = ({ priceLower, priceUpper }) => {
    // convert prices to ticks
    const [tickLower, tickUpper] = [priceLower, priceUpper].map(value => {
      const price = new Price(
        token0, token1,
        ethers.utils.parseUnits("1", token1.decimals),
        ethers.utils.parseUnits(value, token0.decimals)
      )
      return nearestUsableTick(priceToClosestTick(price), tickSpacing)
    })
    remint.mutate([tokenId, tickLower, tickUpper])
  }

  if(!isLoading && error) console.error(error)

  return (
    <Modal closeButton aria-labelledby="modal-title" open={visible} onClose={onClose}>
      <form onSubmit={handleSubmit(formSubmit)}>
        <Modal.Header>
          <Text id="modal-title">Change Price Range</Text>
        </Modal.Header>
        <Modal.Body>
          <Input size="lg" input="number" {...register("priceLower")} label="Min Price"/>
          <Input size="lg" input="number" {...register("priceUpper")} label="Max price"/>
        </Modal.Body>
        <Modal.Footer>
          {!!isApproved.data ? (
            <Button type="submit" size="lg" css={{ width: "$full" }}
              disabled={remint.isLoading}
            >Change range</Button>
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

export default ChangeRangeModal

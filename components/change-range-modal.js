import { Button, Input, Modal, Text } from '@nextui-org/react'
import { Price } from '@uniswap/sdk-core'
import { nearestUsableTick, priceToClosestTick } from '@uniswap/v3-sdk'
import { ethers } from 'ethers'
import {
  useApprovePosition, useFetchPostionById, useIsApproved
} from '../hooks/uniswap-positions'
import { useContractMutation } from '../hooks/app-contracts'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'

const ChangeRangeModal = ({ open, onClose, tokenId }) => {
  // fetch token info
  const { data: position, isLoading } = useFetchPostionById(tokenId)
  const { pool } = position || {pool: {}}
  // token approve hooks
  const isApproved = useIsApproved(tokenId)
  const approve = useApprovePosition(tokenId)
  // contract hook
  const remint = useContractMutation(
    "UniswapPositionTools", "remint", {onSuccess: onClose}
  )
  // form hook
  const { register, handleSubmit, reset: formReset } = useForm()

  const formSubmit = ({ priceLower, priceUpper }) => {
    // convert prices to ticks
    const [tickLower, tickUpper] = [priceLower, priceUpper].map(value => {
      const price = new Price(
        pool.token0, pool.token1,
        ethers.utils.parseUnits("1", pool.token1.decimals),
        ethers.utils.parseUnits(value, pool.token0.decimals)
      )
      return nearestUsableTick(priceToClosestTick(price), pool.tickSpacing)
    })
    remint.mutate([tokenId, tickLower, tickUpper])
  }

  useEffect(() => {
    formReset({
      "priceLower": position?.token0PriceLower.toSignificant(),
      "priceUpper": position?.token0PriceUpper.toSignificant()
    })
  }, [position, formReset])

  return (
    <Modal closeButton aria-labelledby="modal-title" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(formSubmit)}>
        <Modal.Header>
          <Text id="modal-title">Change Price Range</Text>
        </Modal.Header>
        <Modal.Body>
          <Input size="lg" input="number" label="Min Price" {...register("priceLower")} />
          <Input size="lg" input="number" label="Max price" {...register("priceUpper")} />
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

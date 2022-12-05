import { Button, Input, Modal, Text } from '@nextui-org/react'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import {
  useApprovePosition, useFetchPostionById, useIsApproved
} from '../hooks/uniswap-positions'
import { useContractMutation } from '../hooks/app-contracts'
import { tryParseTick } from '../lib/price-utils'


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
  const { register, handleSubmit, reset: formReset } = useForm({
    mode: 'onBlur',
    resolver: async ({priceLower, priceUpper}) => {
      const errors = {}
      const values = {
        tickLower: tryParseTick(pool.token0, pool.token1, pool.fee, priceLower),
        tickUpper: tryParseTick(pool.token0, pool.token1, pool.fee, priceUpper)
      }
      if(values.tickLower == undefined) errors.tickLower = "Invalid value"
      if(values.tickUpper == undefined) errors.tickUpper = "Invalid value"
      return { values, errors }
    }
  })

  const formSubmit = ({ tickLower, tickUpper }) => {
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

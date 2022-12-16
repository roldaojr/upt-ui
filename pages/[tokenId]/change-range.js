import { useRouter } from 'next/router'
import { Button, Input, Card, Text, Container, Grid } from '@nextui-org/react'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import {
  useApprovePosition, useFetchPostionById, useIsApproved
} from '../../hooks/uniswap-positions'
import { useContractMutation } from '../../hooks/app-contracts'
import { tryParseTick } from '../../lib/price-utils'


const ChangeRangePage = () => {
  const router = useRouter()
  const { tokenId } = router.query
  const { data: position } = useFetchPostionById(tokenId)
  const { pool } = position || {pool: {}}
  // token approve hooks
  const isApproved = useIsApproved(tokenId)
  const approve = useApprovePosition(tokenId)
  // contract hook
  const remint = useContractMutation(
    "UniswapPositionTools",
    "remint",
    {onSuccess: () => router.back()}
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
      "priceLower": position?.token0PriceLower.toSignificant(4),
      "priceUpper": position?.token0PriceUpper.toSignificant(4)
    })
  }, [position, formReset])

  return (
    <Container xs>
      <Card>
        <form onSubmit={handleSubmit(formSubmit)}>
          <Card.Header>
            <Text h3>Change Price Range</Text>
          </Card.Header>
          <Card.Body>
            <Input size="lg" input="number" label="Min Price" {...register("priceLower")} />
            <Input size="lg" input="number" label="Max price" {...register("priceUpper")} />
          </Card.Body>
          <Card.Footer>
          <Grid.Container gap={1}>
              <Grid xs={12}>
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
              </Grid>
              <Grid xs={12}>
                <Button size="lg" css={{ width: "$full" }}
                  onPress={() => router.back()}
                >Cancel</Button>
              </Grid>
            </Grid.Container>
          </Card.Footer>
        </form>
      </Card>
    </Container>
  )
}

export default ChangeRangePage

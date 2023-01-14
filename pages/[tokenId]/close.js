import { useRouter } from 'next/router'
import {
  Button, Input, Card, Radio, Row, Text, Container, Grid
} from '@nextui-org/react'
import { Controller, useForm } from 'react-hook-form'
import {
  useApprovePosition, useFetchPostionById, useIsApproved
} from '../../hooks/uniswap-positions'
import { useContractMutation } from '../../hooks/app-contracts'

const RemoveLiqSwapPage = () => {
  const router = useRouter()
  const { tokenId } = router.query
  const {
    data: position, isSuccess
  } = useFetchPostionById(tokenId, {enabled: router.isReady})
  const { pool: { token0, token1 } } = position || {pool: {}}
  // approval hooks
  const isApproved = useIsApproved(tokenId, {enabled: router.isReady})
  const approve = useApprovePosition(tokenId)
  // contract hook
  const removeLiqSwap = useContractMutation(
    "UniswapPositionTools",
    "removeLiquidityAndSwap",
    {onSuccess: () => router.back()}
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
    <Container xs>
      <Card>
        <form onSubmit={handleSubmit(formSubmit)}>
          <Card.Header>
            <Text h3>Remove Liquidity and swap tokens</Text>
          </Card.Header>
          <Card.Body>
            <Row>
              <Input
                type="number" size="lg" css={{ width: "$full" }} label="Amount %"
                {...register("percent", {required: true, min: 0, max: 100})}
              />
            </Row>
            <Row><Text>Swap tokens to</Text></Row>
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
          </Card.Body>
          <Card.Footer>
            <Grid.Container gap={1}>
              <Grid xs={12}>
                {isApproved.data ? (
                  <Button type="submit" size="lg" css={{ width: "$full" }}
                    disabled={!isSuccess || removeLiqSwap.isLoading}
                  >Remove Liquidity and swap</Button>
                ) : (
                  <Button size="lg" css={{ width: "$full" }}
                    disabled={!isApproved.isSuccess || approve.isLoading}
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

export default RemoveLiqSwapPage

import { useRouter } from 'next/router'
import { useCallback } from 'react'
import {
  Container, Button, Loading, Card, Grid, Row, Text
} from '@nextui-org/react'
import { TokenAmount } from '../../components/token-logo'
import {
  useFetchPostionById, useApprovePosition
} from '../../hooks/uniswap-positions'
import { useContractMutation } from '../../hooks/app-contracts'

const CompoundPage = () => {
  const router = useRouter()
  const { tokenId } = router.query
  const position = useFetchPostionById(tokenId, {enabled: router.isReady})
  const {
    pool: { token0, token1 }, tokensOwed0, tokensOwed1
  } = position.data || {pool: {}}
  // approval hook
  const approval = useApprovePosition(tokenId, {enabled: router.isReady})
  // contract hook
  const compound = useContractMutation(
    "UniswapPositionTools",
    "swapAndCompound",
    {onSuccess: () => router.back()}
  )
  // confirm callback
  const onConfirm = useCallback(() => {
    compound.mutate([tokenId])
  }, [compound, tokenId])

  return (
    <Container xs>
      <Card>
        <Card.Header>
          <Text h3>Collect and compound fees?</Text>
        </Card.Header>
        <Card.Body>
          {!position?.isSuccess ? (
            <Loading type="points" size="xl" />
          ) : (
            <>
              <TokenAmount token={token0} amount={tokensOwed0?.toSignificant(4)}/>
              <TokenAmount token={token1} amount={tokensOwed1?.toSignificant(4)}/>
            </>
          )}
        </Card.Body>
        <Card.Footer>
          <Grid.Container gap={1}>
            <Grid xs={12}>
              {approval.data ? (
                <Button size="lg" css={{ width: "$full" }}
                  disabled={!position.isSuccess || compound.isLoading}
                  onPress={onConfirm}
                >Compound</Button>
              ) : (
                <Button size="lg" css={{ width: "$full" }}
                  disabled={!position.isSuccess || approval.isLoading}
                  onPress={() => approval.mutate()}
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
      </Card>
    </Container>
  )
}

export default CompoundPage

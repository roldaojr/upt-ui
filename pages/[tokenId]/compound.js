import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import {
  Container, Button, Loading, Card, Grid, Row, Text
} from '@nextui-org/react'
import { TokenLogo } from '../../components/token-logo'
import { TransactionModal } from '../../components/transaction-modal'
import {
  useFetchPostionById, useApprovePosition
} from '../../hooks/uniswap-positions'
import { useContractMutation } from '../../hooks/app-contracts'

const CompoundPage = () => {
  const router = useRouter()
  const { tokenId } = router.query
  const position = useFetchPostionById(tokenId)
  const {
    pool: { token0, token1 }, tokensOwed0, tokensOwed1
  } = position.data || {pool: {}}
  // approval hook
  const approval = useApprovePosition(tokenId)
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
          {position.isLoading ? (
            <Loading type="points" size="xl" />
          ) : (
            <>
              <Row>
                <TokenLogo address={token0?.address} size="xs"/>
                {tokensOwed0?.toSignificant()} {token0?.symbol}
              </Row>
              <Row>
                <TokenLogo address={token1?.address} size="xs"/>
                {tokensOwed1?.toSignificant()} {token1?.symbol}
              </Row>
            </>
          )}
        </Card.Body>
        <Card.Footer>
          <Grid.Container gap={1}>
            <Grid xs={12}>
              {approval.data ? (
                <Button size="lg" css={{ width: "$full" }}
                  disabled={position.isLoading || compound.isLoading}
                  onPress={onConfirm}
                >Compound</Button>
              ) : (
                <Button size="lg" css={{ width: "$full" }}
                  disabled={position.isLoading || approval.isLoading}
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
      <TransactionModal status=""/>
    </Container>
  )
}

export default CompoundPage

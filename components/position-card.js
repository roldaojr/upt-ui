import { useRouter } from 'next/router'
import {
  Grid, Card, Button, Row, Text, Badge, Avatar, Col
} from '@nextui-org/react'
import { TokenLogo, TokenAmount } from './token-logo'

const PositionCard = ({ position }) => {
  const router = useRouter()

  const {
    pool: { token0, token1, token0Price, fee: poolFee }, id: postionId,
    amount0, amount1,
    tokensOwed0, tokensOwed1,
    token0PriceLower, token0PriceUpper
  } = position || {pool: {}}

  return (
    <Card>
      <Card.Body>
        <Grid.Container>
          <Grid xs={12} sm={9}>
            <Grid.Container gap={1}>
              <Grid xs={12} sm={12}>
                <Row>
                  <Col css={{textAlign: "left"}}>
                    <Badge>{postionId.toString()}</Badge>
                  </Col>
                  <Col css={{textAlign: "center"}}>
                    <Row>
                      <Avatar.Group animated={false}>
                        <TokenLogo address={token0?.address} size="sm"/>
                        <TokenLogo address={token1?.address} size="sm"/>
                      </Avatar.Group>
                      <Text h4>
                        {token0?.symbol} / {token1?.symbol} {poolFee / 10000}%
                      </Text>
                    </Row>
                  </Col>
                  <Col css={{textAlign: "right"}}>
                    <Badge size="md">
                      {(
                        token0Price >= token0PriceLower &&
                        token0Price <= token0PriceUpper
                      ) ? "in range" : "out of range"}
                    </Badge>
                  </Col>
                </Row>
              </Grid>
              <Grid xs={12} sm={4} direction='column'>
                <Text weight="bold">Range</Text>
                <Text><b>Min:</b> {token0PriceLower?.toSignificant()}</Text>
                <Text><b>Max:</b> {token0PriceUpper?.toSignificant()}</Text>
              </Grid>
              <Grid xs={12} sm={4} direction='column'>
                <Text weight="bold">Liquidity</Text>
                <TokenAmount token={token0} amount={amount0?.toSignificant(4)}/>
                <TokenAmount token={token1} amount={amount1?.toSignificant(4)}/>
              </Grid>
              <Grid xs={12} sm={4} direction='column'>
                <Text weight="bold">Fees owed</Text>
                <TokenAmount token={token0} amount={tokensOwed0?.toSignificant(4)}/>
                <TokenAmount token={token1} amount={tokensOwed1?.toSignificant(4)}/>
              </Grid>
            </Grid.Container>
          </Grid>
          <Grid xs={12} sm={3} direction="column" justify="center">
            <Grid.Container gap={1}>
              <Grid xs={12}>
                <Button css={{width:'$full'}}
                  onPress={() => router.push(`${position.id}/compound`)}
                >Compound fees</Button>
              </Grid>
              <Grid xs={12}>
                <Button css={{width:'$full'}}
                  onPress={() => router.push(`${position.id}/change-range`)}
                >Change price range</Button>
              </Grid>
              <Grid xs={12}>
                <Button css={{width:'$full'}}
                  onPress={() => router.push(`${position.id}/close`)}
                >Close and Swap</Button>
              </Grid>
            </Grid.Container>
          </Grid>
        </Grid.Container>
      </Card.Body>
    </Card>
  )
}

export default PositionCard

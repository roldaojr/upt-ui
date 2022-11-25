import {
  Grid, Card, Button, Row, Text, Badge, Avatar, Col
} from '@nextui-org/react'
import { TokenLogo, TokenAmount } from './token-logo'

const PositionCard = ({ position, onAction }) => {
  const {
    pool: { token0, token1, token0Price, fee: poolFee },
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
              <Row justify="space-between">
                  <Avatar.Group animated={false}>
                    <TokenLogo address={token0?.address} size="sm"/>
                    <TokenLogo address={token1?.address} size="sm"/>
                  </Avatar.Group>
                  <Text h4>
                      {token0?.symbol} / {token1?.symbol} {poolFee / 10000}%
                  </Text>
                  <Badge size="md">
                    {(
                      token0Price >= token0PriceLower &&
                      token0Price <= token0PriceUpper
                    ) ? "in range" : "out of range"}
                  </Badge>
                </Row>
              </Grid>
              <Grid xs={12} sm={4} direction='column'>
                <Text weight="bold">Range</Text>
                <Text><b>Min:</b> {token0PriceLower?.toSignificant()}</Text>
                <Text><b>Max:</b> {token0PriceUpper?.toSignificant()}</Text>
              </Grid>
              <Grid xs={12} sm={4} direction='column'>
                <Text weight="bold">Liquidity</Text>
                <TokenAmount token={token0} amount={amount0?.toSignificant()}/>
                <TokenAmount token={token1} amount={amount1?.toSignificant()}/>
              </Grid>
              <Grid xs={12} sm={4} direction='column'>
                <Text weight="bold">Fees owed</Text>
                <TokenAmount token={token0} amount={tokensOwed0?.toSignificant()}/>
                <TokenAmount token={token1} amount={tokensOwed1?.toSignificant()}/>
              </Grid>
            </Grid.Container>
          </Grid>
          <Grid xs={12} sm={3} direction="column" justify="center">
            <Grid.Container gap={1}>
              <Grid xs={12}>
                <Button css={{width:'$full'}}
                  onPress={() => onAction("compound", position.id)}
                >Compound fees</Button>
              </Grid>
              <Grid xs={12}>
                <Button css={{width:'$full'}}
                  onPress={() => onAction("change-range", position.id)}
                >Change price range</Button>
              </Grid>
              <Grid xs={12}>
                <Button css={{width:'$full'}}
                  onPress={() => onAction("close", position.id)}
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

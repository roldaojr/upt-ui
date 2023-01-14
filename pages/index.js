import JSBI from 'jsbi'
import { Container, Row, Loading, Card, Spacer, Grid } from '@nextui-org/react'
import PositionCard from '../components/position-card'
import { useFetchPositions } from '../hooks/uniswap-positions'
import { useAccount } from 'wagmi'
import { ApproveForAllButton } from '../components/approve-for-all-button'
import { TestButton } from '../components/test-button'
import { RefreshButton } from '../components/refresh-button'


const PositionListPage = () => {
  const { isConnected } = useAccount()
  const positions = useFetchPositions()

  return (
    <Container lg>
      {isConnected ? (
        <>
          <Row justify="space-between">
            <ApproveForAllButton/>
            <TestButton/>
            <RefreshButton/>
          </Row>
          <Spacer/>
          {!positions?.isSuccess ? (
            <Row justify='center'>
              <Loading
                loadingCss={{ $$loadingSize: "100px", $$loadingBorder: "10px" }}
              />
            </Row>
          ) : (
            positions.data && positions.data.length > 0 ? (
              <Grid.Container gap={2}>
                {positions.data.map((position, idx) => (
                  (position && JSBI.toNumber(position.liquidity) > 0) ? (
                    <Grid xs={12} key={idx}>
                      <PositionCard position={position}/>
                    </Grid>
                  ) : ''
                ))}
              </Grid.Container>
            ) : (
              <Card>
                <Card.Body>No positions found</Card.Body>
              </Card>
            )
          )}
        </>
      ) : (
        <Card>
          <Card.Body>Connect wallet to view positions</Card.Body>
        </Card>
      )}
    </Container>
  )
}

export default PositionListPage

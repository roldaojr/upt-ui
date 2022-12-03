import JSBI from 'jsbi'
import { useState } from 'react'
import { Container, Row, Loading, Card, Spacer, Grid } from '@nextui-org/react'
import PositionCard from '../components/position-card'
import CompoundModal from '../components/compound-modal'
import ChangeRangeModal from '../components/change-range-modal'
import CloseModal from '../components/close-modal'
import { useFetchPositions } from '../hooks/uniswap-positions'
import { useAccount } from '@web3modal/react'
import { ApproveForAllButton } from '../components/approve-for-all-button'
import TestButton from '../components/test-button'

const PositionListPage = () => {
  const { account } = useAccount()
  const positions = useFetchPositions()
  const [ tokenId, setTokenId ] = useState()
  const [ openModal, setModal ] = useState()
  const noModal = () => {
    setModal(null)
    setTokenId(null)
  }
  const positionAction = (action, position) => {
    setModal(action)
    setTokenId(position)
  }

  return (
    <Container lg>
      {account.isConnected ? (
        <>
          <Row justify="space-between">
            <ApproveForAllButton/>
            <TestButton/>
          </Row>
          <Spacer/>
          {positions.isLoading ? (
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
                      <PositionCard position={position} onAction={positionAction}/>
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
      <CompoundModal
        tokenId={tokenId} onClose={noModal}
        open={openModal == "compound"}
      />
      <ChangeRangeModal
        tokenId={tokenId} onClose={noModal}
        open={openModal == "change-range"}
      />
      <CloseModal
        tokenId={tokenId} onClose={noModal}
        open={openModal == "close"}
      />
    </Container>
  )
}

export default PositionListPage

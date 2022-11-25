import JSBI from 'jsbi'
import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { Container, Row, Loading, Card, Spacer, Button, Col, Grid } from '@nextui-org/react'
import PositionCard from '../components/position-card'
import CompoundModal from '../components/compound-modal'
import ChangeRangeModal from '../components/change-range-modal'
import CloseModal from '../components/close-modal'
import { useFetchPositions } from '../hooks/uniswap-positions'
import { useAccount } from '@web3modal/react'
import { ApproveForAllButton } from '../components/approve-for-all-button'
import { HiRefresh as RefreshIcon } from "react-icons/hi"
import TestButton from '../components/test-button'

const PositionListPage = () => {
  const queryClient = useQueryClient()
  const { account } = useAccount()
  const positions = useFetchPositions(account.isConnected)
  const [ tokenId, setTokenId ] = useState()
  const [ openModal, setModal ] = useState()
  const noModal = () => setModal(null)
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
            <Button
              auto disabled={positions.isLoading}
              onPress={() => queryClient.invalidateQueries("positions")}
            >
              <RefreshIcon/>
            </Button>
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
                    <Grid xs={12}>
                      <PositionCard key={idx} position={position} onAction={positionAction}/>
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

      {(tokenId && openModal) ? (
        <>
          {openModal == "compound" ? (
            <CompoundModal tokenId={tokenId} visible={true} onClose={noModal}/>
          ) : ''}
          {openModal == "change-range" ? (
            <ChangeRangeModal tokenId={tokenId} visible={true} onClose={noModal}/>
          ) : ''}
          {openModal == "close" ? (
            <CloseModal tokenId={tokenId} visible={true} onClose={noModal} />
          ) : ''}
        </>
      ) : ''}
    </Container>
  )
}

export default PositionListPage

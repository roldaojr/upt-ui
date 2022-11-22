import { useState } from 'react'
import { Container, Row, Loading, Card, Spacer, Button } from '@nextui-org/react'
import PositionCard from '../components/position-card'
import CompoundModal from '../components/compound-modal'
import ChangeRangeModal from '../components/change-range-modal'
import CloseModal from '../components/close-modal'
import { useFetchPositions } from '../hooks/uniswap-positions'
import { useAccount } from '@web3modal/react'
import { ApproveForAllButton } from '../components/approve-for-all-button'
import { HiRefresh as RefreshIcon } from "react-icons/hi"

const PositionListPage = () => {
  const { account } = useAccount()
  const positions = useFetchPositions()
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
              onPress={positions.refetch}
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
              <>
                {positions.data.map((position, idx) => (
                  <PositionCard key={idx} position={position} onAction={positionAction}/>
                ))}
              </>
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

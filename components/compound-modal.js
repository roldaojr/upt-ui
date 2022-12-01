import { Fragment, useCallback } from 'react'
import { Button, Loading, Modal, Row, Text } from '@nextui-org/react'
import { TokenLogo } from './token-logo'
import {
  useFetchPostionById, useApprovePosition
} from '../hooks/uniswap-positions'
import { useContractMutation } from '../hooks/app-contracts'

const CompoundModal = ({ open, onClose, tokenId }) => {
  const position = useFetchPostionById(tokenId)
  const {
    pool: { token0, token1 }, tokensOwed0, tokensOwed1,
  } = position.data || {pool: {}}
  // approval hook
  const approval = useApprovePosition(tokenId)
  // contract hook
  const compound = useContractMutation(
    "UniswapPositionTools", "swapAndCompound", {onSuccess: onClose}
  )
  // confirm callback
  const onConfirm = useCallback(() => {
    compound.mutate([tokenId])
  }, [compound, tokenId])

  return (
    <Modal closeButton aria-labelledby="modal-title" open={open} onClose={onClose}>
      <Modal.Header>
        <Text id="modal-title">Collect and compound fees?</Text>
      </Modal.Header>
      <Modal.Body>
        {position.isLoading ? (
          <Loading type="points" size="xl" />
        ) : (
          <Fragment>
            <Row>
              <TokenLogo address={token0?.address} size="xs"/>
              {tokensOwed0?.toSignificant()} {token0?.symbol}
            </Row>
            <Row>
              <TokenLogo address={token1?.address} size="xs"/>
              {tokensOwed1?.toSignificant()} {token1?.symbol}
            </Row>
          </Fragment>
        )}
      </Modal.Body>
      <Modal.Footer>
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
      </Modal.Footer>
    </Modal>
  )
}

export default CompoundModal

import { Modal, Button, Text, Loading, Grid, Image } from '@nextui-org/react'
import { useCallback } from 'react'
import { useNetwork } from 'wagmi'
import { useTxModal } from '../contexts/TxModalContext'
import { BiErrorCircle } from 'react-icons/bi'
import { BsCheck2Circle } from 'react-icons/bs'


export const TransactionModal = () => {
  const txStatus = {
    "send": "Sending transaction",
    "success": "Transaction Sent",
    "error": "Transaction error"
  }
  const txStatusComponent = {
    "send": <Loading type="gradient" size="xl" />,
    "success": (
      <Text size={75} color="success"><BsCheck2Circle/></Text>
    ),
    "error": (
      <Text size={75} color="error"><BiErrorCircle/></Text>
    )
  }

  const { chain } = useNetwork()
  const { status, setStatus, tx, setTx } = useTxModal()
  const explorer = chain?.blockExplorers?.default

  const closeModal = useCallback(() => {
    setStatus(null)
    setTx(null)
  }, [setStatus, setTx])

  const openExplorer = useCallback(() => {
    window.open(`${explorer.url}/tx/${tx.hash}`)
  }, [explorer, tx])

  return (
    <Modal closeButton aria-labelledby="modal-title" open={!!status} onClose={closeModal}>
      <Modal.Header>
        <Text id="modal-title">{txStatus[status]}</Text>
      </Modal.Header>
      <Modal.Body>
        <Grid.Container gap={1} justify="center">
          <Grid css={{textAlign: "center"}}>
            {txStatusComponent[status]}
            {tx && tx.message ? (
              <Text>{tx.message}</Text>
            ): ""}
          </Grid>
        </Grid.Container>
      </Modal.Body>
      <Modal.Footer>
        {(explorer && tx?.hash) ? (
          <Button size="lg" css={{ width: "$full" }} onPress={openExplorer}>
            View on {explorer.name}
          </Button>
        ): ""}
        <Button size="lg" css={{ width: "$full" }}
          onPress={closeModal} disabled={status == "send"}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}


TransactionModal.mutationOptions = (options) => {
  const { setStatus, setTx } = useTxModal()

  return {
      ...options,
      onMutate: (...args) => {
          setStatus("send")
          if(options?.onMutate) options.onMutate(...args)
      },
      onError: (...args) => {
          setStatus("error")
          setTx(args[0])
          if(options?.onError) options.onError(...args)
      },
      onSuccess: (...args) => {
          setStatus("success")
          setTx(args[0])
          if(options?.onSuccess) options.onSuccess(...args)
      }
  }
}

export default TransactionModal

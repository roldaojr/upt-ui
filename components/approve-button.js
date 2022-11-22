import { Button } from "@nextui-org/react"

export const ApproveButton = ({isLoading, write}) => {
  <Button size="lg" css={{ width: "$full" }} disabled={isLoading}
    onPress={async () => write()}
  >{isLoading ? 'Approving' : 'Approve'}</Button>
}

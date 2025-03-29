import { Button } from './ui/button'

interface Props {
  onClick: () => void
  isVisible: boolean
}

export const DelegateSearchButton = ({ onClick, isVisible }: Props) => {
  return (
    <Button onClick={onClick}>
      {isVisible ? 'Hide Search' : 'Search Delegates'}
    </Button>
  )
}

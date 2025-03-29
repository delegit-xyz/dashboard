import { Input } from './ui/input'
import { Title } from './ui/title'

interface Props {
  onSearch: (term: string) => void
  delegateValue: string
}

export const DelegateSearch = ({ delegateValue, onSearch }: Props) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onSearch(value)
  }

  return (
    <>
      <Title>Delegate Search</Title>

      <Input
        placeholder={'Type in a Delegate to search...'}
        value={delegateValue}
        onChange={handleSearch}
      />
    </>
  )
}

import { Input } from './ui/input'

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
      <Input
        placeholder={'Type in a Delegate Name or Address to search...'}
        value={delegateValue}
        onChange={handleSearch}
        className="mb-5"
      />
    </>
  )
}

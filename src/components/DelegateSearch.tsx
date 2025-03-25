import { useState } from 'react'
import { Input } from './ui/input'

export const DelegateSearch = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  return (
    <Input
      placeholder={'Type in a Delegate to search...'}
      value={searchTerm}
      onChange={handleSearch}
    />
  )
}

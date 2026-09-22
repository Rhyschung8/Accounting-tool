import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MoneyDisplay } from '../../src/ui/components/MoneyDisplay'

describe('MoneyDisplay', () => {
  it('shows positive pounds even for a negative value', () => {
    render(<MoneyDisplay pence={-3000} />)
    expect(screen.getByText('£30.00')).toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BilingualLabel } from '../../src/ui/components/BilingualLabel'
import { MoneyDisplay } from '../../src/ui/components/MoneyDisplay'

describe('BilingualLabel', () => {
  it('shows Korean then English', () => {
    render(<BilingualLabel k="moneyIn" />)
    expect(screen.getByText('수입 / Money in')).toBeInTheDocument()
  })
})

describe('MoneyDisplay', () => {
  it('shows positive pounds even for a negative value', () => {
    render(<MoneyDisplay pence={-3000} />)
    expect(screen.getByText('£30.00')).toBeInTheDocument()
  })
})

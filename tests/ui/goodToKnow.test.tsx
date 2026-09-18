import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoodToKnow } from '../../src/ui/GoodToKnow'

describe('GoodToKnow', () => {
  it('renders topics and the not-advice disclaimer', () => {
    render(<GoodToKnow />)
    expect(screen.getByText(/Good to know/i)).toBeInTheDocument()
    expect(screen.getByText(/not personal tax advice/i)).toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HowToUse } from '../../src/ui/HowToUse'

describe('HowToUse', () => {
  it('renders navigation topics bilingually', () => {
    const { container } = render(<HowToUse />)
    expect(screen.getByRole('heading', { name: /How to use/i })).toBeInTheDocument()
    expect(screen.getByText(/Using the menu/i)).toBeInTheDocument()
    expect(container.querySelectorAll('details').length).toBeGreaterThan(0)
  })
})

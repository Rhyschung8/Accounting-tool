// tests/ui/filingWalkthrough.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilingWalkthrough } from '../../src/ui/FilingWalkthrough'
import type { FilingFigures } from '../../src/domain/filingFigures'

const profit: FilingFigures = {
  taxYear: '2025/26', turnoverPence: 842000, expensesPence: 193000,
  netPence: 649000, isLoss: false, byCategory: [{ key: 'equipment', amountPence: 120000 }],
}

describe('FilingWalkthrough', () => {
  it('shows turnover, expenses and net-profit amounts with their box numbers', () => {
    render(<FilingWalkthrough figures={profit} />)
    expect(screen.getByText('£8,420.00')).toBeInTheDocument()
    expect(screen.getByText('£1,930.00')).toBeInTheDocument()
    expect(screen.getByText('£6,490.00')).toBeInTheDocument()
    // Box number headings: component renders "칸 9" for turnover and "칸 20" for expenses
    expect(screen.getByText(/칸 9|box 9/i)).toBeInTheDocument()
    expect(screen.getByText(/칸 20|box 20/i)).toBeInTheDocument()
  })
  it('shows a calm loss message instead of a negative for a loss year', () => {
    const loss: FilingFigures = { ...profit, netPence: -50000, isLoss: true }
    render(<FilingWalkthrough figures={loss} />)
    expect(screen.getByText(/carried forward|다음 해/i)).toBeInTheDocument()
  })
})

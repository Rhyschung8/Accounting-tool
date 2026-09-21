import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { PageHelp } from '../../src/ui/components/PageHelp'

const content = {
  titleKo: '테스트 제목',
  titleEn: 'Test title',
  bodyKo: '테스트 내용입니다.',
  bodyEn: 'This is test body text.',
}

describe('PageHelp', () => {
  it('hides the help content until the trigger is clicked', () => {
    render(<PageHelp content={content} />)
    expect(screen.queryByText('Test title')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /help|도움말/i })).toBeInTheDocument()
  })

  it('shows bilingual content after clicking the trigger, and hides it again on a second click', async () => {
    render(<PageHelp content={content} />)

    const trigger = screen.getByRole('button', { name: /help|도움말/i })
    await act(async () => { trigger.click() })

    expect(screen.getByText('Test title')).toBeInTheDocument()
    expect(screen.getByText('This is test body text.')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await act(async () => { trigger.click() })
    expect(screen.queryByText('Test title')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

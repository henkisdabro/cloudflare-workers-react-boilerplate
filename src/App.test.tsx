import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Vite + React + Cloudflare'
    )
  })

  it('renders the count button', () => {
    render(<App />)
    expect(
      screen.getByRole('button', { name: /increment/i })
    ).toBeInTheDocument()
  })

  it('renders the API button', () => {
    render(<App />)
    expect(
      screen.getByRole('button', { name: /get name/i })
    ).toBeInTheDocument()
  })
})

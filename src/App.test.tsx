import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the EduNova brand on the login screen when logged out', () => {
    localStorage.clear()
    render(<App />)
    expect(screen.getAllByText(/EduNova/i)[0]).toBeInTheDocument()
  })
})

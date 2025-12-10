'use client'

interface OrnamentalDividerProps {
  className?: string
  variant?: 'simple' | 'ornate'
}

export default function OrnamentalDivider({ className = '', variant = 'ornate' }: OrnamentalDividerProps) {
  if (variant === 'simple') {
    return (
      <div className={`wedding-divider ${className}`}></div>
    )
  }

  return (
    <div className={`ornamental-divider ${className}`}></div>
  )
}


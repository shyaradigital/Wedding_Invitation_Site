'use client'

import FloatingPetals from './FloatingPetals'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FloatingPetals />
      {children}
    </>
  )
}


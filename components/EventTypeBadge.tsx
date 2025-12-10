interface EventTypeBadgeProps {
  eventAccess: string[]
  size?: 'sm' | 'md' | 'lg'
}

export default function EventTypeBadge({ eventAccess, size = 'md' }: EventTypeBadgeProps) {
  const isAllEvents = eventAccess.length === 3 && 
    eventAccess.includes('mehndi') && 
    eventAccess.includes('wedding') && 
    eventAccess.includes('reception')

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  if (isAllEvents) {
    return (
      <span className={`inline-flex items-center font-semibold rounded-full ${sizeClasses[size]} bg-wedding-gold/20 text-wedding-navy border border-wedding-gold/30`}>
        🎉 All Events
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${sizeClasses[size]} bg-wedding-rose-pastel text-wedding-navy border border-wedding-rose/30`}>
      🎉 Reception Only
    </span>
  )
}


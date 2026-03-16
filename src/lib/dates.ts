// Format: "Wednesday, 16th October 2024"
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'Z')
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const dayName = days[date.getUTCDay()]
  const day = date.getUTCDate()
  const suffix = getOrdinalSuffix(day)
  const month = months[date.getUTCMonth()]
  const year = date.getUTCFullYear()

  return `${dayName}, ${day}${suffix} ${month} ${year}`
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

// Format: "5:30pm - 7:00pm"
export function formatTime(startStr: string, endStr: string): string {
  return `${formatSingleTime(startStr)} - ${formatSingleTime(endStr)}`
}

function formatSingleTime(dateStr: string): string {
  const date = new Date(dateStr + 'Z')
  let hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12 || 12
  const mins = minutes > 0 ? `:${String(minutes).padStart(2, '0')}` : ':00'
  return `${hours}${mins}${ampm}`
}

export function isArchived(startTime: string): boolean {
  return new Date(startTime + 'Z') < new Date()
}

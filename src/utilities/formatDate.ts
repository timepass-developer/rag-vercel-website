/**
 * Format a date string in a user-friendly format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Unknown date'

  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    // Format the date (e.g., "May 5, 2023")
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Unknown date'
  }
}

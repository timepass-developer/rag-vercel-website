// This utility function synchronizes the header theme with the application theme state
// It handles toggling classes or other DOM operations needed when the theme changes
export const headerSyncNav = (theme: string): void => {
  // Synchronize header theme with document attributes if needed
  if (typeof document !== 'undefined') {
    // Remove any existing theme classes from document
    document.documentElement.classList.remove('header-theme-light', 'header-theme-dark')

    // Add the appropriate theme class
    document.documentElement.classList.add(`header-theme-${theme}`)

    // Store the current theme in local storage for persistence
    localStorage.setItem('header-theme', theme)
  }
}

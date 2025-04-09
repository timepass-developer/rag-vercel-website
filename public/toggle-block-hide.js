document.addEventListener('DOMContentLoaded', () => {
  const spans = document.querySelectorAll('span')
  spans.forEach((span) => {
    if (span.textContent.trim() === 'Toggle block') {
      span.style.display = 'none'
    }
  })
})

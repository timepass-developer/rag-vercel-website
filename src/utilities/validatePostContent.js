/**
 * Helper function to validate blog post content structure
 * Run this before seeding to catch issues with content blocks
 */
function validatePostContent(content) {
  if (!content || typeof content !== 'object') {
    console.error('Content is missing or not an object')
    return false
  }

  // Check if root exists
  if (!content.root) {
    console.error('Content is missing root property')
    return false
  }

  // Helper function to recursively validate nodes
  function validateNode(node) {
    if (!node) return true

    // Check for block nodes that need special validation
    if (node.type === 'block') {
      if (node.fields && node.fields.blockType === 'code') {
        // Validate code blocks have a language property
        if (!node.fields.language) {
          console.error('Code block is missing language property:', node)
          return false
        }

        // Make sure language is a valid string
        if (typeof node.fields.language !== 'string' || !node.fields.language.trim()) {
          console.error('Code block has invalid language property:', node)
          return false
        }
      }
    }

    // If node has children, validate each child
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        if (!validateNode(child)) {
          return false
        }
      }
    }

    return true
  }

  return validateNode(content.root)
}

module.exports = validatePostContent

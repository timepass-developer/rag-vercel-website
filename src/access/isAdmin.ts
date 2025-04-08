import { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  // Grant access if user has admin role
  // Use type assertion to inform TypeScript about the roles property
  if (user && (user as any).roles?.includes('admin')) {
    return true
  }

  // Otherwise, deny access
  return false
}

// Allow access if user is an admin or the creator of the document
export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  // If not logged in, deny access
  if (!user) return false

  // If user is an admin, grant access
  if ((user as any).roles?.includes('admin')) return true

  // If document ID matches user ID, grant access
  if (user.id === id) return true

  // Otherwise, allow access only to documents where the user is the author
  return {
    author: {
      equals: user.id,
    },
  }
}

// Field-level access for admin-only fields
export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  if (user && (user as any).roles?.includes('admin')) {
    return true
  }

  return false
}

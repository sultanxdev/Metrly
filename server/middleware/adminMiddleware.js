// This middleware is redundant if `authorize('admin')` is used directly in routes.
// Keeping it for demonstration if a separate admin check is preferred.

import { authorize } from "./authMiddleware.js"

export const adminProtect = (req, res, next) => {
  authorize("admin")(req, res, next)
}

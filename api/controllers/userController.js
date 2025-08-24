// api/controllers/userController.js
// Controller for handling user CRUD operations.  Currently this
// module exposes an endpoint to create or update a user's details
// based on their email address.

import asyncHandler from '../utils/asyncHandler.js';
import UserService from '../services/userService.js';

/**
 * POST /api/users
 *
 * Store user details.  If a user already exists with the given
 * email, their information is updated; otherwise a new user is
 * created.  Expected body fields:
 *   - email (string, required): User's email address
 *   - givenName (string, optional): User's given name
 *   - familyName (string, optional): User's family name
 *   - gradeLevel (string, optional): User's grade level
 *
 * Returns the upserted user row.
 */
export const storeUser = asyncHandler(async (req, res) => {
  const { email, givenName, familyName, gradeLevel } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    const user = await UserService.createOrUpdateUser({ givenName, familyName, email, gradeLevel });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to store user details' });
  }
});

export default { storeUser };
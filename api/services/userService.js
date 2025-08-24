// api/services/userService.js
// Service responsible for persisting user details into the database.
// It provides functionality to insert a new user or update an existing
// user based on their unique email address.

import { query } from '../db/pool.js';

class UserService {
  /**
   * Create a new user or update an existing user by email.  If a user
   * with the given email already exists, their details (given name,
   * family name, grade level) are updated.  Otherwise a new user
   * record is created.  The function returns the inserted or
   * updated user row.
   *
   * @param {Object} params
   * @param {string|null} params.givenName - The user's given name
   * @param {string|null} params.familyName - The user's family name
   * @param {string} params.email - The user's email address (unique key)
   * @param {string|null} params.gradeLevel - The user's grade level
   * @returns {Promise<Object>} The inserted or updated user row
   */
  async createOrUpdateUser({ givenName, familyName, email, gradeLevel }) {
    const result = await query(
      `INSERT INTO users (given_name, family_name, email, grade_level)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE
       SET given_name = EXCLUDED.given_name,
           family_name = EXCLUDED.family_name,
           grade_level = EXCLUDED.grade_level
       RETURNING user_id AS "userId", given_name AS "givenName", family_name AS "familyName", email, grade_level AS "gradeLevel"`,
      [givenName || null, familyName || null, email.toLowerCase(), gradeLevel || null]
    );
    return result.rows[0];
  }
}

export default new UserService();
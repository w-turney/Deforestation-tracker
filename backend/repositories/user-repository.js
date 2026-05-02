import pool from '../db/connect.js'

export const findUserById = async (id) => {
    const { rows } = await pool.query(
        'SELECT id, is_guest, created_at FROM users WHERE id = $1',
        [id]
    )
    return rows[0] ?? null
}

export const addUser = async () => {
    const { rows } = await pool.query(
        'INSERT INTO users (is_guest) VALUES (true) RETURNING id, is_guest, created_at'
    )
    return rows[0]
}
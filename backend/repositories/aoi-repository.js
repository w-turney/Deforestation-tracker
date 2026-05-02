import pool from '../db/connect.js'
import NotFoundError from '../errors/not-found.js'
import DataIntegrityError from '../errors/data-integrity.js'

export const addAoi = async (userId, feature, geometry, name) => {
    const featureJson = JSON.stringify(feature)
    const geometryJson = JSON.stringify(geometry)
    const { rows } = await pool.query(
        `INSERT INTO aois (user_id, geojson, geom, name)
        VALUES (
            $1,
            $2::jsonb,
            ST_Multi(
                ST_MakeValid(
                    ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)
                )
            ),
            $4
        )
        RETURNING id`,
        [userId, featureJson, geometryJson, name]
    )
    const id = rows[0]?.id
    if (!id) throw new DataIntegrityError('AOI insert succeeded without returning an id')
    return id
}

export const getAois = async (userId) => {
    const { rows } = await pool.query(
        `SELECT id,
                name,
                jsonb_set(geojson, '{geometry}', ST_AsGeoJSON(geom)::jsonb) AS geojson
        FROM aois
        WHERE user_id = $1`,
        [userId]
    )
    return rows
}

export const deleteAoi = async (aoiId, userId) => {
    const { rowCount } = await pool.query(
        `DELETE FROM aois
        WHERE id = $1
        AND user_id = $2`,
        [aoiId, userId]
    )
    if (!rowCount) throw new NotFoundError("Couldn't find AOI to delete")
}

export const getAoi = async (id, userId) => {
    const { rows } = await pool.query(
        `SELECT id,
                name,
                jsonb_set(geojson, '{geometry}', ST_AsGeoJSON(geom)::jsonb) AS geojson,
                to_char(created_at::date, 'YYYY-MM-DD') AS created_date
        FROM aois
        WHERE id = $1
        AND user_id = $2`,
        [id, userId]
    )
    if (!rows[0]) throw new NotFoundError('Requested AOI not found')
    return rows[0]
}
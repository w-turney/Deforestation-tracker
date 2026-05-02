import ExternalApiError from "../errors/external-api.js"
import { getXDaysAgo } from "../helpers/getXDaysAgo.js"

const queryGfw = async (sql, geometry) => {
    let res
    try {
        res = await fetch(`https://data-api.globalforestwatch.org/dataset/gfw_integrated_alerts/latest/query/json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.API_KEY
                },
                body: JSON.stringify({
                    sql,
                    geometry
                }),
                signal: AbortSignal.timeout(20000)
            }
        )
    } catch (err) {
        throw new ExternalApiError(`Error connecting to GFW API`)
    }
    let data
    try {
        data = await res.json()
    } catch (err) {
        throw new ExternalApiError('GFW API returned invalid JSON')
    }
    if (!res.ok) throw new ExternalApiError(data?.message || 'GFW API request failed')
    return data
}

export const fetchAlerts = async (geometry, created_date) => {
    const sql = `SELECT longitude, latitude,
                    gfw_integrated_alerts__date AS date,
                    gfw_integrated_alerts__intensity AS intensity,
                    gfw_integrated_alerts__confidence AS confidence
                FROM results
                WHERE gfw_integrated_alerts__date >= '${created_date}'
                AND (
                    gfw_integrated_alerts__confidence = 'highest'
                    OR gfw_integrated_alerts__confidence = 'high'
                )
                ORDER BY gfw_integrated_alerts__date DESC
                LIMIT 200`
    const alerts = await queryGfw(sql, geometry)
    if (!Array.isArray(alerts?.data)) throw new ExternalApiError('GFW sent data in unexpected format')
    return alerts.data
}

export const fetchAlertSummary = async (geometry, created_date) => {
    const sql = `SELECT
                    COUNT(*),
                    SUM(area__ha) AS alerted_area_ha
                FROM results
                WHERE gfw_integrated_alerts__date >= '${created_date}'
                AND (
                    gfw_integrated_alerts__confidence = 'highest'
                    OR gfw_integrated_alerts__confidence = 'high'
                )
                `
    const alertSummary = await queryGfw(sql, geometry)
    const summaryRow = alertSummary?.data?.[0]
    if (!summaryRow) throw new ExternalApiError('GFW sent data in unexpected format')
    return {
        alert_count: Number(summaryRow.count ?? 0),
        alerted_area_ha: Number(summaryRow.alerted_area_ha ?? 0).toFixed(2),
        created_date
    }
}

export const fetchTrendAlerts = async (geometry, days) => {
    const startDate = getXDaysAgo(days)
    const sql = `SELECT
                    gfw_integrated_alerts__date AS date
                FROM results
                WHERE gfw_integrated_alerts__date >= '${startDate}'
                AND (
                    gfw_integrated_alerts__confidence = 'highest'
                    OR gfw_integrated_alerts__confidence = 'high'
                )
                `
    const trendAlerts = await queryGfw(sql, geometry)
    if (!Array.isArray(trendAlerts?.data)) throw new ExternalApiError('GFW sent data in unexpected format')
    return trendAlerts.data
}
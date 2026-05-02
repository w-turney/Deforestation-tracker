import express from 'express'
import authMiddleware from '../middleware/auth.js'
import DataIntegrityError from '../errors/data-integrity.js'
import { validateAoi } from '../helpers/validateAoi.js'
import { addAoi, getAois, deleteAoi, getAoi } from '../repositories/aoi-repository.js'
import { fetchAlerts, fetchAlertSummary, fetchTrendAlerts } from '../services/gfw.js'
import { barChartData } from '../helpers/compileTrendData.js'

const router = express.Router()

router.post('/aois', authMiddleware, async (req, res) => {
    const { aoi: feature, trimmedName } = req.body
    const geometry = feature?.geometry
    const name = validateAoi(feature, trimmedName, geometry)
    const id = await addAoi(req.userId, feature, geometry, name)
    res.status(201).json({
        ok: true,
        id,
        message: `AOI created, id: ${id}`
    })
})

router.get('/aois', authMiddleware, async (req, res) => {
    const rows = await getAois(req.userId)
    const features = rows.map(row => (
        {
            ...row.geojson,
            properties: {
                ...(row.geojson.properties || {}),
                id: row.id,
                name: row.name
            }
        }
    ))
    res.status(200).json({
        ok: true,
        data: features
    })
})

router.get('/aois/:id/alerts', authMiddleware, async (req, res) => {
    const { id } = req.params
    const aoi = await getAoi(id, req.userId)
    const { geojson, created_date, name } = aoi
    const geometry = geojson?.geometry
    if (!geometry) throw new DataIntegrityError('AOI exists but geometry is missing')
    if (!created_date) throw new DataIntegrityError('AOI exists but created_date is missing')
    if (!name) throw new DataIntegrityError('AOI exists but name is missing')
    const [alerts, alertSummary] = await Promise.all([
        fetchAlerts(geometry, created_date),
        fetchAlertSummary(geometry, created_date),
    ])
    let trendData = null
    let trendDaysUsed = null
    const trendDays = 60
    const backupTrendDays = 30
    try {
        const trendAlerts = await fetchTrendAlerts(geometry, trendDays)
        trendData = barChartData(trendAlerts, trendDays)
        trendDaysUsed = trendDays
    } catch (err) {
        console.error(`Trend request for ${trendDays} days failed:`, err.message)
        try {
            const backupTrendAlerts = await fetchTrendAlerts(geometry, backupTrendDays)
            trendData = barChartData(backupTrendAlerts, backupTrendDays)
            trendDaysUsed = backupTrendDays
        } catch (err) {
            console.error(`Backup trend request for ${backupTrendDays} days failed:`, err.message)
            trendData = null
            trendDaysUsed = null
        }
    }
    res.status(200).json({
        ok: true,
        data: {
            name,
            aoi: geojson,
            alerts,
            alertSummary,
            trendData,
            trendDaysUsed
        }
    })
})

router.delete('/aois/:id', authMiddleware, async (req, res) => {
    const { id } = req.params
    await deleteAoi(id, req.userId)
    res.status(200).json({
        ok: true,
        message: `Deleted aoi ${id}`
    })
})

export default router
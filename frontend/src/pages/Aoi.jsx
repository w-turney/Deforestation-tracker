import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, CircleMarker } from "react-leaflet"
import AlertsTable from "../components/AlertsTable"
import FitAoiBounds from "../components/FitAoiBounds"
import { apiJson } from "../lib/api"
import TrendBarChart from "../components/TrendBarChart.jsx"
import '../css/Aoi.css'

function Aoi({ setAllAois }) {
    const { id } = useParams()
    const navigate = useNavigate()

    const [alertSummary, setAlertSummary] = useState(null)
    const [trendData, setTrendData] = useState(null)
    const [trendDaysUsed, setTrendDaysUsed] = useState(null)
    const [name, setName] = useState(null)
    const [alerts, setAlerts] = useState([])
    const [latLong, setLatLong] = useState(null)
    const [aoiGeojson, setAoiGeojson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [confirmingDelete, setConfirmingDelete] = useState(false)

    useEffect(() => {
        (async () => {
            setError(null)
            setLoading(true)
            try {
                const { data } = await apiJson(`/api/aois/${id}/alerts`)
                setName(data.name)
                setAoiGeojson(data.aoi)
                setAlerts(data.alerts ?? [])
                setAlertSummary(data.alertSummary ?? null)
                setTrendData(data.trendData)
                setTrendDaysUsed(data.trendDaysUsed)
            } catch (err) {
                console.error(err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        })()
    }, [id])

    const handleDelete = async () => {
        setError(null)
        try {
            if (!id) return
            await apiJson(`/api/aois/${id}`, { method: 'DELETE' })
            setAllAois(prev =>
                Array.isArray(prev)
                    ? prev.filter(aoi => String(aoi?.properties?.id) !== id)
                    : prev)
            navigate('/')
        } catch (err) {
            console.error(err)
            setError(err.message)
        }
    }
    const handleRowClick = ({ longitude, latitude }) => {
        setLatLong(prev => {
            if (Array.isArray(prev) && prev[0] === latitude && prev[1] === longitude) {
                return null
            }
            return [latitude, longitude]
        })
    }

    const safeAlerts = Array.isArray(alerts) ? alerts : []
    const hasAlerts = !loading && !error && safeAlerts.length > 0
    const showEmptyState = !loading && !error && safeAlerts.length === 0
    const showMap = !loading && !error

    return (
        <div className="aoi-container">
            <div className="alerts-container">
                <div className="alerts-content">
                    {loading && (
                        <div className="message info">
                            Loading alerts...
                        </div>
                    )}

                    {!loading && name && (
                        <h1>Alerts for {name}</h1>
                    )}

                    {error && (
                        <div className="message error">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {showEmptyState && (
                        <div className="message info">No alerts found for this AOI.</div>
                    )}

                    {alertSummary && hasAlerts && (
                        <div className="alerts-trend-summary-div">
                            <div className="alerts-summary-div">
                                <p><strong>Since AOI creation</strong></p>
                                <p>Count: {alertSummary.alert_count}</p>
                                <p>Alerted area (ha): {alertSummary.alerted_area_ha}</p>
                            </div>

                            <div className="alerts-trend-div">
                                {trendData
                                    ? (
                                        <>
                                            <p><strong>{`${trendDaysUsed} day trend`}</strong></p>
                                            <TrendBarChart trendData={trendData} />
                                        </>
                                    )
                                    : (
                                        <div className="message error">
                                            Unable to display trend data
                                        </div>
                                    )}
                            </div>
                        </div>

                    )}

                    {hasAlerts && (
                        <AlertsTable alerts={safeAlerts} handleRowClick={handleRowClick} />
                    )}
                </div>

                <div className="alerts-footer">
                    {!confirmingDelete ? (
                        <button
                            className="aoi-delete-btn"
                            onClick={() => setConfirmingDelete(true)}
                        >
                            Delete AOI
                        </button>
                    ) : (
                        <div className="message error">
                            <p>Delete this AOI permanently?</p>
                            <div className="button-container">
                                <button
                                    className="aoi-delete-btn"
                                    onClick={handleDelete}
                                >
                                    Confirm delete
                                </button>
                                <button
                                    className="cancel-btn"
                                    onClick={() => setConfirmingDelete(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showMap && (
                <MapContainer
                    className="aoi-map"
                    zoom={6}
                    worldCopyJump
                >
                    <TileLayer
                        attribution="© OSM"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {aoiGeojson && (
                        <GeoJSON
                            data={aoiGeojson}
                            style={() => ({
                                weight: 1.2,
                                opacity: 0.9,
                                fillOpacity: 0.25
                            })}
                        />
                    )}
                    <FitAoiBounds aoiGeojson={aoiGeojson} />
                    {latLong && (
                        <Marker position={latLong}>
                            <Popup>Selected alert</Popup>
                        </Marker>
                    )}
                    {safeAlerts.map(alert => {
                        const color = alert.intensity >= 75 ? 'red' : alert.intensity >= 50 ? 'orange' : 'yellow'
                        return (
                            <CircleMarker
                                key={`${alert.longitude}-${alert.latitude}-${alert.date}`}
                                center={[Number(alert.latitude), Number(alert.longitude)]}
                                radius={3}
                                pathOptions={{
                                    color,
                                    fillColor: color,
                                    fillOpacity: 0.8,
                                    weight: 1
                                }}
                            >
                                <Popup>
                                    <div>
                                        <strong>Date:</strong> {alert.date}<br />
                                        <strong>Intensity:</strong> {alert.intensity}<br />
                                        <strong>Confidence:</strong> {alert.confidence}
                                    </div>
                                </Popup>
                            </CircleMarker>
                        )
                    })}

                </MapContainer>
            )}
        </div>
    )
}

export default Aoi
import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from "react-leaflet"
import { EditControl } from "react-leaflet-draw"
import { apiJson } from "../lib/api.js"
import '../css/Home.css'

function Home({ allAois, setAllAois }) {
    const featureGroupRef = useRef(null)
    const geoJsonRef = useRef(null)

    const [aoi, setAoi] = useState(null)
    const [showAllAois, setShowAllAois] = useState(false)
    const [name, setName] = useState('')
    const [error, setError] = useState(null)
    const [status, setStatus] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        if (!showAllAois) {
            setAllAois(null)
            return
        }
        const fetchAois = async () => {
            try {
                const data = await apiJson('/api/aois')
                setAllAois(data.data)
                setError(null)
            } catch (err) {
                console.error(err)
                setError(err.message)
            }
        }
        fetchAois()
    }, [showAllAois, setAllAois])

    const updateAoi = group => {
        const fc = group.toGeoJSON()
        const aoi = fc?.features?.[0]
        setAoi(aoi)
        setStatus(null)
        setError(null)
    }

    const handleDeleted = () => {
        setAoi(null)
        setName('')
        setStatus({ type: "info", message: "AOI removed from the map." })
        setError(null)
    }

    const handleEdited = () => {
        const group = featureGroupRef.current
        if (!group) return
        updateAoi(group)
    }

    const handleCreated = e => {
        const group = featureGroupRef.current
        if (!group) return
        group.clearLayers()
        group.addLayer(e.layer)
        updateAoi(group)
    }

    const handleSubmit = async () => {
        setError(null)
        setStatus(null)
        if (!aoi) {
            setStatus({ type: 'error', message: 'Draw an AOI on the map before saving.' })
            return
        }
        if (!name.trim()) {
            setStatus({ type: 'error', message: 'Enter a name for your AOI.' })
            return
        }
        const trimmedName = name.trim()
        try {
            await apiJson('/api/aois', {
                method: 'POST',
                body: JSON.stringify({ trimmedName, aoi })
            })
            setAoi(null)
            setName('')
            featureGroupRef.current?.clearLayers()
            geoJsonRef.current?.clearLayers?.()
            setShowAllAois(false)
            setStatus({ type: 'success', message: 'AOI saved successfully.' })
        } catch (err) {
            console.error(err)
            setError(err.message)
        }
    }

    return (
        <>
            <div className="header">
                <div className="title-div">
                    <h1>Deforestation Tracker</h1>
                    <p>Draw an area of interest, give it a name, and save it to track alerts.</p>
                </div>
                <button
                    className="view-aois-btn"
                    onClick={() => setShowAllAois(prev => !prev)}
                >
                    {showAllAois ? "Hide AOIs" : "View AOIs"}
                </button>
            </div>
            <MapContainer
                className="home-map"
                center={[0, 0]}
                zoom={2}
                minZoom={2}
                worldCopyJump
            >
                <TileLayer
                    attribution="© OSM"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {allAois && (
                    <GeoJSON
                        ref={geoJsonRef}
                        data={allAois}
                        filter={f =>
                            f?.geometry?.type !== "Point" && f?.geometry?.type !== "MultiPoint"
                        }
                        onEachFeature={(feature, layer) => {
                            layer.bindTooltip(feature?.properties?.name || "")
                            layer.on({
                                click: () => {
                                    const id = feature?.properties?.id
                                    if (!id) return
                                    navigate(`/aoi/${id}`)
                                }
                            })
                        }}
                        style={() => ({
                            weight: 1.2,
                            opacity: 0.9,
                            fillOpacity: 0.25
                        })}
                    />
                )}

                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topleft"
                        onCreated={handleCreated}
                        onEdited={handleEdited}
                        onDeleted={handleDeleted}
                        draw={{
                            polygon: true,
                            rectangle: true,
                            polyline: false,
                            circle: false,
                            circlemarker: false,
                            marker: false
                        }}
                        edit={{
                            edit: {},
                            remove: true
                        }}
                    />
                </FeatureGroup>
            </MapContainer>
            {error && (
                <div className="message error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {status && (
                <div className={`message ${status.type}`}>
                    {status.message}
                </div>
            )}

            <div className="aoi-form">
                <h2>Create area of interest</h2>
                <p>
                    {aoi
                        ? "AOI selected. Give it a name and save it."
                        : "Draw a polygon or rectangle on the map to begin."}
                </p>
                <label htmlFor="aoi-name">AOI name</label>
                <input
                    id="aoi-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Borneo test area"
                    disabled={!aoi}
                />
                <button
                    className="save-aoi-btn"
                    onClick={handleSubmit}
                    disabled={!aoi || !name.trim()}
                >
                    Save AOI
                </button>
            </div>


        </>
    )
}

export default Home

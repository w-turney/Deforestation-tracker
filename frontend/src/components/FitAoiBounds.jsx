import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

const FitAoiBounds = ({ aoiGeojson }) => {
    const map = useMap()
    useEffect(() => {
        if (!aoiGeojson) return
        const bounds = L.geoJSON(aoiGeojson).getBounds()
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20]})
    }, [aoiGeojson, map])
    return null
}

export default FitAoiBounds
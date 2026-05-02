import BadRequestError from "../errors/bad-request.js"

export const validateAoi = (feature, name, geometry) => {
    const trimmedName = typeof name === 'string' ? name.trim() : ''
    if (!feature || !geometry) throw new BadRequestError('No aoi data in request body')
    if (!trimmedName) throw new BadRequestError('No name in request body')
    if (trimmedName.length > 100) throw new BadRequestError('AOI name must be 100 characters or fewer')
    if (feature?.type !== 'Feature') throw new BadRequestError('Expected a GeoJSON feature')
    if (!['Polygon', 'MultiPolygon'].includes(geometry?.type)) throw new BadRequestError('Expected Polygon or Multipolygon geometry')
    return trimmedName
}

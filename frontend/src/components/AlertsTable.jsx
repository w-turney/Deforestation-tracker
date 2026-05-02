import '../css/AlertsTable.css'

const formatCoord = value => {
    const num = Number(value)
    return Number.isFinite(num) ? num.toFixed(4) : value
}

const formatDate = value => {
    const date = new Date(value)
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString('en-GB')
}

const AlertsTable = ({ alerts, handleRowClick }) => {
    if (!alerts.length) {
        return (
            <div className='table-container empty-table'>
                <p>No alerts found for this AOI yet.</p>
            </div>
        )
    }
    return (
        <>
            <div className='table-container'>
                <table className='alerts-table'>
                    <thead>
                        <tr>
                            <th>Longitude</th>
                            <th>Latitude</th>
                            <th>Date</th>
                            <th>Intensity</th>
                            <th>Confidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map(alert => (
                            <tr
                                key={`${alert.longitude}-${alert.latitude}-${alert.date}`}
                                onClick={() => handleRowClick(alert)}
                                tabIndex={0}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        handleRowClick(alert)
                                    }
                                }}
                            >
                                <td>{formatCoord(alert.longitude)}</td>
                                <td>{formatCoord(alert.latitude)}</td>
                                <td>{formatDate(alert.date)}</td>
                                <td>{alert.intensity}</td>
                                <td className='confidence-cell'>
                                    {alert.confidence}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="table-note">*Table and map display up to 200 most recent high/highest confidence alerts</p>
        </>
    )
}

export default AlertsTable
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

function TrendBarChart({ trendData }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    interval={6}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={ {fontSize: "0.75rem"} }
                    tickFormatter={value => value.slice(5).split('-').join('/')}
                />
                <YAxis allowDecimals={false} />
                <Tooltip
                    labelFormatter={label => `Date: ${label}`}
                    formatter={value => [value, 'Alerts']}
                />
                <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                />
            </BarChart>
        </ResponsiveContainer>

    )
}

export default TrendBarChart
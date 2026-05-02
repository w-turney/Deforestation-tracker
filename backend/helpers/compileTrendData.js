import { getXDaysAgo } from "./getXDaysAgo.js"

const formatDate = date => date.toISOString().slice(0, 10)

//for bar chart
export const barChartData = (array, days) => {
    const count = {}
    for (const { date } of array) {
        count[date]
            ? count[date]++
            : count[date] = 1
    }
    const startDate = getXDaysAgo(days -1)
    let current = new Date(startDate)
    const endDate = new Date(getXDaysAgo(0))

    while (current <= endDate) {
        const currentDateString = formatDate(current)
        if (!count[currentDateString]) {
            count[currentDateString] = 0
        }
        current.setUTCDate(current.getUTCDate() + 1)
    }
    return Object.entries(count)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([date, count]) => (
        {
            date,
            count
        }
    ))
}
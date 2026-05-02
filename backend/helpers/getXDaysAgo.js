export const getXDaysAgo = (num) => {
    const date = new Date()
    date.setUTCHours(0, 0, 0, 0)
    date.setUTCDate(date.getUTCDate() - num)
    return date.toISOString().slice(0, 10)
}

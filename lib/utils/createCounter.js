module.exports = () => {
    let count = 0

    return () => {
        count = count >= Number.MAX_SAFE_INTEGER ? 1 : ++count
        return count
    }
}

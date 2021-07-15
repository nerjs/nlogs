const getBufferFromChunk = (chunkBuff, result = []) => {
    if (!chunkBuff) return result
    const { chunk, encoding, next } = chunkBuff
    result.push({ chunk, encoding })
    return getBufferFromChunk(next, result)
}

module.exports = stream => {
    const state = stream._writableState.bufferedRequest
    if (!state) return null
    return getBufferFromChunk(state)
}

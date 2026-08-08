var toH = n => n.toString(16).toUpperCase(),
    sFCP = String.fromCodePoint,
    mF = Math.floor,
    mMx = Math.max,
    mMn = Math.min,
    mC = Math.ceil;

function escapeHTML(e) {
    return String(e).replace(/[&<>'"]/g, e => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    })[e])
}

function safeEncode(e, t) {
    try {
        return e(t)
    } catch (e) {
        return "N/A"
    }
}
function isValidDate(dateStr) {
    if (typeof dateStr !== "string" || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
    const d = new Date(dateStr + "T12:00:00Z");
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

function isFutureDate(dateStr) {
    const d = new Date(dateStr + "T12:00:00Z");
    const avui = new Date();
    avui.setHours(23, 59, 59, 999);
    return d > avui;
}

function parseDate(dateStr) {
    return new Date(dateStr + "T12:00:00Z");
}

module.exports = { isValidDate, isFutureDate, parseDate };

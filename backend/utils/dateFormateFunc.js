// Date Formatting Function

function formatDate(dateTimeString) {
    const date = new Date(dateTimeString);

    // Adjust to Pacific Standard Time (PST) by subtracting 8 hours (in milliseconds)
    const pstDate = new Date(date.getTime() - (8 * 60 * 60 * 1000));

    const year = pstDate.getFullYear();
    const month = String(pstDate.getMonth() + 1).padStart(2, '0');
    const day = String(pstDate.getDate()).padStart(2, '0');
    const hours = String(pstDate.getHours()).padStart(2, '0');
    const minutes = String(pstDate.getMinutes()).padStart(2, '0');
    const seconds = String(pstDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
    formatDate: formatDate
};


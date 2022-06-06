function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

module.exports = function (text) {
    if (typeof text == 'string') {
        const exclude_t = replaceAll(text, '\t', '');
        const exclude_n = replaceAll(exclude_t, '\n', '');

        return exclude_n.trim();
    }
}
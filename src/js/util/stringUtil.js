export function truncate(string, n) {
    return (string.length > n) ? string.substr(0, n - 1) + '\u2026' : string;
}

export function truncateWords(string, n) {
    if (!string) {
        return string;
    }

    let words = string.split(" ");
    return truncate(string, words.splice(0, n < words.length ? n : words.length).join(" ").length + 1);
}

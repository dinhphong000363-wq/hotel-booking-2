/**
 * Clean user data by removing duplicate prefixes
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
export const cleanDuplicatePrefix = (text) => {
    if (!text || typeof text !== 'string') return text;

    // Remove duplicate "user_" prefixes (case insensitive)
    return text.replace(/^(user_)+/gi, '');
};

/**
 * Clean username by removing duplicate prefixes
 * @param {string} username - Username to clean
 * @returns {string} - Cleaned username
 */
export const cleanUsername = (username) => {
    if (!username) return 'Người dùng';

    let cleaned = cleanDuplicatePrefix(username);

    // If username looks like a long random string (from temp email), shorten it
    if (cleaned.length > 20 && /^[a-zA-Z0-9]+$/.test(cleaned)) {
        return cleaned.substring(0, 15) + '...';
    }

    return cleaned;
};

/**
 * Clean email by removing duplicate prefixes
 * @param {string} email - Email to clean
 * @returns {string} - Cleaned email
 */
export const cleanEmail = (email) => {
    if (!email) return '';
    return cleanDuplicatePrefix(email);
};

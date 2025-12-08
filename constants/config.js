// Application configuration constants
const CONFIG = {
    SESSION: {
        NAME: 'notion_session',
        MAX_AGE: 1000 * 60 * 60, // 1 hour
        HTTP_ONLY: true,
        SAME_SITE: 'lax'
    },
    API: {
        DEFAULT_RECENT_TRANSACTIONS_LIMIT: 5,
        MAX_RECENT_TRANSACTIONS_LIMIT: 100
    },
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 100,
        MAX_PAGE_SIZE: 100
    }
};

module.exports = {
    CONFIG
};

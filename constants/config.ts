export const APP_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  },
  FILE_UPLOAD: {
    MAX_SIZE_MB: 10,
    ALLOWED_TYPES: [".pdf", ".jpg", ".jpeg", ".png"],
    ALLOWED_MIME_TYPES: ["application/pdf", "image/jpeg", "image/png"],
  },
  DEBOUNCE_DELAY_MS: 300,
  TOKEN_KEY: "ak_traders_token",
  REFRESH_TOKEN_KEY: "ak_traders_refresh_token",
  USER_KEY: "ak_traders_user",
};

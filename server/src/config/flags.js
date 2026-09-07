// ─────────────────────────────────────────────────────────────────────────────
// SKIP_DB_TEMP — single source of truth
// ─────────────────────────────────────────────────────────────────────────────
// Set to true  → bypass MongoDB entirely; use in-memory mock data (nothing persists).
// Set to false → run real Clerk + MongoDB logic unchanged.
//
// TO REVERSE: change the line below to: const SKIP_DB_TEMP = false;
// ─────────────────────────────────────────────────────────────────────────────
const SKIP_DB_TEMP = true; // TODO: set to false once MongoDB connection is confirmed working

module.exports = { SKIP_DB_TEMP };

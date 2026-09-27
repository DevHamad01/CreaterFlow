// Shared rule for how a page reconciles a live response with its sample seed.
//
// The rule the seeded pages use: start from the seed so the view is populated
// immediately, and only replace it when the live response actually has rows.
// The naive versions both produce a blank screen:
//   setRows(rows || [])            -> an empty backend wipes the UI
//   setRows(rows); if (rows?.length) setRows(seed)  -> flashes empty, then seed
//
// A non-empty live response always wins, so seeding stays invisible once the
// backend has data and can be deleted file by file.

/**
 * @param {Array} seed
 * @returns {(rows: unknown) => Array}
 */
export function preferLive(seed) {
  return (rows) => (Array.isArray(rows) && rows.length > 0 ? rows : seed);
}

/**
 * True when a page has something to show, so a fetch failure should degrade to
 * an inline notice instead of replacing the content. Pages with no seed still
 * get the full-screen error.
 *
 * @param {Array[]} collections
 */
export function hasContent(...collections) {
  return collections.some((c) => Array.isArray(c) && c.length > 0);
}

/**
 * Creator pages scope every row by `creator_name === user.full_name`. A freshly
 * registered account has no rows under its own name, so seeding the raw
 * collection would still render an empty page. This keeps the sample work
 * attached to one sample creator when the signed-in account has no data of its
 * own, and drops back to nothing once real rows exist.
 *
 * @param {unknown} liveRows rows already filtered to the current user
 * @param {Array} seedRows
 * @param {string} creatorName
 * @param {string} demoCreatorName
 */
export function scopedToCreator(liveRows, seedRows, creatorName, demoCreatorName) {
  if (Array.isArray(liveRows) && liveRows.length > 0) return liveRows;
  if (!creatorName) return [];
  const own = seedRows.filter((row) => row.creator_name === creatorName);
  if (own.length > 0) return own;
  return seedRows.filter((row) => row.creator_name === demoCreatorName);
}

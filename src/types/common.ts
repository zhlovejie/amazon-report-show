/**
 * Legacy type entry point.
 *
 * Existing names remain available during migration, while canonical types may
 * be stricter than their former definitions. New code should import from the
 * relevant domain module under `@/types`.
 */
export * from "./index";

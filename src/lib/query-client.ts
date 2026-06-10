import { QueryClient } from "@tanstack/react-query"

/** Creates a new QueryClient with default options */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  })
}

let browserQueryClient: QueryClient | undefined

/**
 * Returns the singleton QueryClient for browser environments,
 * or a fresh instance for server-side rendering.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

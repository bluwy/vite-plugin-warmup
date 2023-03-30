import type { Plugin, ViteDevServer } from 'vite'

export interface Options {
  clientFiles?: string[]
  ssrFiles?: string[]
}

export declare function warmup(options: Options): Plugin

/**
 * @param file Absolute file path
 * @param ssr Whether to transform this file in SSR
 */
export declare function warmupFile(
  server: ViteDevServer,
  file: string,
  ssr: boolean
): Promise<void>

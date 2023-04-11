# vite-plugin-warmup

Warm up Vite's transform cache as soon as the server initializes.

**Requires Vite >=4.3. Does not work with `middlewareMode`.**

## Why

### On-demand nature

Vite at it's core is an on-demand file server. When a request comes in, it will transform the file and serve it. This means we only do the work that is requested, keeping the dev server fast.

However, sometimes we know in advance which files will be requested when we start our development cycle. Instead of Vite idling before we open up the page, we can start transforming the files beforehand so when it gets requested, it's cached and can be served immediately.

### Deep module graph

Take this module graph where the left file would import the right file:

```
foo.js -> bar.vue -> baz.js -> qux.json
```

The imported ids can only be known after the file is transformed, so if `bar.vue` takes some time to transform, `baz.js` has to wait for it's turn, and so on. This causes an internal waterfall the deeper the imports are.

By warming up `baz.js`, or any files that you know is hot path in your app, they'll be cached and can be served immediately.

## Usage

### Setup

Install `vite-plugin-warmup`:

```bash
npm install vite-plugin-warmup
```

Use the Vite plugin:

```js
// vite.config.js
import { defineConfig } from 'vite'
import { warmup } from 'vite-plugin-warmup'

export default defineConfig({
  plugins: [
    warmup({
      // warm up the files and its imported JS modules recursively
      clientFiles: ['./**/*.html', './src/components/*.jsx']
    })
  ]
})
```

The plugin accepts `clientFiles` and `ssrFiles` options. As the name suggests, the files specified would be warmed up for the client and server transforms respectively.

The files can be direct file names or glob patterns using [fast-glob](https://github.com/mrmlnc/fast-glob).

> **NOTE:** It's recommended to **not** turn off `server.preTransformRequests` in the Vite config, as that prevents transforming the module graph recursively.

### Which files should I warm up?

If you're using Vite SPA with a `index.html` file, add that to the `clientFiles` option and you're good to go!

```js
warmup({ clientFiles: ['./**/*.html'] })
```

You can also run `DEBUG="vite:transform" vite` to see the files that are being transformed. With `vite-plugin-warmup`, you should see these logs before you load the page.

Logs that appear after the page load are URLs that didn't get warmed up, if so, you can add more of them into the `clientFiles` option. Note that only actual files in the file system are supported.

```bash
vite:transform 28.72ms /@vite/client +1ms
vite:transform 62.95ms /src/components/BigComponent.jsx +1ms
```

```js
warmup({ clientFiles: ['./**/*.html', './src/components/BigComponent.jsx'] })
```

If you're using SSR, you can use the `ssrFiles` option instead. As the Vite logs doesn't differentiate between client and server transforms, make sure the files added are safe to be transformed in the client or server respectively.

> **NOTE:** Make sure to read the [Why](#why) section to understand which files to add to not overload the Vite server on startup.

### Metaframeworks

Some metaframeworks don't load the files through Vite directly, so this plugin might not work for them. To be sure which files are loaded by Vite, you can start the metaframework with the `DEBUG="vite:transform"` flag and follow the [steps above](#which-files-should-i-warm-up).

`vite-plugin-warmup` also exports a `warmupFile` function you can use to warm up specific files (absolute paths only). If you need more control, you can reuse the `warmupFile` implementation in [index.js](./index.js).

## Attribution

- [Nuxt's warmup phase](https://github.com/nuxt/nuxt/blob/826c05415400e899779f61e2e20e757786baa200/packages/vite/src/utils/warmup.ts).

## Sponsors

<p align="center">
  <a href="https://bjornlu.com/sponsors.svg">
    <img src="https://bjornlu.com/sponsors.svg" alt="Sponsors" />
  </a>
</p>

## License

MIT

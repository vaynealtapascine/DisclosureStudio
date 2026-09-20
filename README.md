![AI Disclosure: Repo code is fully AI-generated. Makes use of unbiased/pareto-26.9](assets/ai-transparency-disclosure.png)

# Disclosure Studio

Editor for AI transparency disclosure cards: pick a code rating and the models that wrote your code, then export a PNG for your README.

Local Svelte + plain-CSS app; everything runs in your browser.

## Run

Requires Node 22.12+ (tested with 22.23.2) and npm.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5178. Keep the terminal running while using the app. For a production build: `npm run build`, then `npm run preview` and open the address it prints. Serve `dist/` with an HTTP server rather than double-clicking its HTML file.

## Make a card

1. Pick a self-declared code rating: 0 no AI code, 1 primarily human-written with AI assistance, 2 primarily AI-generated with human code, 3 all AI-generated code. These are editorial categories, not measured percentages.
2. Search the multi-select catalog or filter by provider. Check every model that contributed. The bundled catalog contains 445 models from OpenRouter; Refresh catalog optionally fetches the latest list without credentials.
3. Arrange the selected rows from greatest to least code contribution. Drag rows on desktop or use the up/down buttons (also keyboard/touch accessible). Edit each displayed label and pill color directly.
4. Optionally override the headline. Choose a file name and 1×, 2× or 3× export size. Click Download PNG.

The base image is 1180 pixels wide; height grows with wrapping model pills. Rounded corners remain transparent. At rating 0, model credits are hidden without erasing the selection. Ratings above zero require a model and non-empty labels before export.

Custom models can be added as `provider/model-name`. Known providers use bundled logos; unknown providers get initials instead of a broken image. Up to 100 selected models are supported; exceptionally tall cards may exceed a browser's canvas limit, especially at 3×. Export errors leave the draft intact; retry at 1×.

## Keep your work

The last draft is saved in this browser's local storage. Save project downloads an editable JSON file; Open project restores it. Opening a valid project replaces the current draft, so save the current one first if you need it. Invalid files leave it unchanged. Local storage is per browser and per site address and may be cleared by browser cleanup; project files are the durable backup.

## Restyle it

- `src/disclosure.css`: exported card colors, spacing, typography, pills and dimensions. Start with the three `--disclosure-*` variables.
- `src/Disclosure.svelte`: card markup, warning symbol and assistance mark.
- `src/app.css`: the editor UI, separate from the card.
- `src/App.svelte`: editor controls and export.
- `src/domain.js`: rating wording, provider colors/logo mapping and project validation.
- `public/logos/`: bundled monochrome SVG marks.
- `public/fonts/`: bundled regular and italic variable Hanken Grotesk.

No Tailwind or UI component framework. The live preview and export render the same card component; PNG conversion uses html-to-image. Keep the card width at 1180 unless also updating the editor/export width constants. Headline overrides are shared across ratings until cleared.

## Privacy and sources

No account, backend, analytics or AI API calls. Drafts and PNG generation stay local. Only clicking Refresh catalog sends a request to OpenRouter; your disclosure content is not included. The development-only `python scripts/assets.py` fetches public font/logo/catalog assets. Export uses bundled assets and works without external network access after the app has loaded. Reloading still requires your local server; this is not an installable offline PWA.

- Model catalog: https://openrouter.ai/api/v1/models (a snapshot is bundled; live refresh is session-only).
- Logos: https://github.com/lobehub/lobe-icons (MIT notice in `public/logos/LICENSE.txt`). Brand marks do not imply endorsement. Twenty provider marks are bundled; other providers use initials.
- Hanken Grotesk: Google Fonts, SIL Open Font License (`public/fonts/OFL.txt`).

## Verification

```sh
npm run check
npm test
npm run build
npm exec -- playwright install chromium
# Keep npm run dev running in another terminal:
npm run test:e2e
```

Verified: Svelte diagnostics (zero warnings/errors), production build, four domain tests, and two Chromium browser journeys covering selection, drag and arrow ordering, reload persistence, all ratings, downloaded PNG dimensions/signature, 2× scaling, custom models, project roundtrip, malformed import, failed catalog refresh, offline export and a 390px viewport. Screenshots and exported samples are regenerated under `test-results/`. Successful live refresh in the browser, Safari/Firefox, screen-reader behavior, 3× and maximum-size exports were not separately tested.

## License

[MIT](LICENSE) © 2026 Vayne Altapascine

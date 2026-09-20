<script>
  import { onMount, tick } from 'svelte';
  import { toBlob } from 'html-to-image';
  import Disclosure from './Disclosure.svelte';
  import catalog from './catalog.json';
  import { ratings, model, move, normalizeModels, defaults, validateDraft, filenameFor, providerFor } from './domain.js';
  import './disclosure.css';

  let draft = structuredClone(defaults);
  let models = catalog;
  let query = '';
  let provider = '';
  let custom = '';
  let notice = '';
  let error = '';
  let exporting = false;
  let refreshing = false;
  let ready = false;
  let previewWidth = 800;
  let cardHeight = 268;
  let exportHost;
  let dragged = '';
  let importer;
  $: providers = [...new Set(models.map(m => m.id.split('/')[0]))].sort();
  $: matches = models.filter(m => (!provider || m.id.startsWith(`${provider}/`)) && `${m.id} ${m.name}`.toLowerCase().includes(query.toLowerCase()));
  $: shown = matches.slice(0, 100);
  $: previewScale = Math.min(1, (previewWidth || 800) / 1180);
  $: if (ready) {
    try { localStorage.setItem('disclosure-studio:v1', JSON.stringify(draft)); }
    catch { error = 'Browser storage is unavailable or full. Save a project file to keep your work.'; }
  }
  onMount(() => {
    try { const saved = localStorage.getItem('disclosure-studio:v1'); if (saved) draft = validateDraft(JSON.parse(saved)); }
    catch { error = 'Could not restore the saved draft. You can start here or open a project file.'; }
    ready = true;
    const observer = new ResizeObserver(() => { cardHeight = exportHost.firstElementChild.offsetHeight; });
    observer.observe(exportHost.firstElementChild);
    return () => observer.disconnect();
  });
  function toggle(id) {
    if (draft.selected.some(m => m.id === id)) draft = { ...draft, selected: draft.selected.filter(m => m.id !== id) };
    else if (draft.selected.length >= 100) error = 'A disclosure can contain up to 100 models.';
    else draft = { ...draft, selected: [...draft.selected, model(id)] };
  }
  function reorder(from, to) { draft = { ...draft, selected: move(draft.selected, from, to) }; }
  function drop(event, index) {
    event.preventDefault();
    const from = draft.selected.findIndex(m => m.id === dragged);
    reorder(from, index); dragged = '';
  }
  function addCustom() {
    const id = custom.trim();
    if (!id) return;
    if (draft.selected.some(m => m.id === id)) { error = 'That model is already selected.'; return; }
    toggle(id); custom = ''; notice = 'Custom model added. You can edit its label and color below.';
  }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = filename;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  async function exportPng() {
    if (draft.rating > 0 && !draft.selected.length) { error = 'Select at least one model before exporting an AI-assisted disclosure.'; return; }
    exporting = true; error = ''; notice = '';
    try {
      await tick();
      await Promise.all([document.fonts.load('800 60px "Hanken Grotesk"'), document.fonts.load('700 32px "Hanken Grotesk"'), document.fonts.load('italic 600 25px "Hanken Grotesk"')]);
      await document.fonts.ready;
      const node = exportHost.firstElementChild;
      await Promise.all([...node.querySelectorAll('img')].map(img => img.decode()));
      const blob = await toBlob(node, { pixelRatio: draft.scale, width: 1180, height: node.offsetHeight, cacheBust: false });
      if (!blob) throw new Error('The browser could not create a PNG.');
      download(blob, filenameFor(draft.filename, 'png'));
      notice = `PNG ready — ${1180 * draft.scale} × ${node.offsetHeight * draft.scale} pixels.`;
    } catch (e) { error = `Export failed: ${e.message} Try again at 1× size.`; }
    finally { exporting = false; }
  }
  function saveProject() { download(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }), filenameFor(draft.filename, 'json')); notice = 'Editable project downloaded.'; }
  async function importProject(event) {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      if (file.size > 200000) throw new Error('Project files must be smaller than 200 KB.');
      draft = validateDraft(JSON.parse(await file.text())); error = ''; notice = 'Project opened.';
    } catch (e) { error = `Could not open project: ${e.message} Your current draft is unchanged.`; }
    event.target.value = '';
  }
  async function refresh() {
    refreshing = true; error = '';
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`OpenRouter returned ${response.status}.`);
      models = normalizeModels((await response.json()).data);
      notice = `Loaded ${models.length} models from OpenRouter. Your selection is unchanged.`;
    } catch (e) { error = `Could not refresh: ${e.message} The bundled catalog and custom models still work.`; }
    finally { refreshing = false; }
  }
</script>

<svelte:head><title>Disclosure Studio · AI transparency cards</title></svelte:head>
<div class="studio">
  <header class="app-header">
    <div class="brand"><span class="brand-icon" aria-hidden="true">✳</span><div><h1>Disclosure Studio</h1><p>A little clarity about how your code was made.</p></div></div>
    <div class="file-actions"><button onclick={() => importer.click()}>Open project</button><button onclick={saveProject}>Save project</button></div>
    <input class="visually-hidden" type="file" accept=".json,application/json" aria-label="Open project file" bind:this={importer} onchange={importProject} />
  </header>
  <main>
    <section class="editor" aria-label="Disclosure settings">
      <fieldset class="rating-field"><legend><span class="step">01</span> How much AI code?</legend>
        <p class="hint">A self-declared rating of the code, not the design or direction.</p>
        <div class="rating-options">{#each ratings as option, index}<label class:active={draft.rating === index}><input type="radio" name="rating" value={index} bind:group={draft.rating} /><strong>{index}</strong><span>{option.name}</span></label>{/each}</div>
        <p class="rating-detail">{ratings[draft.rating].detail}</p>
      </fieldset>
      <section class="model-editor" aria-label="Model selection">
        <h2><span class="step">02</span> Which models contributed?</h2>
        <p class="hint">Select models, then arrange them from most code to least.</p>
        {#if draft.rating === 0}<p class="inline-note">Model credits are hidden at rating 0. Your selection is kept for later.</p>{/if}
        <div class="search-row"><label class="search-label">Search models<input type="search" placeholder="Search name or provider…" bind:value={query} /></label><label>Provider<select bind:value={provider}><option value="">All providers</option>{#each providers as p}<option value={p}>{p}</option>{/each}</select></label></div>
        <div class="catalog" role="group" aria-label="Available models">
          {#each shown as item (item.id)}
            {@const info = providerFor(item.id)}
            <label class="catalog-item"><input type="checkbox" checked={draft.selected.some(m => m.id === item.id)} onchange={() => toggle(item.id)} />{#if info.icon}<img src={info.icon} alt="" />{:else}<span class="catalog-initial">{info.initials}</span>{/if}<span><strong>{item.id}</strong><small>{item.name}</small></span></label>
          {:else}<p class="empty">No matching models. Try another search or add a custom model.</p>{/each}
        </div>
        <div class="catalog-footer"><small>{matches.length > 100 ? `First 100 of ${matches.length} matches · narrow your search` : `${matches.length} models`}</small><button class="text-button" onclick={refresh} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh catalog ↻'}</button></div>
        <form class="custom-row" onsubmit={e => { e.preventDefault(); addCustom(); }}><label>Not listed? Add a custom model<input bind:value={custom} maxlength="200" placeholder="provider/model-name" /></label><button disabled={!custom.trim()}>Add</button></form>
        <h3>Contribution order <span class="count">{draft.selected.length}</span></h3>
        <p class="hint">Drag a row, or use its arrows. Labels and pill colors are editable.</p>
        <ol class="selected-models">
          {#each draft.selected as item, index (item.id)}
            <li draggable="true" ondragstart={e => { dragged = item.id; e.dataTransfer.setData('text/plain', item.id); e.dataTransfer.effectAllowed = 'move'; }} ondragend={() => dragged = ''} ondragover={e => e.preventDefault()} ondrop={e => drop(e, index)} class:dragging={dragged === item.id}>
              <span class="order-number" aria-hidden="true">{index + 1}</span>
              <input class="color-input" type="color" bind:value={item.color} aria-label={`Pill color for ${item.id}`} />
              <input class="model-label-input" bind:value={item.label} maxlength="200" aria-label={`Display label for ${item.id}`} />
              <div class="row-actions"><button aria-label={`Move ${item.id} up`} disabled={index === 0} onclick={() => reorder(index, index - 1)}>↑</button><button aria-label={`Move ${item.id} down`} disabled={index === draft.selected.length - 1} onclick={() => reorder(index, index + 1)}>↓</button><button aria-label={`Remove ${item.id}`} onclick={() => toggle(item.id)}>×</button></div>
            </li>
          {:else}<li class="empty">No models selected yet. Choose from the list above.</li>{/each}
        </ol>
      </section>
    </section>
    <section class="preview-panel" aria-label="Preview and export">
      <div class="preview-heading"><h2>Live preview</h2><span class="badge">PNG · transparent corners</span></div>
      <div class="preview-stage" bind:clientWidth={previewWidth}>
        <div class="preview-space" style:height={`${cardHeight * previewScale}px`}>
          <div class="preview-scaled" style:transform={`scale(${previewScale})`}><Disclosure rating={draft.rating} selected={draft.selected} headline={draft.headline} /></div>
        </div>
      </div>
      <p class="preview-note">1180 × {cardHeight} px at 1× · height follows your model list</p>
      <section class="export-controls"><h2><span class="step">03</span> Make it yours</h2>
        <label>Headline override <span class="optional">optional</span><input bind:value={draft.headline} maxlength="100" placeholder={ratings[draft.rating].headline} /></label>
        <div class="export-row"><label>File name<input bind:value={draft.filename} maxlength="100" placeholder="ai-transparency" /></label><label>Export size<select bind:value={draft.scale}><option value={1}>1× · 1180 px</option><option value={2}>2× · 2360 px</option><option value={3}>3× · 3540 px</option></select></label></div>
        <button class="primary export-button" onclick={exportPng} disabled={exporting || (draft.rating > 0 && !draft.selected.length) || draft.selected.some(m => !m.label.trim())}>{exporting ? 'Preparing PNG…' : 'Download PNG'} <span aria-hidden="true">↓</span></button>
        {#if draft.rating > 0 && !draft.selected.length}<p class="hint">Select a model to enable export.</p>{/if}
        {#if error}<p class="error" role="alert">{error} <button class="text-button" onclick={() => error = ''}>Dismiss</button></p>{/if}
        <p class="status" role="status">{notice}</p>
      </section>
      <details class="styling-note"><summary>Designed to be restyled</summary><p>Edit <code>src/disclosure.css</code> for the exported card, <code>src/app.css</code> for this editor, and <code>src/Disclosure.svelte</code> for the card structure. No utility classes or component library to work around.</p></details>
      <p class="privacy-note">Local draft, local export. Nothing you enter is uploaded. Only “Refresh catalog” contacts OpenRouter. Fonts and logos are bundled.</p>
    </section>
  </main>
  <footer>Made for honest project notes. <span>Hanken Grotesk · provider icons from LobeHub</span></footer>
</div>
<div class="export-host" aria-hidden="true" bind:this={exportHost}><Disclosure rating={draft.rating} selected={draft.selected} headline={draft.headline} /></div>

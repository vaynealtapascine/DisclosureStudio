<script>
  import { ratings, providerFor } from './domain.js';
  export let rating = 3;
  export let selected = [];
  export let headline = '';
</script>

<!-- This is the exported design. All its styling lives in disclosure.css. -->
<article class="disclosure" aria-label="AI transparency disclosure">
  <header class="disclosure-header">
    <svg class="warning-mark" viewBox="0 0 108 92" aria-hidden="true">
      <path d="M54 0 108 92H0Z M48 27h12l-2 35h-8z M47 68l7-2 7 2-2 7 2 7-7-2-7 2 2-7z" fill="white" fill-rule="evenodd" />
    </svg>
    <div class="disclosure-title">
      <p>please be informed that this repo's code is</p>
      <div class="headline-row">
        <svg class="assistance-mark" viewBox="0 0 55 48" aria-hidden="true">
          {#each Array.from({ length: rating }, (_, i) => i) as i}
            <path d="M23 1Q25 19 44 24Q25 29 23 47Q20 29 2 24Q20 19 23 1Z" transform={`translate(${i*9-7} 0)`} fill="white" opacity={0.4 + i * 0.22}/>
          {/each}
          {#if rating === 0}<path d="m9 25 11 11 25-25" fill="none" stroke="white" stroke-width="5" />{/if}
        </svg>
        <h1 class:long-headline={(headline || ratings[rating].headline).length > 24}>{headline.trim() || ratings[rating].headline}</h1>
      </div>
    </div>
    <p class="disclosure-label">AI TRANSPARENCY<br />DISCLOSURE</p>
  </header>
  {#if rating > 0}
    <section class="disclosure-models">
      <p class="models-caption">the following models were used in its creation</p>
      <div class="model-pills">
        {#each selected as item (item.id)}
          {@const provider = providerFor(item.id)}
          <span class="model-pill" style:background={item.color}>
            {#if provider.icon}<img src={provider.icon} alt="" />{:else}<span class="provider-initials">{provider.initials}</span>{/if}
            <span>{item.label}</span>
          </span>
        {/each}
      </div>
    </section>
  {/if}
</article>

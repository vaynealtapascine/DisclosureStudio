export const ratings = [
  { name: 'No AI code', headline: 'NO AI-GENERATED CODE', detail: 'No AI-generated code in this project.' },
  { name: 'AI-assisted', headline: 'AI-ASSISTED', detail: 'Primarily human-written code, with AI assistance.' },
  { name: 'Mostly AI code', headline: 'MOSTLY AI-GENERATED', detail: 'Primarily AI-generated code, with human-written contributions.' },
  { name: 'Only AI code', headline: 'FULLY AI-GENERATED', detail: 'All code was AI-generated; humans may still direct, design, and review.' },
];
export const providers = {
  openai: ['openai', '#40b49a'], anthropic: ['claude', '#dc7653'], google: ['gemini', '#537ccd'],
  deepseek: ['deepseek', '#426add'], 'x-ai': ['grok', '#323238'], 'meta-llama': ['meta', '#237abd'],
  qwen: ['qwen', '#7661c4'], mistralai: ['mistral', '#da7627'], moonshotai: ['moonshot', '#343b4c'],
  'z-ai': ['zai', '#4153a4'], nousresearch: ['nousresearch', '#69724d'], cohere: ['cohere', '#497c68'],
  nvidia: ['nvidia', '#59812d'], perplexity: ['perplexity', '#287f88'], microsoft: ['microsoft', '#576899'],
  minimax: ['minimax', '#c75a73'], bytedance: ['bytedance', '#368ba7'], ai21: ['ai21', '#856697'],
  baidu: ['baidu', '#4459b0'], stepfun: ['stepfun', '#6279cf'],
};
export function providerFor(id) {
  const key = id.replace(/^~/, '').split('/')[0].toLowerCase();
  const info = providers[key];
  return { key, icon: info ? `./logos/${info[0]}.svg` : '', color: info?.[1] ?? '#696079', initials: key.slice(0, 2).toUpperCase() };
}
export function model(id) { return { id, label: id, color: providerFor(id).color }; }
export function move(items, from, to) {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) return items;
  const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next;
}
export function normalizeModels(data) {
  if (!Array.isArray(data)) throw new Error('The catalog response was not a model list.');
  const valid = data.filter(m => typeof m?.id === 'string' && m.id.trim() && m.id.length <= 200);
  if (!valid.length) throw new Error('The catalog was empty. Your bundled list is still available.');
  return [...new Map(valid.map(m => [m.id, { id: m.id, name: typeof m.name === 'string' ? m.name : m.id }])).values()].sort((a,b) => a.id.localeCompare(b.id));
}
export const defaults = { version: 1, rating: 3, selected: [], headline: '', filename: 'ai-transparency', scale: 1 };
export function validateDraft(value) {
  if (!value || value.version !== 1 || !Number.isInteger(value.rating) || !ratings[value.rating] || !Array.isArray(value.selected) || value.selected.length > 100) throw new Error('Not a supported Disclosure Studio project.');
  const selected = value.selected.map(m => {
    if (typeof m?.id !== 'string' || !m.id.trim() || m.id.length > 200 || typeof m.label !== 'string' || !m.label.trim() || m.label.length > 200 || !/^#[0-9a-f]{6}$/i.test(m.color)) throw new Error('A model has an invalid name or color.');
    return { id: m.id, label: m.label, color: m.color };
  });
  if (new Set(selected.map(m => m.id)).size !== selected.length) throw new Error('Duplicate models in the project.');
  return { version: 1, rating: value.rating, selected, headline: typeof value.headline === 'string' ? value.headline.slice(0,100) : '', filename: typeof value.filename === 'string' ? value.filename.slice(0,100) : defaults.filename, scale: [1,2,3].includes(value.scale) ? value.scale : 1 };
}
export function filenameFor(name, extension) { return `${(name.trim().replace(/\.(png|json)$/i, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'ai-transparency').slice(0,100)}.${extension}`; }

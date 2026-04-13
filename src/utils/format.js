export function formatBytes(bytes) {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let i = -1;
  let n = bytes;
  do {
    n /= 1024;
    i++;
  } while (n >= 1024 && i < units.length - 1);
  const decimals = n >= 100 || i === 0 ? 0 : n >= 10 ? 1 : 2;
  return `${n.toFixed(decimals)} ${units[i]}`;
}

export function shortenPath(p) {
  if (!p) return '';
  return p.replace(/^\/Users\/[^/]+/, '~');
}

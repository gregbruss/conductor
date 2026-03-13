export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlight(line: string): string {
  const e = esc(line);
  if (/^\s*\/\//.test(line)) return `<span style="color:#6666aa">${e}</span>`;
  let r = e;
  r = r.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#88ff88">$1</span>');
  r = r.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#ffff88">$1</span>');
  r = r.replace(/^(\$:)/, '<span style="color:#ffffff;font-weight:bold">$1</span>');
  r = r.replace(/(\/\/[^<]*)$/, '<span style="color:#6666aa">$1</span>');
  return r;
}

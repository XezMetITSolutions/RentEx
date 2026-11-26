import fs from 'fs/promises';
import path from 'path';

export async function getCarTemplateMapping(templateName: string): Promise<Record<string, string>> {
  if (!templateName) return {};
  try {
    const folderPath = path.join(process.cwd(), 'Check-in', templateName);
    const entries = await fs.readdir(folderPath, { withFileTypes: true });

    const mapping: Record<string, string> = {};
    const sides = ['front', 'back', 'left', 'right', 'top'];
    const keywords: Record<string, string[]> = {
      front: ['front', 'vorn'],
      back: ['back', 'rear', 'heck'],
      left: ['left', 'links'],
      right: ['right', 'rechts'],
      top: ['oben', 'top', 'dach'],
    };

    for (const side of sides) {
      const match = entries.find((e) => {
        const lower = e.name.toLowerCase();
        return keywords[side].some((kw) => lower.includes(kw));
      });
      if (match) {
        if (match.isDirectory()) {
          const subFiles = await fs.readdir(path.join(folderPath, match.name));
          const img = subFiles.find((f) => /\.(jpe?g|png|webp)$/i.test(f));
          if (img) {
            mapping[side] = `/api/check-in-images/${encodeURIComponent(templateName)}/${encodeURIComponent(match.name)}/${encodeURIComponent(img)}`;
          }
        } else if (/\.(jpe?g|png|webp)$/i.test(match.name)) {
          mapping[side] = `/api/check-in-images/${encodeURIComponent(templateName)}/${encodeURIComponent(match.name)}`;
        }
      }
    }
    return mapping;
  } catch {
    return {};
  }
}

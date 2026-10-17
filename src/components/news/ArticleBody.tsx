import React from 'react';

/**
 * Rendu du corps d'un article (`News.body` / `Blog.body`).
 *
 * Partagé entre l'aperçu de l'admin et les pages publiques : c'est ce partage qui
 * garantit que l'aperçu ne ment pas sur le rendu final. Toute évolution des
 * marqueurs se fait ici, une seule fois.
 *
 * Le texte est brut ; quatre marqueurs volontairement minimalistes suffisent aux
 * rédacteurs, sans imposer une syntaxe Markdown complète :
 *   - ligne vide      → nouveau paragraphe
 *   - `## `           → sous-titre
 *   - `- ` / `* `     → liste à puces
 *   - `1. ` / `1) `   → liste numérotée
 *
 * Le balayage est fait **ligne à ligne** et non bloc par bloc : les contenus réels
 * enchaînent un sous-titre et son paragraphe sans ligne vide entre les deux, et un
 * découpage par blocs perdrait le paragraphe.
 */

type Node =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; lines: string[] }
  | { kind: 'list'; ordered: boolean; items: string[] };

const BULLET = /^[-*]\s+/;
const ORDERED = /^\d+[.)]\s+/;

export function parseArticleBody(body: string): Node[] {
  const nodes: Node[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) nodes.push({ kind: 'paragraph', lines: paragraph });
    paragraph = [];
  };

  /** Empile dans la liste courante si elle est du même type, sinon en ouvre une. */
  const pushItem = (ordered: boolean, text: string) => {
    flush();
    const last = nodes[nodes.length - 1];
    if (last && last.kind === 'list' && last.ordered === ordered) last.items.push(text);
    else nodes.push({ kind: 'list', ordered, items: [text] });
  };

  for (const raw of body.split('\n')) {
    const line = raw.trim();

    if (!line) { flush(); continue; }
    if (line.startsWith('#')) { flush(); nodes.push({ kind: 'heading', text: line.replace(/^#+\s*/, '') }); continue; }
    if (BULLET.test(line)) { pushItem(false, line.replace(BULLET, '')); continue; }
    if (ORDERED.test(line)) { pushItem(true, line.replace(ORDERED, '')); continue; }

    paragraph.push(line);
  }
  flush();

  return nodes;
}

const ArticleBody: React.FC<{ body: string; className?: string }> = ({ body, className = '' }) => (
  <div className={className}>
    {parseArticleBody(body).map((node, i) => {
      if (node.kind === 'heading') {
        return (
          <h2 key={i} className="font-display text-xl font-semibold text-gray-900 mt-8 mb-3 first:mt-0">
            {node.text}
          </h2>
        );
      }

      if (node.kind === 'list') {
        const cls = 'my-4 space-y-2 pl-5 marker:text-primary';
        const items = node.items.map((it, j) => (
          <li key={j} className="text-gray-700 leading-relaxed pl-1">{it}</li>
        ));
        return node.ordered
          ? <ol key={i} className={`${cls} list-decimal`}>{items}</ol>
          : <ul key={i} className={`${cls} list-disc`}>{items}</ul>;
      }

      return <p key={i} className="text-gray-700 leading-[1.75] mb-4">{node.lines.join(' ')}</p>;
    })}
  </div>
);

export default ArticleBody;

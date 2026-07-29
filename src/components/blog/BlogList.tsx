import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBlogs, BlogPost } from '../../hooks/useBlogs';

/** Palette des catégories de blog — chaudes et distinctes, alignées sur la marque. */
const categoryColors: Record<string, string> = {
  'Études': 'bg-primary text-white',
  'Tourisme': 'bg-teal-600 text-white',
  'Visa': 'bg-blue-600 text-white',
  'Culture': 'bg-purple-600 text-white',
  'Conseils': 'bg-secondary text-white',
  'Témoignage': 'bg-amber-600 text-white',
};
const categoryColor = (c: string) => categoryColors[c] ?? 'bg-gray-600 text-white';

const LABELS = {
  en: { title: 'The Midzo Blog', subtitle: 'Advice, guides and stories to help you build your project abroad.', all: 'All', empty: 'No article published yet.', error: 'Articles could not be loaded.', by: 'By' },
  fr: { title: 'Le Blog Midzo', subtitle: 'Conseils, guides et témoignages pour bâtir votre projet à l’étranger.', all: 'Tous', empty: 'Aucun article publié pour le moment.', error: 'Impossible de charger les articles.', by: 'Par' },
  de: { title: 'Der Midzo-Blog', subtitle: 'Ratgeber, Leitfäden und Erfahrungsberichte für Ihr Projekt im Ausland.', all: 'Alle', empty: 'Noch kein Artikel veröffentlicht.', error: 'Artikel konnten nicht geladen werden.', by: 'Von' },
};

const formatDate = (iso: string, locale: string) =>
  iso ? new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' }) : '';

/** Page publique `/blog` (story 1.8) : les 8 articles n'étaient atteignables nulle part. */
const BlogList = () => {
  const { i18n } = useTranslation('common');
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';
  const l = LABELS[lang];
  const locale = lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : 'en-GB';

  const { posts, loading, error } = useBlogs();
  const [category, setCategory] = useState('');

  const categories = useMemo(
    () => Array.from(new Set(posts.map(p => p.category).filter(Boolean))).sort(),
    [posts],
  );
  const visible = category ? posts.filter(p => p.category === category) : posts;

  const [featured, ...rest] = visible;

  const Card = ({ post, large = false }: { post: BlogPost; large?: boolean }) => (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {post.image && (
        <div className={`relative overflow-hidden ${large ? 'h-64 md:h-80' : 'h-44'}`}>
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {post.category && (
            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${categoryColor(post.category)}`}>
              {post.category}
            </span>
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col p-5">
        <h2 className={`font-bold text-gray-900 group-hover:text-primary transition-colors duration-200 ${large ? 'text-2xl' : 'text-base line-clamp-2'}`}>
          {post.title}
        </h2>
        <p className={`mt-2 text-gray-500 ${large ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'}`}>
          {post.excerpt}
        </p>
        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
          {post.author && <span>{l.by} {post.author}</span>}
          {post.author && post.date && <span aria-hidden="true"> · </span>}
          {post.date && <span>{formatDate(post.date, locale)}</span>}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="bg-cream min-h-screen py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary">{l.title}</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">{l.subtitle}</p>
        </header>

        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[{ key: '', label: l.all }, ...categories.map(c => ({ key: c, label: c }))].map(c => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                aria-pressed={category === c.key}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                  category === c.key ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse rounded-2xl bg-white overflow-hidden shadow-md">
                <div className="h-44 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-gray-100" />
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-2/3 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && <p className="text-center text-gray-500 py-16">{l.error}</p>}
        {!loading && !error && visible.length === 0 && <p className="text-center text-gray-500 py-16">{l.empty}</p>}

        {!loading && !error && featured && (
          <>
            <div className="mb-8">
              <Card post={featured} large />
            </div>
            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map(post => <Card key={post.id} post={post} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogList;

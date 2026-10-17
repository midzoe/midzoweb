import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { buildBlogs, BlogPost } from '../../hooks/useBlogs';
import ArticleBody from '../news/ArticleBody';

const categoryColors: Record<string, string> = {
  'Études': 'bg-primary text-white',
  'Tourisme': 'bg-teal-600 text-white',
  'Visa': 'bg-blue-600 text-white',
  'Culture': 'bg-purple-600 text-white',
  'Conseils': 'bg-secondary text-white',
  'Témoignage': 'bg-amber-600 text-white',
};

const LABELS = {
  en: { back: 'All articles', notFound: 'Article not found', hint: 'It may have been removed or is not published yet.', by: 'By', read: 'min read' },
  fr: { back: 'Tous les articles', notFound: 'Article introuvable', hint: 'Il a peut-être été retiré, ou n’est pas encore publié.', by: 'Par', read: 'min de lecture' },
  de: { back: 'Alle Artikel', notFound: 'Artikel nicht gefunden', hint: 'Er wurde möglicherweise entfernt oder ist noch nicht veröffentlicht.', by: 'Von', read: 'Min. Lesezeit' },
};

/**
 * Page de lecture d'un article de blog (story 1.8).
 * Le backend répond 404 sur un brouillon : une erreur de chargement suffit ici.
 */
const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation('common');
  const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';
  const l = LABELS[lang];
  const locale = lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : 'en-GB';

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    let mounted = true;

    setLoading(true);
    setNotFound(false);
    apiService
      .getBlogBySlug(slug)
      .then((res: any) => {
        if (!mounted) return;
        const raw = res?.data ?? null;
        if (!raw) { setNotFound(true); return; }
        setPost(buildBlogs([raw])[0]);
      })
      .catch(() => { if (mounted) setNotFound(true); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [slug]);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);
  useEffect(() => { if (post?.title) document.title = `${post.title} — Midzo`; }, [post?.title]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-5">
          <div className="h-72 rounded-2xl bg-gray-100" />
          <div className="h-8 w-3/4 rounded bg-gray-100" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-5/6 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-800">{l.notFound}</h1>
        <p className="mt-2 text-gray-500">{l.hint}</p>
        <Link to="/blog" className="mt-6 inline-block text-primary font-semibold hover:underline">
          {l.back} →
        </Link>
      </div>
    );
  }

  const words = post.body.trim() ? post.body.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  const displayDate = post.date
    ? new Date(post.date).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors duration-200 mb-6">
        <ArrowLeftIcon className="h-4 w-4" /> {l.back}
      </Link>

      {post.image && (
        <div className="relative rounded-2xl overflow-hidden shadow-lg h-64 md:h-80 mb-8">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {post.category && (
            <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${categoryColors[post.category] ?? 'bg-gray-600 text-white'}`}>
              {post.category}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400 mb-3">
        {post.author && <span>{l.by} {post.author}</span>}
        {displayDate && <><span aria-hidden="true">·</span><span>{displayDate}</span></>}
        {words > 0 && <><span aria-hidden="true">·</span><span>{minutes} {l.read}</span></>}
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-5">{post.title}</h1>

      {post.excerpt && (
        <p className="text-lg leading-relaxed text-gray-600 mb-8 pb-8 border-b border-gray-100">{post.excerpt}</p>
      )}

      {post.body.trim() && <ArticleBody body={post.body} />}
    </article>
  );
};

export default BlogArticle;

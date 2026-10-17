import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { buildNews, NewsItem } from '../../hooks/useNews';
import ArticleBody from './ArticleBody';

/** Pastilles alignées sur `NewsSlider` : une même catégorie garde sa couleur partout. */
const categoryColors: Record<string, string> = {
  Events: 'bg-secondary text-white',
  Safari: 'bg-emerald-600 text-white',
  Sports: 'bg-blue-600 text-white',
  Study: 'bg-primary text-white',
  Business: 'bg-purple-600 text-white',
  Professional: 'bg-gray-600 text-white',
  Tourism: 'bg-teal-600 text-white',
};

type Lang = 'en' | 'fr' | 'de';

const LABELS: Record<Lang, { back: string; notFound: string; notFoundHint: string; home: string; read: string }> = {
  en: { back: 'All news', notFound: 'Article not found', notFoundHint: 'It may have been removed or is not published yet.', home: 'Back to home', read: 'min read' },
  fr: { back: 'Toutes les actualités', notFound: 'Article introuvable', notFoundHint: 'Il a peut-être été retiré, ou n’est pas encore publié.', home: 'Retour à l’accueil', read: 'min de lecture' },
  de: { back: 'Alle Nachrichten', notFound: 'Artikel nicht gefunden', notFoundHint: 'Er wurde möglicherweise entfernt oder ist noch nicht veröffentlicht.', home: 'Zurück zur Startseite', read: 'Min. Lesezeit' },
};

/**
 * Page de lecture d'une actualité (story 1.7).
 *
 * Le backend répond 404 sur un brouillon : aucun filtrage à refaire ici, une
 * erreur de chargement suffit à afficher l'état « introuvable ».
 */
const NewsArticle = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation('common');
  const lang: Lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';
  const l = LABELS[lang];

  const [item, setItem] = useState<NewsItem | null>(null);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    const newsId = Number(id);
    if (!Number.isFinite(newsId)) { setNotFound(true); setLoading(false); return; }

    setLoading(true);
    setNotFound(false);
    apiService
      .getNewsById(newsId)
      .then((res: any) => {
        if (!mounted) return;
        const raw = res?.data ?? res?.article ?? null;
        if (!raw) { setNotFound(true); return; }
        // `buildNews` porte déjà le repli de langue (dont l'allemand via translations.de).
        setItem(buildNews([raw])[0]);
        setBody(raw.body ?? '');
      })
      .catch(() => { if (mounted) setNotFound(true); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [id]);

  // Un changement d'article doit repartir du haut de page.
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const title = item ? (lang === 'fr' ? item.titleFr : lang === 'de' ? item.titleDe : item.title) : '';
  const description = item ? (lang === 'fr' ? item.descriptionFr : lang === 'de' ? item.descriptionDe : item.description) : '';

  useEffect(() => {
    if (title) document.title = `${title} — Midzo`;
  }, [title]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-5">
          <div className="h-64 rounded-2xl bg-gray-100" />
          <div className="h-8 w-3/4 rounded bg-gray-100" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-5/6 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-800">{l.notFound}</h1>
        <p className="mt-2 text-gray-500">{l.notFoundHint}</p>
        <Link to="/" className="mt-6 inline-block text-primary font-semibold hover:underline">
          {l.home} →
        </Link>
      </div>
    );
  }

  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  const displayDate = item.date
    ? new Date(item.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : 'en-GB',
        { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors duration-200 mb-6">
        <ArrowLeftIcon className="h-4 w-4" /> {l.back}
      </Link>

      {item.image && (
        <div className="relative rounded-2xl overflow-hidden shadow-lg h-64 md:h-80 mb-8">
          <img src={item.image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {item.category && (
            <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${categoryColors[item.category] ?? 'bg-gray-600 text-white'}`}>
              {item.category}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400 mb-3">
        {displayDate && <span>{displayDate}</span>}
        {words > 0 && <><span aria-hidden="true">·</span><span>{minutes} {l.read}</span></>}
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-5">{title}</h1>

      {description && (
        <p className="text-lg leading-relaxed text-gray-600 mb-8 pb-8 border-b border-gray-100">{description}</p>
      )}

      {/* AC4 : sans corps de texte, on s'arrête proprement sur le chapeau — pas de bloc vide. */}
      {body.trim() && <ArticleBody body={body} />}
    </article>
  );
};

export default NewsArticle;

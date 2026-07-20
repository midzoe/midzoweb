import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { BellAlertIcon, CheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown> | null;
  createdAt: string;
}

// Story 4.6 : panneau des notifications (dont alertes visa) affiché sur le Dashboard.
const NotificationsPanel: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiService
      .getNotifications()
      .then(res => {
        if (!cancelled) setItems((res?.notifications ?? []) as NotificationItem[]);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markRead = async (id: number) => {
    try {
      await apiService.markNotificationRead(id);
      setItems(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // Dégradation silencieuse : on ne bloque pas l'UI si l'appel échoue.
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BellAlertIcon className="w-4 h-4 text-gray-300" />
        Notifications
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          Chargement...
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-sm py-2">Aucune notification pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {items.map(n => (
            <div
              key={n.id}
              className={`rounded-xl border p-3 ${
                n.isRead ? 'border-gray-100 bg-white' : 'border-amber-200 bg-amber-50'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n.type === 'visa_alert' ? (
                    <DocumentTextIcon className="w-4 h-4 text-primary" />
                  ) : (
                    <BellAlertIcon className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" title="Non lue" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-gray-400">
                      {n.createdAt ? format(new Date(n.createdAt), 'dd MMM yyyy') : ''}
                    </span>
                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80"
                      >
                        <CheckIcon className="w-3 h-3" />
                        Marquer comme lue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;

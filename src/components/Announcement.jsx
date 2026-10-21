import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { X } from '@phosphor-icons/react';
import { db } from '../firebase';

const DISMISS_KEY = 'jlc_dismissed_announcement';

function readDismissed() {
  try { return sessionStorage.getItem(DISMISS_KEY); } catch { return null; }
}

// Shows the newest announcement whose window covers right now.
export default function Announcement() {
  const [item, setItem] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getDocs(query(collection(db, 'announcements'), where('endsAt', '>', Timestamp.now()), orderBy('endsAt'), limit(10)))
      .then(snap => {
        const now = Date.now();
        const live = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(a => a.startsAt.toMillis() <= now && a.id !== readDismissed())
          .sort((a, b) => b.startsAt.toMillis() - a.startsAt.toMillis());
        if (!cancelled) setItem(live[0] || null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!item) return null;

  function dismiss() {
    try { sessionStorage.setItem(DISMISS_KEY, item.id); } catch { /* storage blocked */ }
    setItem(null);
  }

  const link = item.link;
  return (
    <div className="announce" role="region" aria-label="Announcement">
      <p className="announce-text">
        {item.message}
        {link && (link.startsWith('/')
          ? <Link to={link} className="announce-link">See more</Link>
          : <a href={link} className="announce-link" target="_blank" rel="noopener noreferrer">See more</a>)}
      </p>
      <button className="announce-close" onClick={dismiss} aria-label="Dismiss announcement">
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

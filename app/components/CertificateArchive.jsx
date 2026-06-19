'use client';

import { useEffect, useMemo, useState } from 'react';
import certificates from '../data/certificates.json';

const palette = {
  'Generative AI': '#765898',
  'Machine Learning': '#52d053',
  'Data & Analytics': '#6c88c7',
  'Systems & DevOps': '#e6770b',
  Security: '#d3290f',
  Programming: '#52d053',
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function unique(items) {
  return [...new Set(items)];
}

function isProgram(item) {
  return item.duration === 'Not exposed by Coursera page';
}

function hours(item) {
  return item.hours ? `${item.hours} h` : 'Not listed';
}

function date(item) {
  return item.completed || 'Not listed';
}

function initials(name) {
  return String(name || 'C')
    .split(/\s|\+|\./)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function providerMark(name) {
  if (name.includes('DeepLearning')) return 'DL';
  if (name.includes('Stanford')) return 'ST';
  if (name.includes('Microsoft')) return 'MS';
  if (name.includes('LearnQuest')) return 'LQ';
  if (name.includes('Google')) return 'G';
  if (name.includes('Packt')) return 'PK';
  if (name.includes('IBM')) return 'IBM';
  return initials(name);
}

function providerAccent(name) {
  if (name.includes('DeepLearning')) return '#52d053';
  if (name.includes('Stanford')) return '#d3290f';
  if (name.includes('Microsoft')) return '#765898';
  if (name.includes('LearnQuest')) return '#e6770b';
  if (name.includes('Google')) return '#6c88c7';
  if (name.includes('Packt')) return '#d3290f';
  if (name.includes('IBM')) return '#6c88c7';
  return '#52d053';
}

function percent(value, max, floor = 8) {
  if (!max) return floor;
  return Math.max(floor, Math.round((value / max) * 100));
}

function buildFieldGroups(fields) {
  return fields
    .map((field) => {
      const items = certificates.filter((item) => item.field === field);
      return {
        field,
        count: items.length,
        hours: items.reduce((sum, item) => sum + (item.hours || 0), 0),
        accent: palette[field] || '#52d053',
      };
    })
    .sort((a, b) => b.count - a.count);
}

function buildProviderGroups() {
  const map = new Map();
  certificates.forEach((item) => {
    const current = map.get(item.issuer) || {
      issuer: item.issuer,
      count: 0,
      hours: 0,
      accent: providerAccent(item.issuer),
    };
    current.count += 1;
    current.hours += item.hours || 0;
    map.set(item.issuer, current);
  });
  return [...map.values()].sort((a, b) => b.count - a.count || b.hours - a.hours);
}

function buildMonthGroups() {
  const map = new Map();
  certificates.forEach((item) => {
    if (!item.completed) return;
    const parsed = new Date(item.completed);
    if (Number.isNaN(parsed.getTime())) return;
    const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    const current = map.get(key) || {
      key,
      label: `${months[parsed.getMonth()]} '${String(parsed.getFullYear()).slice(2)}`,
      count: 0,
      hours: 0,
    };
    current.count += 1;
    current.hours += item.hours || 0;
    map.set(key, current);
  });
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function CertificateCard({ item, onPreview }) {
  const accent = palette[item.field] || item.accent || '#52d053';

  return (
    <article className={`cert ${isProgram(item) ? 'program' : ''}`} style={{ '--accent': accent }}>
      <div className="cert-media">
        <img src={item.image} alt={`${item.title} preview`} loading="lazy" />
        <div className="program-fallback">{item.title}</div>
        <span className="field-tag">{item.field}</span>
      </div>
      <div className="cert-body">
        <h3>{item.title}</h3>
        <div className="meta">
          <span>
            <b>{item.issuer}</b>
          </span>
          <span>
            {date(item)} / {hours(item)}
          </span>
          <span>ID: {item.id}</span>
        </div>
        <div className="skills">
          {(item.skills || []).slice(0, 4).map((skill) => (
            <span className="skill" key={`${item.id}-${skill}`}>
              {skill}
            </span>
          ))}
        </div>
        <div className="cert-actions">
          <button className="preview-btn" type="button" onClick={() => onPreview(item)}>
            Preview
          </button>
          <a className="open-link" href={item.credentialUrl} target="_blank" rel="noreferrer">
            Open
          </a>
        </div>
      </div>
    </article>
  );
}

function PreviewModal({ item, onClose }) {
  useEffect(() => {
    document.body.classList.toggle('no-scroll', Boolean(item));
    return () => document.body.classList.remove('no-scroll');
  }, [item]);

  useEffect(() => {
    if (!item) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  return (
    <div
      className={`modal ${item ? 'is-open' : ''}`}
      id="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={(event) => {
        if (event.target.id === 'modal') onClose();
      }}
    >
      {item ? (
        <article className="modal-panel">
          <div className="modal-top">
            <div>
              <p className="kicker" id="modalField">
                {item.field}
              </p>
              <h2 className="modal-title" id="modalTitle">
                {item.title}
              </h2>
            </div>
            <button className="close" type="button" aria-label="Close preview" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className={`modal-preview ${isProgram(item) ? 'program' : ''}`}>
              <img src={item.image || ''} alt={`${item.title} preview`} />
              <div className="modal-program">{item.title}</div>
            </div>
            <div>
              <div className="detail-grid">
                <div className="detail">
                  <span>Issuer</span>
                  <strong>{item.issuer}</strong>
                </div>
                <div className="detail">
                  <span>Date</span>
                  <strong>{date(item)}</strong>
                </div>
                <div className="detail">
                  <span>ID</span>
                  <strong>{item.id}</strong>
                </div>
                <div className="detail">
                  <span>Workload</span>
                  <strong>{item.duration || hours(item)}</strong>
                </div>
              </div>
              <div className="modal-skills">
                {(item.skills || []).map((skill) => (
                  <span className="skill" key={`${item.id}-modal-${skill}`}>
                    {skill}
                  </span>
                ))}
              </div>
              <div className="modal-actions">
                <a className="button primary" href={item.credentialUrl} target="_blank" rel="noreferrer">
                  View on Coursera
                </a>
                <a className="button" href={item.courseUrl || item.credentialUrl} target="_blank" rel="noreferrer">
                  Open course
                </a>
                <a className="button" href={item.shareUrl || item.credentialUrl} target="_blank" rel="noreferrer">
                  Share link
                </a>
              </div>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}

export default function CertificateArchive() {
  const [field, setField] = useState('All');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);

  const fields = useMemo(() => unique(certificates.map((item) => item.field)), []);
  const fieldGroups = useMemo(() => buildFieldGroups(fields), [fields]);
  const providerGroups = useMemo(() => buildProviderGroups(), []);
  const monthGroups = useMemo(() => buildMonthGroups(), []);
  const totalHours = useMemo(() => certificates.reduce((sum, item) => sum + (item.hours || 0), 0), []);
  const issuers = useMemo(() => unique(certificates.map((item) => item.issuer)).length, []);

  const visible = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return certificates.filter((item) => {
      const fieldOk = field === 'All' || item.field === field;
      const text = [item.title, item.issuer, item.field, item.id, ...(item.skills || [])].join(' ').toLowerCase();
      return fieldOk && text.includes(normalized);
    });
  }, [field, query]);

  const topSubjects = fieldGroups.slice(0, 5);
  const maxSubjectCount = Math.max(...topSubjects.map((item) => item.count));
  const maxFieldCount = Math.max(...fieldGroups.map((item) => item.count));
  const maxProviderCount = Math.max(...providerGroups.map((item) => item.count));
  const maxProviderHours = Math.max(...providerGroups.map((item) => item.hours));
  const maxMonthHours = Math.max(...monthGroups.map((item) => item.hours));
  const hourProviders = [...providerGroups].sort((a, b) => b.hours - a.hours);

  return (
    <>
      <div className="scanline" />
      <header className="topbar">
        <nav className="nav" aria-label="Primary navigation">
          <a className="brand" href="#top">
            <span className="brand-mark">VC</span>
            <span>Vidyut Chakrabarti</span>
          </a>
          <div className="nav-links">
            <a href="/data-view">Data View</a>
            <a href="#archive">Certificates</a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="wrap hero">
          <div className="poster">
            <div className="rail">
              <span>Certificate Archive</span>
              <span>{certificates.length} Records</span>
            </div>
            <div className="hero-main">
              <div>
                <p className="kicker last-updated">Last updated at: 19 Jun 2026, 12:51 IST</p>
                <h1>Certificate Archive</h1>
                <p className="hero-copy">
                  A curated record of learning across generative AI, machine learning, data engineering, systems, and
                  security.
                </p>
                <div className="hero-actions">
                  <a className="button primary" href="#archive">
                    Browse certificates
                  </a>
                  <a className="button green" href="/data-view">
                    Data View
                  </a>
                </div>
              </div>
              <div className="microblock">
                {[
                  ['Certificates', certificates.length],
                  ['Known Hours', totalHours],
                  ['Issuers', issuers],
                  ['Fields', fields.length],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <aside className="hero-side" id="overview">
              <h2 className="side-title">Field Index</h2>
              <div className="side-list">
                {fieldGroups.map((item) => (
                  <div className="side-row" key={item.field}>
                    <span>{item.field}</span>
                    <b>{item.count}</b>
                  </div>
                ))}
              </div>
              <div className="top-subjects">
                <p className="top-subjects-label">Top 5 explored subjects</p>
                {topSubjects.map((item) => (
                  <div
                    className="subject-row"
                    key={item.field}
                    style={{ '--accent': item.accent, '--w': `${percent(item.count, maxSubjectCount)}%` }}
                  >
                    <span>{item.field}</span>
                    <b>{item.count}</b>
                    <div className="subject-bar">
                      <i />
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="wrap section" id="archive">
          <div className="section-head">
            <div>
              <p className="kicker">Certificates</p>
              <h2>Archive Records</h2>
            </div>
            <p className="section-note">Filter by field or search title, issuer, skill, and credential ID.</p>
          </div>
          <div className="control-panel">
            <input
              className="search"
              type="search"
              placeholder="Search archive"
              aria-label="Search certificates"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="filters">
              {['All', ...fields].map((item) => (
                <button
                  className="chip"
                  type="button"
                  data-field={item}
                  aria-pressed={item === field}
                  key={item}
                  onClick={() => setField(item)}
                >
                  {item} {item === 'All' ? certificates.length : certificates.filter((cert) => cert.field === item).length}
                </button>
              ))}
            </div>
          </div>
          <div className="archive-grid">
            {visible.length ? (
              visible.map((item) => <CertificateCard item={item} key={item.id} onPreview={setActive} />)
            ) : (
              <div className="empty">No certificates match that search.</div>
            )}
          </div>
        </section>
      </main>

      <footer>Some Coursera program pages do not list workload hours.</footer>
      <PreviewModal item={active} onClose={() => setActive(null)} />
    </>
  );
}

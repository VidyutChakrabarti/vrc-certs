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

function providerMark(name) {
  if (name.includes('DeepLearning')) return 'DL';
  if (name.includes('Stanford')) return 'ST';
  if (name.includes('Microsoft')) return 'MS';
  if (name.includes('LearnQuest')) return 'LQ';
  if (name.includes('Google')) return 'G';
  if (name.includes('Packt')) return 'PK';
  if (name.includes('IBM')) return 'IBM';
  return String(name || 'C')
    .split(/\s|\+|\./)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
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

function fieldGroups() {
  return unique(certificates.map((item) => item.field))
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

function providerGroups() {
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

function monthGroups() {
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

export default function DataViewPage() {
  const fields = fieldGroups();
  const providers = providerGroups();
  const timeline = monthGroups();
  const topSubjects = fields.slice(0, 5);
  const hourProviders = [...providers].sort((a, b) => b.hours - a.hours);
  const maxFieldCount = Math.max(...fields.map((item) => item.count));
  const maxProviderCount = Math.max(...providers.map((item) => item.count));
  const maxProviderHours = Math.max(...providers.map((item) => item.hours));
  const maxMonthHours = Math.max(...timeline.map((item) => item.hours));

  return (
    <>
      <div className="scanline" />
      <header className="topbar">
        <nav className="nav" aria-label="Primary navigation">
          <a className="brand" href="/">
            <span className="brand-mark">VC</span>
            <span>Vidyut Chakrabarti</span>
          </a>
          <div className="nav-links">
            <a href="/data-view">Data View</a>
            <a href="/#archive">Certificates</a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="wrap section data-view data-page">
          <div className="section-head">
            <div>
              <p className="kicker">Data View</p>
              <h2>Learning Signals</h2>
            </div>
            <p className="section-note">A visual pass over fields, providers, workload, and completion rhythm.</p>
          </div>
          <div className="chart-grid">
            <article className="chart-card wide">
              <div className="chart-title">
                <h3>Field Distribution</h3>
                <span>records and hours</span>
              </div>
              <div className="field-bars">
                {fields.map((item) => (
                  <div
                    className="chart-row"
                    key={item.field}
                    style={{ '--accent': item.accent, '--w': `${percent(item.count, maxFieldCount)}%` }}
                  >
                    <label title={item.field}>{item.field}</label>
                    <div className="chart-track">
                      <div className="chart-fill" />
                    </div>
                    <span className="chart-value">
                      {item.count} / {item.hours}h
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="chart-card">
              <div className="chart-title">
                <h3>Provider Mix</h3>
                <span>badges in graph</span>
              </div>
              <div className="issuer-bars">
                {providers.map((item) => (
                  <div
                    className="chart-row provider-row"
                    key={item.issuer}
                    style={{ '--accent': item.accent, '--w': `${percent(item.count, maxProviderCount)}%` }}
                  >
                    <label className="provider-name" title={item.issuer}>
                      <span className="provider-logo">{providerMark(item.issuer)}</span>
                      <span>{item.issuer}</span>
                    </label>
                    <div className="chart-track">
                      <div className="chart-fill" />
                    </div>
                    <span className="chart-value">{item.count}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="chart-card">
              <div className="chart-title">
                <h3>Completion Rhythm</h3>
                <span>by month</span>
              </div>
              <div className="timeline-chart">
                {timeline.map((item) => (
                  <div
                    className="time-col"
                    key={item.key}
                    title={`${item.label}: ${item.count} records, ${item.hours} hours`}
                  >
                    <div className="time-bar" style={{ '--h': `${34 + percent(item.hours, maxMonthHours, 6) * 1.55}px` }} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="chart-card">
              <div className="chart-title">
                <h3>Workload Map</h3>
                <span>known hours</span>
              </div>
              <div className="issuer-bars">
                {hourProviders.map((item) => (
                  <div
                    className="chart-row provider-row"
                    key={item.issuer}
                    style={{ '--accent': item.accent, '--w': `${percent(item.hours, maxProviderHours)}%` }}
                  >
                    <label className="provider-name" title={item.issuer}>
                      <span className="provider-logo">{providerMark(item.issuer)}</span>
                      <span>{item.issuer}</span>
                    </label>
                    <div className="chart-track">
                      <div className="chart-fill" />
                    </div>
                    <span className="chart-value">{item.hours}h</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="chart-card">
              <div className="chart-title">
                <h3>Top Subjects</h3>
                <span>exploration depth</span>
              </div>
              <div className="signal-board">
                {topSubjects.map((item) => (
                  <div
                    className="signal-cell"
                    key={item.field}
                    style={{ '--accent': item.accent, '--h': `${46 + percent(item.count, maxFieldCount) * 1.22}px` }}
                  >
                    <div className="signal-block" />
                    <b>{item.count}</b>
                    <span>{item.field}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer>Some Coursera program pages do not list workload hours.</footer>
    </>
  );
}

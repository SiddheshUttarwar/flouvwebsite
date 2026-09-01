function GroupedBarChart({ categories, series, yMax, yTicks, height = 320, width = 640, rotateLabels = true }) {
  const padding = { top: 24, right: 16, bottom: rotateLabels ? 96 : 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const groupW = chartW / categories.length;
  const barGap = 4;
  const barW = (groupW * 0.6) / series.length;

  const yScale = (v) => chartH - (v / yMax) * chartH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={0} x2={chartW} y1={yScale(t)} y2={yScale(t)} stroke="var(--flouv-border)" strokeWidth={1} />
            <text x={-8} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--flouv-muted)">
              {t}
            </text>
          </g>
        ))}
        <line x1={0} x2={0} y1={0} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
        <line x1={0} x2={chartW} y1={chartH} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />

        {categories.map((cat, ci) => {
          const groupX = ci * groupW + groupW / 2 - (barW * series.length + barGap * (series.length - 1)) / 2;
          return (
            <g key={cat}>
              {series.map((s, si) => {
                const val = s.values[ci];
                const x = groupX + si * (barW + barGap);
                if (val == null) {
                  return (
                    <text key={s.name} x={x + barW / 2} y={chartH - 6} textAnchor="middle" fontSize={10.5} fill="var(--flouv-muted)">
                      ND
                    </text>
                  );
                }
                return (
                  <g key={s.name}>
                    <rect x={x} y={yScale(val)} width={barW} height={chartH - yScale(val)} fill={s.color} />
                    <text x={x + barW / 2} y={yScale(val) - 6} textAnchor="middle" fontSize={10} fill="var(--flouv-ink)">
                      {val.toFixed(2)}
                    </text>
                  </g>
                );
              })}
              {rotateLabels ? (
                <text
                  x={ci * groupW + groupW / 2}
                  y={chartH + 14}
                  textAnchor="end"
                  fontSize={10}
                  fill="var(--flouv-muted)"
                  transform={`rotate(-35, ${ci * groupW + groupW / 2}, ${chartH + 14})`}
                >
                  {cat}
                </text>
              ) : (
                <text x={ci * groupW + groupW / 2} y={chartH + 20} textAnchor="middle" fontSize={12} fill="var(--flouv-muted)">
                  {cat}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function MultiTrialChart() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', margin: '0 0 4px', color: 'var(--flouv-blue)' }}>
        Multi-Trial Comparison of UV-C Inactivation
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--flouv-muted)', textAlign: 'center', margin: '0 0 8px' }}>
        Salmonella &amp; E. coli O157:H7 — Log N (CFU/mL)
      </div>
      <GroupedBarChart
        categories={['Skim (327 L/hr, 280 ft)', 'Whole (327 L/hr, 280 ft)', 'Skim (600 L/hr, 100 ft)', 'Skim (700 L/hr, 100 ft)', '50% Diluted Skim (700 L/hr, 100 ft)', 'Humic Acid (600 L/hr, 100 ft)']}
        series={[
          { name: 'Control', color: 'var(--flouv-border)', values: [6.62, 6.62, 6.3, 7.54, 7.42, 6.3] },
          { name: 'UV Treated', color: 'var(--flouv-blue)', values: [3.1, 5.5, 4.5, 6.2, 5.4, null] },
        ]}
        yMax={8}
        yTicks={[0, 2, 4, 6, 8]}
      />
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--flouv-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: 'var(--flouv-border)', display: 'inline-block' }} /> Control
        </span>
        <span style={{ fontSize: 11, color: 'var(--flouv-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: 'var(--flouv-blue)', display: 'inline-block' }} /> UV Treated
        </span>
      </div>
    </div>
  );
}

function DoseResponseLine({ label, xTicks, points, width = 300, height = 170 }) {
  const padding = { top: 14, right: 14, bottom: 34, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const xMax = xTicks[xTicks.length - 1];
  const yMax = 8;
  const yTicks = [0, 2, 4, 6, 8];
  const xScale = (v) => (v / xMax) * chartW;
  const yScale = (v) => chartH - (v / yMax) * chartH;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');

  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4, color: 'var(--flouv-blue)' }}>{label}</div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={0} x2={chartW} y1={yScale(t)} y2={yScale(t)} stroke="var(--flouv-border)" strokeWidth={1} />
              <text x={-8} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fontSize={9.5} fill="var(--flouv-muted)">
                {t}
              </text>
            </g>
          ))}
          <line x1={0} x2={0} y1={0} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          <line x1={0} x2={chartW} y1={chartH} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          <path d={path} fill="none" stroke="var(--flouv-blue)" strokeWidth={1.5} strokeDasharray="4 3" />
          {points.map((p) => (
            <circle key={p.x} cx={xScale(p.x)} cy={yScale(p.y)} r={3.2} fill="var(--flouv-blue)" />
          ))}
          {xTicks.map((t) => (
            <text key={t} x={xScale(t)} y={chartH + 16} textAnchor="middle" fontSize={9.5} fill="var(--flouv-muted)">
              {t}
            </text>
          ))}
          <text x={chartW / 2} y={chartH + 28} textAnchor="middle" fontSize={10} fill="var(--flouv-muted)">
            UV-C REF (mJ/cm²)
          </text>
        </g>
      </svg>
    </div>
  );
}

export function DoseResponseChart() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', margin: '0 0 4px', color: 'var(--flouv-blue)' }}>
        UV-C Dose-Response Curves
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--flouv-muted)', textAlign: 'center', margin: '0 0 10px' }}>
        Log₁₀(N) reduction vs. UV-C Reduction Equivalent Fluence
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <DoseResponseLine
          label="(a) E. coli ATCC 700728"
          xTicks={[0, 3, 6, 9, 12]}
          points={[
            { x: 0, y: 7.8 },
            { x: 3, y: 6.6 },
            { x: 6, y: 4.8 },
            { x: 9, y: 3.6 },
            { x: 12, y: 2.4 },
          ]}
        />
        <DoseResponseLine
          label="(b) B. cereus ATCC 14579 spores"
          xTicks={[0, 10, 30, 50, 60]}
          points={[
            { x: 0, y: 7.8 },
            { x: 10, y: 6.3 },
            { x: 30, y: 4.8 },
            { x: 50, y: 3.2 },
            { x: 60, y: 2.0 },
          ]}
        />
      </div>
    </div>
  );
}

export function StrainInactivationChart() {
  const strains = ['ATCC 49025', 'DSM 2498', 'SAC', 'WAC', 'VF'];
  const d10 = [6.28, 6.55, 1.87, 2.76, 3.45];
  const logReduction = [3.8, 3.7, 5.2, 5.2, 5.2];

  const width = 360;
  const height = 260;
  const padding = { top: 24, right: 34, bottom: 46, left: 34 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const yMax = 7;
  const yTicks = [0, 2, 4, 6];
  const rMin = 3.6;
  const rMax = 5.4;
  const rTicks = [3.6, 4.0, 4.4, 4.8, 5.2];
  const groupW = chartW / strains.length;
  const barW = groupW * 0.5;
  const yScale = (v) => chartH - (v / yMax) * chartH;
  const rScale = (v) => chartH - ((v - rMin) / (rMax - rMin)) * chartH;
  const linePath = logReduction.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * groupW + groupW / 2} ${rScale(v)}`).join(' ');

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', margin: '0 0 4px', color: 'var(--flouv-blue)' }}>
        UV Inactivation of Strains at 24.16 mJ/cm²
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {yTicks.map((t) => (
            <line key={t} x1={0} x2={chartW} y1={yScale(t)} y2={yScale(t)} stroke="var(--flouv-border)" strokeWidth={1} />
          ))}
          <line x1={0} x2={0} y1={0} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          <line x1={chartW} x2={chartW} y1={0} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          <line x1={0} x2={chartW} y1={chartH} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          {yTicks.map((t) => (
            <text key={t} x={-8} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fontSize={9.5} fill="var(--flouv-muted)">
              {t}
            </text>
          ))}
          {rTicks.map((t) => (
            <text key={t} x={chartW + 8} y={rScale(t)} textAnchor="start" dominantBaseline="middle" fontSize={9.5} fill="var(--flouv-muted)">
              {t.toFixed(1)}
            </text>
          ))}
          {strains.map((s, i) => (
            <g key={s}>
              <rect x={i * groupW + groupW / 2 - barW / 2} y={yScale(d10[i])} width={barW} height={chartH - yScale(d10[i])} fill="var(--flouv-blue)" />
              <text x={i * groupW + groupW / 2} y={yScale(d10[i]) - 6} textAnchor="middle" fontSize={10} fill="var(--flouv-ink)">
                {d10[i].toFixed(2)}
              </text>
              <text x={i * groupW + groupW / 2} y={chartH + 16} textAnchor="middle" fontSize={10} fill="var(--flouv-muted)">
                {s}
              </text>
            </g>
          ))}
          <path d={linePath} fill="none" stroke="var(--flouv-blue-soft)" strokeWidth={1.5} />
          {logReduction.map((v, i) => (
            <circle key={i} cx={i * groupW + groupW / 2} cy={rScale(v)} r={3.2} fill="var(--flouv-blue-soft)" />
          ))}
        </g>
      </svg>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 2 }}>
        <span style={{ fontSize: 11, color: 'var(--flouv-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: 'var(--flouv-blue)', display: 'inline-block' }} /> D10 value (mJ/cm²)
        </span>
        <span style={{ fontSize: 11, color: 'var(--flouv-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: 'var(--flouv-blue-soft)', borderRadius: '50%', display: 'inline-block' }} /> Log reduction (CFU/ml)
        </span>
      </div>
    </div>
  );
}

function MiniCompareBar({ title, control, treated, yMax }) {
  const width = 220;
  const height = 140;
  const padding = { top: 20, right: 10, bottom: 30, left: 34 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const yScale = (v) => chartH - (v / yMax) * chartH;
  const barW = chartW * 0.28;
  const xControl = chartW * 0.28 - barW / 2;
  const xTreated = chartW * 0.72 - barW / 2;

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', marginBottom: 2, color: 'var(--flouv-blue)' }}>{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          <line x1={0} x2={0} y1={0} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          <line x1={0} x2={chartW} y1={chartH} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          <rect x={xControl} y={yScale(control)} width={barW} height={chartH - yScale(control)} fill="var(--flouv-border)" />
          <rect x={xTreated} y={yScale(treated)} width={barW} height={chartH - yScale(treated)} fill="var(--flouv-blue)" />
          <text x={xControl + barW / 2} y={chartH + 12} textAnchor="middle" fontSize={9} fill="var(--flouv-muted)">
            Control
          </text>
          <text x={xTreated + barW / 2} y={chartH + 12} textAnchor="middle" fontSize={9} fill="var(--flouv-muted)">
            20 mJ/cm²
          </text>
        </g>
      </svg>
    </div>
  );
}

export function BioactivesGrid() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', margin: '0 0 4px', color: 'var(--flouv-blue)' }}>
        Bioactives Preservation in Fresh Apple Cider
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--flouv-muted)', textAlign: 'center', margin: '0 0 10px' }}>
        Control vs. 20 mJ/cm² UV-C treatment — concentration (mg/100mL)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MiniCompareBar title="Chlorogenic acid" control={4.05} treated={3.85} yMax={4.5} />
        <MiniCompareBar title="Phloridzin" control={1.47} treated={1.48} yMax={1.6} />
        <MiniCompareBar title="Epicatechin" control={0.105} treated={0.095} yMax={0.12} />
        <MiniCompareBar title="Catechin" control={0.0295} treated={0.0293} yMax={0.035} />
      </div>
    </div>
  );
}

export function AppleCiderPassesChart() {
  const categories = ['0', '1', '2'];
  const logReduction = [0, 4.6, 5.6];
  const ref = [0, 12.6, 15.8];
  const width = 340;
  const height = 220;
  const padding = { top: 24, right: 40, bottom: 46, left: 34 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const leftMax = 5;
  const rightMax = 16;
  const leftTicks = [0, 1, 2, 3, 4, 5];
  const rightTicks = [0, 4, 8, 12, 16];
  const groupW = chartW / categories.length;
  const barW = groupW * 0.28;
  const leftScale = (v) => chartH - (v / leftMax) * chartH;
  const rightScale = (v) => chartH - (v / rightMax) * chartH;

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 4, color: 'var(--flouv-blue)' }}>
        Apple Cider — Log Reduction vs REF
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--flouv-muted)', textAlign: 'center', marginBottom: 10 }}>
        Multi-pass UV-C treatment
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {leftTicks.map((t) => (
            <line key={t} x1={0} x2={chartW} y1={leftScale(t)} y2={leftScale(t)} stroke="var(--flouv-border)" strokeWidth={1} />
          ))}
          <line x1={0} x2={0} y1={0} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          <line x1={chartW} x2={chartW} y1={0} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          <line x1={0} x2={chartW} y1={chartH} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          {leftTicks.map((t) => (
            <text key={t} x={-8} y={leftScale(t)} textAnchor="end" dominantBaseline="middle" fontSize={9.5} fill="var(--flouv-muted)">
              {t}
            </text>
          ))}
          {rightTicks.map((t) => (
            <text key={t} x={chartW + 8} y={rightScale(t)} textAnchor="start" dominantBaseline="middle" fontSize={9.5} fill="var(--flouv-muted)">
              {t}
            </text>
          ))}
          {categories.map((cat, i) => {
            const gx = i * groupW + groupW / 2;
            return (
              <g key={cat}>
                <rect x={gx - barW - 2} y={leftScale(logReduction[i])} width={barW} height={chartH - leftScale(logReduction[i])} fill="var(--flouv-blue)" />
                <rect x={gx + 2} y={rightScale(ref[i])} width={barW} height={chartH - rightScale(ref[i])} fill="var(--flouv-blue-soft)" />
                <text x={gx} y={chartH + 16} textAnchor="middle" fontSize={10} fill="var(--flouv-muted)">
                  {cat}
                </text>
              </g>
            );
          })}
          <text x={chartW / 2} y={chartH + 30} textAnchor="middle" fontSize={10} fill="var(--flouv-muted)">
            Passes
          </text>
        </g>
      </svg>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 2 }}>
        <span style={{ fontSize: 11, color: 'var(--flouv-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: 'var(--flouv-blue)', display: 'inline-block' }} /> Log Reduction
        </span>
        <span style={{ fontSize: 11, color: 'var(--flouv-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: 'var(--flouv-blue-soft)', display: 'inline-block' }} /> REF (mJ/cm²)
        </span>
      </div>
    </div>
  );
}

export function EnergyComparisonChart() {
  const categories = ['FloUV (UV-C)', 'Conventional Thermal'];
  const values = [1.5, 15];
  const width = 320;
  const height = 220;
  const padding = { top: 24, right: 16, bottom: 44, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const yMax = 16;
  const yTicks = [0, 4, 8, 12, 16];
  const yScale = (v) => chartH - (v / yMax) * chartH;
  const groupW = chartW / categories.length;
  const barW = groupW * 0.45;
  const colors = ['var(--flouv-blue)', 'var(--flouv-border)'];

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', margin: '0 0 4px', color: 'var(--flouv-blue)' }}>
        Energy Intensity Comparison
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--flouv-muted)', textAlign: 'center', margin: '0 0 10px' }}>
        Electrical Energy per Order (EEO) — kWh/m³ per log reduction
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={0} x2={chartW} y1={yScale(t)} y2={yScale(t)} stroke="var(--flouv-border)" strokeWidth={1} />
              <text x={-8} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--flouv-muted)">
                {t}
              </text>
            </g>
          ))}
          <line x1={0} x2={0} y1={0} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          <line x1={0} x2={chartW} y1={chartH} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          {categories.map((cat, i) => {
            const x = i * groupW + groupW / 2 - barW / 2;
            return (
              <g key={cat}>
                <rect x={x} y={yScale(values[i])} width={barW} height={chartH - yScale(values[i])} fill={colors[i]} />
                <text x={x + barW / 2} y={yScale(values[i]) - 8} textAnchor="middle" fontSize={11} fill="var(--flouv-ink)">
                  {i === 0 ? '1–2' : '~15'}
                </text>
                <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize={10.5} fill="var(--flouv-muted)">
                  {cat}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <div style={{ fontSize: 11, color: 'var(--flouv-muted)', textAlign: 'center', marginTop: 4 }}>
        FloUV reaches pasteurization-equivalent safety at up to 90% less energy than thermal processing.
      </div>
    </div>
  );
}

export function FermentationEnergyChart() {
  const width = 320;
  const height = 220;
  const padding = { top: 24, right: 16, bottom: 44, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const yMax = 32;
  const yTicks = [0, 8, 16, 24, 32];
  const yScale = (v) => chartH - (v / yMax) * chartH;
  const categories = ['FloUV (UV-C)', 'HTST Thermal'];
  const barTop = [4.72, 30];
  const barBottom = [0, 13];
  const labels = ['≈4.72', '13–30'];
  const colors = ['var(--flouv-blue)', 'var(--flouv-border)'];
  const groupW = chartW / categories.length;
  const barW = groupW * 0.45;

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', margin: '0 0 4px', color: 'var(--flouv-blue)' }}>
        Energy Intensity — Fermentation Feed Sterilization
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--flouv-muted)', textAlign: 'center', margin: '0 0 10px' }}>
        All-electric kWh/m³, predicted vs. typical HTST
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={0} x2={chartW} y1={yScale(t)} y2={yScale(t)} stroke="var(--flouv-border)" strokeWidth={1} />
              <text x={-8} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--flouv-muted)">
                {t}
              </text>
            </g>
          ))}
          <line x1={0} x2={0} y1={0} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          <line x1={0} x2={chartW} y1={chartH} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          {categories.map((cat, i) => {
            const x = i * groupW + groupW / 2 - barW / 2;
            return (
              <g key={cat}>
                <rect
                  x={x}
                  y={yScale(barTop[i])}
                  width={barW}
                  height={yScale(barBottom[i]) - yScale(barTop[i])}
                  fill={colors[i]}
                />
                <text x={x + barW / 2} y={yScale(barTop[i]) - 8} textAnchor="middle" fontSize={11} fill="var(--flouv-ink)">
                  {labels[i]}
                </text>
                <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize={10.5} fill="var(--flouv-muted)">
                  {cat}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <div style={{ fontSize: 11, color: 'var(--flouv-muted)', textAlign: 'center', marginTop: 4 }}>
        ≈64% lower energy intensity than typical HTST sterilization — predicted, engineering case study basis.
      </div>
    </div>
  );
}

export function FermentationLogReductionChart() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', margin: '0 0 4px', color: 'var(--flouv-blue)' }}>
        Predicted Cold Inactivation — Sugar/Dextrose Feed
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--flouv-muted)', textAlign: 'center', margin: '0 0 8px' }}>
        Log reduction from D10 + CFD-modeled dose (first-order kinetics)
      </div>
      <GroupedBarChart
        categories={['B. subtilis (spore), ≈80 mJ/cm²', 'S. cerevisiae, ≈80 mJ/cm²', 'MS2-class phage, ≈120 mJ/cm²']}
        series={[{ name: 'Predicted log reduction', color: 'var(--flouv-blue)', values: [7, 6.7, 6] }]}
        yMax={8}
        yTicks={[0, 2, 4, 6, 8]}
        height={280}
      />
      <div style={{ fontSize: 10.5, color: 'var(--flouv-muted)', textAlign: 'center', marginTop: 4 }}>
        Predicted from measured D10 and delivered dose — direct biodosimetry on production feed and organism panel is the validation deliverable.
      </div>
    </div>
  );
}

export function LactoferrinChart() {
  const categories = ['Raw', '28 mJ/cm²', 'HoP'];
  const values = [3.7, 3.4, 0.5];
  const groupLetters = ['a', 'a', 'b'];
  const height = 260;
  const width = 340;
  const padding = { top: 30, right: 16, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const yMax = 4.5;
  const yTicks = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5];
  const yScale = (v) => chartH - (v / yMax) * chartH;
  const groupW = chartW / categories.length;
  const barW = groupW * 0.5;
  const colors = ['var(--flouv-border)', 'var(--flouv-blue)', 'var(--flouv-muted-soft)'];

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', margin: '0 0 4px', color: 'var(--flouv-blue)' }}>Lactoferrin Retention</div>
      <div style={{ fontSize: 11.5, color: 'var(--flouv-muted)', textAlign: 'center', margin: '0 0 8px' }}>
        Raw vs. UV-C Treated vs. Heat Pasteurization (HoP) — mg/mL⁻¹
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {yTicks
            .filter((t) => t % 1 === 0 || t % 1 === 0.5)
            .map((t) => (
              <g key={t}>
                <line x1={0} x2={chartW} y1={yScale(t)} y2={yScale(t)} stroke="var(--flouv-border)" strokeWidth={1} />
                <text x={-8} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--flouv-muted)">
                  {t}
                </text>
              </g>
            ))}
          <line x1={0} x2={0} y1={0} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />
          <line x1={0} x2={chartW} y1={chartH} y2={chartH} stroke="var(--flouv-border)" strokeWidth={1} />

          {categories.map((cat, i) => {
            const x = i * groupW + groupW / 2 - barW / 2;
            const val = values[i];
            return (
              <g key={cat}>
                <rect x={x} y={yScale(val)} width={barW} height={chartH - yScale(val)} fill={colors[i]} />
                <text x={x + barW / 2} y={yScale(val) - 16} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--flouv-ink)">
                  {groupLetters[i]}
                </text>
                <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize={11} fill="var(--flouv-muted)">
                  {cat}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <div style={{ fontSize: 10.5, color: 'var(--flouv-muted)', textAlign: 'center', marginTop: 4 }}>
        One-way ANOVA with Tukey HSD — bars sharing a letter are not significantly different (p &lt; 0.05)
      </div>
    </div>
  );
}

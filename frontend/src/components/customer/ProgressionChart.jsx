import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = ['#D97706', '#0F766E', '#7C3AED', '#DC2626', '#2563EB', '#DB2777'];

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '');

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="pg-tooltip">
      <div className="pg-tooltip-title">{point.fullDate}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="pg-tooltip-row">
          <span className="pg-dot" style={{ background: p.color }} />
          <span>{p.dataKey}</span>
          <strong>{Number(p.value).toFixed(1)}%</strong>
        </div>
      ))}
      {point.meta?.map((m) => (
        <div key={m.pet} className="pg-tooltip-sub">
          {m.pet}: Ngày {m.day} · {m.disease}
        </div>
      ))}
    </div>
  );
}

/**
 * Biểu đồ đường thể hiện Độ tin cậy AI (%) qua từng lần chụp theo dõi.
 * Mỗi bé cưng là một đường riêng.
 */
export default function ProgressionChart({ records }) {
  const sorted = [...records]
    .filter((r) => r.confidence !== undefined && r.confidence !== null)
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

  if (sorted.length === 0) return null;

  const petNames = [...new Set(sorted.map((r) => r.pets?.name || r.pet_name || 'Bé cưng'))];

  const data = sorted.map((r, idx) => {
    const pet = r.pets?.name || r.pet_name || 'Bé cưng';
    return {
      key: r.id || idx,
      label: `N${r.day_number || 1} · ${fmtDate(r.created_at)}`,
      fullDate: r.created_at ? new Date(r.created_at).toLocaleString('vi-VN') : 'Gần đây',
      [pet]: Number(r.confidence),
      meta: [{ pet, day: r.day_number || 1, disease: r.disease_name_vi || 'Chưa rõ' }]
    };
  });

  const first = Number(sorted[0].confidence);
  const last = Number(sorted[sorted.length - 1].confidence);
  const avg = sorted.reduce((s, r) => s + Number(r.confidence), 0) / sorted.length;

  return (
    <div className="card mb-4 pg-chart-card">
      <div className="flex-between pg-chart-head">
        <div>
          <h3 className="pg-chart-title"><TrendingUp size={18} /> Biểu đồ Độ tin cậy AI qua các lần chụp</h3>
          <p className="card-subtitle">Trục ngang: mốc theo dõi (Ngày N · ngày chụp) — Trục dọc: độ tin cậy AI (%)</p>
        </div>
        <div className="pg-stats">
          <div className="pg-stat"><span>Lần đầu</span><strong>{first.toFixed(1)}%</strong></div>
          <div className="pg-stat"><span>Gần nhất</span><strong>{last.toFixed(1)}%</strong></div>
          <div className="pg-stat"><span>Số lần chụp</span><strong>{sorted.length}</strong></div>
        </div>
      </div>

      <div className="pg-chart-body">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 24, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EBE4DA" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} tickMargin={8} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#6B7280' }} width={48} />
            <Tooltip content={<ChartTooltip />} />
            {petNames.length > 1 && <Legend wrapperStyle={{ fontSize: 13 }} />}
            <ReferenceLine y={avg} stroke="#9CA3AF" strokeDasharray="5 5" label={{ value: `TB ${avg.toFixed(0)}%`, fontSize: 11, fill: '#9CA3AF', position: 'insideTopRight' }} />
            {petNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 7 }}
                connectNulls
                animationDuration={700}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

const COLOR_MAP = {
  brand: 'text-brand bg-brand/10 border-brand/20',
  green: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  amber: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  red: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
};

const BAR_COLOR_MAP = {
  brand: 'bg-brand',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-rose-500',
};

export function StatsCard({ label, value, icon: Icon, trendValue, trend, color = 'brand', barPercent, unavailable = false }) {
  const isPositive = trend === 'up';

  return (
    <div className="card p-6 group hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-tx-muted">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={clsx(
              'font-extrabold tracking-tight text-tx-primary leading-none',
              unavailable ? 'text-base text-tx-muted font-semibold' : 'text-3xl'
            )}>
              {value ?? '—'}
            </h3>
            {trendValue && (
              <div className={clsx(
                'flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border',
                isPositive ? 'text-emerald-600 bg-emerald-500/5 border-emerald-500/20' : 'text-rose-600 bg-rose-500/5 border-rose-500/20'
              )}>
                {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {trendValue}
              </div>
            )}
          </div>
        </div>

        <div className={clsx('w-12 h-12 rounded-xl border flex items-center justify-center shrink-0', COLOR_MAP[color])}>
          <Icon size={22} strokeWidth={1.75} />
        </div>
      </div>

      <div className="mt-5 h-1.5 w-full bg-surface-overlay rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-700', BAR_COLOR_MAP[color])}
          style={{ width: `${barPercent ?? 25}%` }}
        />
      </div>
    </div>
  );
}

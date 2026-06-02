import React from 'react';
import {
  Globe2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Server,
  Wifi,
} from 'lucide-react';
import { Card } from './ui';
import { cn } from '../lib/utils';

const NetworkInfo = ({
  isp,
  organization,
  asn,
  city,
  country,
  region,
  lat,
  lon,
  flags = {},
  className = '',
}) => {
  const indicators = [
    { key: 'proxy', label: 'Proxy', value: flags.proxy, icon: ShieldAlert },
    { key: 'hosting', label: 'Hosting', value: flags.hosting, icon: Server },
    { key: 'mobile', label: 'Mobile', value: flags.mobile, icon: Smartphone },
    { key: 'vpn', label: 'VPN', value: flags.vpn, icon: Wifi },
  ];

  return (
    <Card variant="subtle" padding="md" className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Globe2 className="h-4 w-4 text-brand-400" />
        <h3 className="text-sm font-semibold text-foreground">Network Intelligence</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">ISP</p>
          <p className="text-sm font-medium text-foreground">{isp || 'Unknown'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Organization</p>
          <p className="text-sm font-medium text-foreground">{organization || 'Unknown'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">ASN</p>
          <p className="text-sm font-medium text-foreground">{asn || 'Unknown'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Region</p>
          <p className="text-sm font-medium text-foreground">
            {[city, region, country].filter(Boolean).join(', ') || 'Unknown'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {indicators.map((indicator) => {
          if (indicator.value == null) return null;
          const Icon = indicator.icon;
          const isActive = Boolean(indicator.value);

          return (
            <span
              key={indicator.key}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                isActive
                  ? 'border-risk-danger/40 bg-risk-danger/10 text-risk-danger'
                  : 'border-risk-safe/40 bg-risk-safe/10 text-risk-safe'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {indicator.label}
            </span>
          );
        })}
      </div>

      {(lat != null && lon != null) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="font-mono">{lat.toFixed(4)}, {lon.toFixed(4)}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Signals derived from network metadata.</span>
      </div>
    </Card>
  );
};

export default NetworkInfo;

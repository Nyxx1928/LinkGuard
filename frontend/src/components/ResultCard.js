import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import RiskDisplay from './RiskDisplay';
import CopyButton from './CopyButton';
import LazyGeoMap from './LazyGeoMap';
import { Button, Card } from './ui';
import { Check, Server, ShieldAlert, ShieldCheck, Smartphone, ChevronDown } from 'lucide-react';
import {
  timezoneToLocalTime,
  formatDateTime,
} from '../utils/formatters';

const ResultCard = ({ result, showShareLink = true }) => {
  const [expandedSections, setExpandedSections] = useState({
    technical: false,
    network: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!result) {
    return null;
  }

  const { target, type, resolved_ip, geo, risk_level, uuid, created_at } = result;

  const riskScore = {
    LOW: 15,
    MEDIUM: 50,
    HIGH: 85,
    UNKNOWN: 50,
  }[risk_level] || 50;

  const shareUrl = uuid
    ? `${window.location.origin}/lookup/${uuid}`
    : null;

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      {/* Risk Summary Section */}
      <div className="p-6 bg-gradient-to-br from-gray-900/90 to-gray-800/70 border-b border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-white mb-1 truncate">
              {target}
            </h3>
            <p className="text-sm text-gray-400">
              Type: {type.toUpperCase()}
            </p>
          </div>
          <RiskBadge level={risk_level} />
        </div>
        
        <RiskDisplay level={risk_level} score={riskScore} size="md" />
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Key Findings Section */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            Key Findings
          </h4>
          
          {/* IP Address */}
          <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/5">
            <span className="text-sm font-medium text-gray-400 block mb-2">
              Resolved IP Address
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-mono text-white font-semibold">
                {resolved_ip}
              </span>
              <CopyButton text={resolved_ip} label="Copy IP" />
            </div>
          </div>

          {/* Location Summary */}
          {geo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {geo.city && geo.country && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-sm font-medium text-gray-400 block mb-2">
                    Location
                  </span>
                  <p className="text-lg font-semibold text-white">
                    {geo.city}, {geo.country}
                  </p>
                </div>
              )}
              
              {geo.isp && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-sm font-medium text-gray-400 block mb-2">
                    Internet Provider
                  </span>
                  <p className="text-lg font-semibold text-white">
                    {geo.isp}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Network Flags */}
          {geo && (
            <div className="mt-4 flex flex-wrap gap-2">
              {geo.proxy !== undefined && (
                <span
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                    ${geo.proxy
                      ? 'bg-red-900/40 text-red-300 border border-red-700/50'
                      : 'bg-green-900/40 text-green-300 border border-green-700/50'
                    }
                  `}
                >
                  {geo.proxy ? (
                    <ShieldAlert className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  <span>{geo.proxy ? 'Proxy Detected' : 'No Proxy'}</span>
                </span>
              )}
              {geo.hosting !== undefined && (
                <span
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                    ${geo.hosting
                      ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50'
                      : 'bg-white/10 text-gray-300 border border-white/10'
                    }
                  `}
                >
                  {geo.hosting ? (
                    <Server className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>{geo.hosting ? 'Hosting Provider' : 'Not Hosting'}</span>
                </span>
              )}
              {geo.mobile !== undefined && (
                <span
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                    ${geo.mobile
                      ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50'
                      : 'bg-white/10 text-gray-300 border border-white/10'
                    }
                  `}
                >
                  {geo.mobile ? (
                    <Smartphone className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>{geo.mobile ? 'Mobile Connection' : 'Not Mobile'}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Technical Details - Expandable */}
        {geo && (
          <div className="mb-6">
            <button
              onClick={() => toggleSection('technical')}
              className="w-full flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-smooth border border-white/5"
            >
              <h4 className="text-lg font-semibold text-white">
                Technical Details
              </h4>
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  expandedSections.technical ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedSections.technical && (
              <div className="mt-4 p-4 border border-white/10 rounded-lg space-y-4">
                {/* Location Details */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-300 mb-3">
                    Geographic Location
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {geo.city && (
                        <div className="flex items-center">
                          <span className="text-gray-400 w-24 text-sm">City:</span>
                          <span className="font-medium text-white">{geo.city}</span>
                        </div>
                      )}
                      {geo.regionName && (
                        <div className="flex items-center">
                          <span className="text-gray-400 w-24 text-sm">Region:</span>
                          <span className="font-medium text-white">{geo.regionName}</span>
                        </div>
                      )}
                      {geo.country && (
                        <div className="flex items-center">
                          <span className="text-gray-400 w-24 text-sm">Country:</span>
                          <span className="font-medium text-white">{geo.country}</span>
                        </div>
                      )}
                      {geo.zip && (
                        <div className="flex items-center">
                          <span className="text-gray-400 w-24 text-sm">Postal:</span>
                          <span className="font-medium text-white">{geo.zip}</span>
                        </div>
                      )}
                      {geo.timezone && (
                        <div className="flex items-center">
                          <span className="text-gray-400 w-24 text-sm">Local Time:</span>
                          <span className="font-medium text-white">
                            {timezoneToLocalTime(geo.timezone)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Map */}
                    {geo.lat && geo.lon && (
                      <LazyGeoMap lat={geo.lat} lon={geo.lon} />
                    )}
                  </div>
                </div>

                {/* Network Intelligence */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-300 mb-3">
                    Network Intelligence
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {geo.isp && (
                      <div>
                        <span className="text-gray-400 text-sm block mb-1">ISP:</span>
                        <p className="font-medium text-white">{geo.isp}</p>
                      </div>
                    )}
                    {geo.org && (
                      <div>
                        <span className="text-gray-400 text-sm block mb-1">Organization:</span>
                        <p className="font-medium text-white">{geo.org}</p>
                      </div>
                    )}
                    {geo.as && (
                      <div>
                        <span className="text-gray-400 text-sm block mb-1">ASN:</span>
                        <p className="font-medium text-white font-mono text-sm">
                          {geo.as}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        {created_at && (
          <div className="mb-6 text-sm text-gray-500">
            Analyzed {formatDateTime(created_at)}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {showShareLink && shareUrl && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
              }}
            >
              Share Results
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Re-analyze
          </Button>
        </div>

        {/* Share Link Section */}
        {showShareLink && shareUrl && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-1">
                  Share this lookup
                </h4>
                <p className="text-xs text-gray-500">
                  Anyone with this link can view the results
                </p>
              </div>
              <CopyButton text={shareUrl} label="Copy Link" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResultCard;

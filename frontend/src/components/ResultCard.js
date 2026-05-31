import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import RiskDisplay from './RiskDisplay';
import CopyButton from './CopyButton';
import LazyGeoMap from './LazyGeoMap';
import { Button, Card } from './ui';
import { Check, Server, ShieldAlert, ShieldCheck, Smartphone } from 'lucide-react';
import {
  countryCodeToFlag,
  timezoneToLocalTime,
  formatDateTime,
} from '../utils/formatters';

/**
 * ResultCard - Displays a complete lookup result with all enriched data.
 * 
 * This is the main display component for LinkGuard. It shows:
 * - Target and resolved IP
 * - Risk level badge
 * - Geographic location with map
 * - Network intelligence (ISP, org, ASN)
 * - Proxy/hosting/mobile flags
 * - Local time at target location
 * - Shareable public link (if available)
 * 
 * Teaching Point: This is a "container component" that composes multiple
 * smaller components (RiskBadge, CopyButton, GeoMap). This composition
 * pattern makes the UI modular and maintainable.
 */
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

  // Calculate risk score (0-100) based on risk level
  const riskScore = {
    LOW: 15,
    MEDIUM: 50,
    HIGH: 85,
    UNKNOWN: 50,
  }[risk_level] || 50;

  // Build the shareable public URL
  const shareUrl = uuid
    ? `${window.location.origin}/lookup/${uuid}`
    : null;

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      {/* Risk Summary Section */}
      <div className="p-6 bg-gradient-to-br from-neutral-50 to-white border-b border-neutral-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-neutral-900 mb-1">
              {target}
            </h3>
            <p className="text-sm text-neutral-600">
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
          <h4 className="text-lg font-semibold text-neutral-900 mb-4">
            Key Findings
          </h4>
          
          {/* IP Address */}
          <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
            <span className="text-sm font-medium text-neutral-600 block mb-2">
              Resolved IP Address
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-xl font-mono text-neutral-900 font-semibold">
                {resolved_ip}
              </span>
              <CopyButton text={resolved_ip} label="Copy IP" />
            </div>
          </div>

          {/* Location Summary */}
          {geo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {geo.city && geo.country && (
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral-600 block mb-2">
                    Location
                  </span>
                  <p className="text-lg font-semibold text-neutral-900">
                    {geo.countryCode && (
                      <span className="mr-2">
                        {countryCodeToFlag(geo.countryCode)}
                      </span>
                    )}
                    {geo.city}, {geo.country}
                  </p>
                </div>
              )}
              
              {geo.isp && (
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral-600 block mb-2">
                    Internet Provider
                  </span>
                  <p className="text-lg font-semibold text-neutral-900">
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
                      ? 'bg-risk-danger-light text-red-800 border border-red-300'
                      : 'bg-risk-safe-light text-green-800 border border-green-300'
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
                      ? 'bg-risk-caution-light text-yellow-800 border border-yellow-300'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-300'
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
                      ? 'bg-blue-50 text-blue-800 border border-blue-300'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-300'
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
              className="w-full flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-smooth"
            >
              <h4 className="text-lg font-semibold text-neutral-900">
                Technical Details
              </h4>
              <svg
                className={`w-5 h-5 text-neutral-600 transition-transform ${
                  expandedSections.technical ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {expandedSections.technical && (
              <div className="mt-4 p-4 border border-neutral-200 rounded-lg space-y-4">
                {/* Location Details */}
                <div>
                  <h5 className="text-sm font-semibold text-neutral-700 mb-3">
                    Geographic Location
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {geo.city && (
                        <div className="flex items-center">
                          <span className="text-neutral-600 w-24 text-sm">City:</span>
                          <span className="font-medium text-neutral-900">{geo.city}</span>
                        </div>
                      )}
                      {geo.regionName && (
                        <div className="flex items-center">
                          <span className="text-neutral-600 w-24 text-sm">Region:</span>
                          <span className="font-medium text-neutral-900">{geo.regionName}</span>
                        </div>
                      )}
                      {geo.country && (
                        <div className="flex items-center">
                          <span className="text-neutral-600 w-24 text-sm">Country:</span>
                          <span className="font-medium text-neutral-900">
                            {geo.countryCode && (
                              <span className="mr-2">
                                {countryCodeToFlag(geo.countryCode)}
                              </span>
                            )}
                            {geo.country}
                          </span>
                        </div>
                      )}
                      {geo.zip && (
                        <div className="flex items-center">
                          <span className="text-neutral-600 w-24 text-sm">Postal:</span>
                          <span className="font-medium text-neutral-900">{geo.zip}</span>
                        </div>
                      )}
                      {geo.timezone && (
                        <div className="flex items-center">
                          <span className="text-neutral-600 w-24 text-sm">Local Time:</span>
                          <span className="font-medium text-neutral-900">
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
                  <h5 className="text-sm font-semibold text-neutral-700 mb-3">
                    Network Intelligence
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {geo.isp && (
                      <div>
                        <span className="text-neutral-600 text-sm block mb-1">ISP:</span>
                        <p className="font-medium text-neutral-900">{geo.isp}</p>
                      </div>
                    )}
                    {geo.org && (
                      <div>
                        <span className="text-neutral-600 text-sm block mb-1">Organization:</span>
                        <p className="font-medium text-neutral-900">{geo.org}</p>
                      </div>
                    )}
                    {geo.as && (
                      <div>
                        <span className="text-neutral-600 text-sm block mb-1">ASN:</span>
                        <p className="font-medium text-neutral-900 font-mono text-sm">
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
          <div className="mb-6 text-sm text-neutral-500">
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
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-1">
                  Share this lookup
                </h4>
                <p className="text-xs text-neutral-500">
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


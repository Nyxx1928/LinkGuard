import React, { useState } from 'react';
import { Info, ChevronDown, ExternalLink, AlertTriangle } from 'lucide-react';

const TransparencyPanel = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const dataSources = [
    {
      name: 'IP-API',
      url: 'https://ip-api.com',
      description: 'Geolocation and network intelligence',
    },
    {
      name: 'DNS Resolution',
      description: 'Standard DNS queries for domain resolution',
    },
  ];

  const analysisSteps = [
    {
      step: 1,
      title: 'Domain Resolution',
      description: 'We resolve the domain or URL to its IP address using standard DNS queries.',
    },
    {
      step: 2,
      title: 'Geolocation Lookup',
      description: 'We query geolocation databases to determine the physical location of the IP address.',
    },
    {
      step: 3,
      title: 'Network Analysis',
      description: 'We analyze network characteristics including ISP, hosting provider, and proxy detection.',
    },
    {
      step: 4,
      title: 'Risk Assessment',
      description: 'We calculate a risk score based on proxy detection, hosting flags, and network patterns.',
    },
  ];

  const limitations = [
    'Geolocation data is approximate and may not reflect the exact physical location.',
    'VPNs and proxies can mask the true origin of connections.',
    'Risk assessments are based on network characteristics and should not be the sole factor in security decisions.',
    'Data accuracy depends on third-party providers and may vary.',
  ];

  return (
    <div className={`rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left p-4 sm:p-6"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Info className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              How We Analyze Links
            </h3>
            <p className="text-sm text-gray-400">
              Learn about our methodology and data sources
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 sm:px-6 pb-6 space-y-6 border-t border-white/10 pt-6">
          {/* Analysis Steps */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">
              Our Analysis Process
            </h4>
            <div className="space-y-4">
              {analysisSteps.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-semibold">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-white mb-1">
                      {item.title}
                    </h5>
                    <p className="text-sm text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-base font-semibold text-white mb-4">
              Data Sources
            </h4>
            <div className="space-y-3">
              {dataSources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 bg-white/5 rounded-lg border border-white/5"
                >
                  <div className="flex-1">
                    <h5 className="font-medium text-white">
                      {source.name}
                    </h5>
                    <p className="text-sm text-gray-400 mt-1">
                      {source.description}
                    </p>
                  </div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1"
                      aria-label={`Visit ${source.name} website`}
                    >
                      Visit
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Limitations */}
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-base font-semibold text-white mb-4">
              Limitations & Disclaimers
            </h4>
            <ul className="space-y-2">
              {limitations.map((limitation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                  <AlertTriangle className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Last Updated */}
          <div className="pt-6 border-t border-white/10 text-xs text-gray-500">
            Last updated: April 2026
          </div>
        </div>
      )}
    </div>
  );
};

export default TransparencyPanel;

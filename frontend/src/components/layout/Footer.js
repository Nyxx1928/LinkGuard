import React from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';

/**
 * Footer - Shared footer with quick links.
 */
const Footer = () => {
  return (
    <footer className="mt-16 border-t border-white/10 bg-neutral-950/70 py-8">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-300">LinkGuard Security Intelligence</p>
          <p className="text-xs text-neutral-500">Built for safer links and faster triage.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-neutral-300">
          <Link className="hover:text-white transition-colors" to="/about">About</Link>
          <Link className="hover:text-white transition-colors" to="/analyze">Analyze</Link>
          <Link className="hover:text-white transition-colors" to="/history">History</Link>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

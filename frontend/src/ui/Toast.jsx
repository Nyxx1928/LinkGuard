import React from 'react';

export function Toast({ children, className = '' }) {
  return (
    <div className={"fixed bottom-6 right-6 bg-canvas text-ink border border-hairline rounded-md px-lg py-md font-body-sm " + className}>
      {children}
    </div>
  );
}

export default Toast;

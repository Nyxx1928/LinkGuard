import React from 'react';
import { cn } from './utils';

export default function Input(props) {
  return (
    <input
      {...props}
      className={cn('block w-full bg-canvas-soft text-ink border border-hairline rounded-sm px-lg py-md font-body-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder-mute', props.className)}
    />
  );
}

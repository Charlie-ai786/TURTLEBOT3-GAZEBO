import React from 'react';
import { RvizTopBar } from './RvizTopBar';
import { RvizDisplaysPanel } from './RvizDisplaysPanel';
import { RvizViewport } from './RvizViewport';
import { RvizPropertiesPanel } from './RvizPropertiesPanel';
import { RvizBottomBar } from './RvizBottomBar';

export const RvizWorkspace: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full bg-[#1e1e1e] overflow-hidden select-none">
      <RvizTopBar />
      <div className="flex-1 flex relative overflow-hidden">
        <RvizDisplaysPanel />
        <div className="flex-1 relative h-full">
          <RvizViewport />
        </div>
        <RvizPropertiesPanel />
      </div>
      <RvizBottomBar />
    </div>
  );
};


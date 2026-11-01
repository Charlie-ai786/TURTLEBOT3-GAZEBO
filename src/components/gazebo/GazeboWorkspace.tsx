import React from 'react';
import { GazeboMenuBar } from './GazeboMenuBar';
import { GazeboToolbar } from './GazeboToolbar';
import { GazeboLeftPanel } from './GazeboLeftPanel';
import { GazeboViewport } from './GazeboViewport';
import { GazeboInspector } from './GazeboInspector';
import { GazeboBottomBar } from './GazeboBottomBar';

export const GazeboWorkspace: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full bg-[#2b2b2b] overflow-hidden select-none">
      <GazeboMenuBar />
      <GazeboToolbar />
      <div className="flex-1 flex relative overflow-hidden">
        <GazeboLeftPanel />
        <div className="flex-1 relative h-full">
          <GazeboViewport />
          <GazeboInspector />
        </div>
      </div>
      <GazeboBottomBar />
    </div>
  );
};


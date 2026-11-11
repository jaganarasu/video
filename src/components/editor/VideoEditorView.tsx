import React, { useState } from 'react';
import { ProjectData } from '../../types';
import { EditorToolbar } from './EditorToolbar';
import { EditorSidebar, SidebarTab } from './EditorSidebar';
import { PreviewCanvas } from './PreviewCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { Timeline } from './Timeline';

interface VideoEditorViewProps {
  project: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
  onSaveProject: () => void;
  onTriggerExport: () => void;
}

export const VideoEditorView: React.FC<VideoEditorViewProps> = ({
  project,
  onUpdateProject,
  onSaveProject,
  onTriggerExport,
}) => {
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('split');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [isAiFramingActive, setIsAiFramingActive] = useState<boolean>(project.aiTracking.enabled);
  const [canvasScale, setCanvasScale] = useState<number>(1.0);

  const [selectedClipId, setSelectedClipId] = useState<string | null>(
    project.clips[0]?.id || null
  );
  const [selectedCaptionId, setSelectedCaptionId] = useState<string | null>(
    project.captions[0]?.id || null
  );
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(
    project.zoomKeyframes[0]?.id || null
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#070b12]">
      {/* 1. Top Editor Toolbar (Section A) */}
      <EditorToolbar
        project={project}
        onUpdateProject={onUpdateProject}
        onSave={onSaveProject}
        onExport={onTriggerExport}
        showSafeZones={showSafeZones}
        setShowSafeZones={setShowSafeZones}
        isAiFramingActive={isAiFramingActive}
        setIsAiFramingActive={setIsAiFramingActive}
        canvasScale={canvasScale}
        setCanvasScale={setCanvasScale}
      />

      {/* 2. Main Middle Workspace: Left Sidebar + Center Preview + Right Properties */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Section B) */}
        <EditorSidebar
          activeSidebarTab={activeSidebarTab}
          setActiveSidebarTab={setActiveSidebarTab}
          captionsCount={project.captions.length}
          clipsCount={project.clips.length}
          keyframesCount={project.zoomKeyframes.length}
        />

        {/* Center Preview Canvas (Section C) */}
        <PreviewCanvas
          project={project}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          showSafeZones={showSafeZones}
          canvasScale={canvasScale}
        />

        {/* Right Properties Panel (Section D) */}
        <PropertiesPanel
          activeTab={activeSidebarTab}
          project={project}
          onUpdateProject={onUpdateProject}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          selectedClipId={selectedClipId}
          setSelectedClipId={setSelectedClipId}
          selectedCaptionId={selectedCaptionId}
          setSelectedCaptionId={setSelectedCaptionId}
          selectedKeyframeId={selectedKeyframeId}
          setSelectedKeyframeId={setSelectedKeyframeId}
        />
      </div>

      {/* 3. Bottom Timeline (Section E) */}
      <Timeline
        project={project}
        onUpdateProject={onUpdateProject}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        selectedClipId={selectedClipId}
        setSelectedClipId={setSelectedClipId}
        selectedCaptionId={selectedCaptionId}
        setSelectedCaptionId={setSelectedCaptionId}
        selectedKeyframeId={selectedKeyframeId}
        setSelectedKeyframeId={setSelectedKeyframeId}
      />
    </div>
  );
};

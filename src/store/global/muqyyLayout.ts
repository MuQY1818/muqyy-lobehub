/**
 * Muqyy deployment: chat-first layout defaults.
 *
 * System status lives in each browser's localStorage, and the initial status
 * is written there on first load, so changing defaults alone never reaches
 * browsers that already opened the site. `applyMuqyyLayoutDefaults` applies the
 * focused layout once per browser (tracked by `muqyyLayoutVersion`); later
 * customizations made by the user are kept.
 */

export const MUQYY_LAYOUT_VERSION = 1;

/** Home keeps only the composer and recent topics. */
export const MUQYY_HIDDEN_HOME_WIDGETS: string[] = [
  'goals',
  'needsYou',
  'unread',
  'running',
  'news',
  'usage',
  'suggestions',
  'tasks',
  'scheduledTasks',
];

/** Sidebar keeps search, home, recents, assistants and image generation. */
export const MUQYY_HIDDEN_SIDEBAR_SECTIONS: string[] = [
  'tasks',
  'resource',
  'project',
  'community',
  'pages',
  'memory',
];

export const MUQYY_SHOW_HOME_PORTRAIT = false;

interface MuqyyLayoutFields {
  hiddenHomeWidgets?: string[];
  hiddenSidebarSections?: string[];
  muqyyLayoutVersion?: number;
  showHomePortrait?: boolean;
}

export const applyMuqyyLayoutDefaults = <T extends MuqyyLayoutFields>(status: T): T => {
  if (status.muqyyLayoutVersion === MUQYY_LAYOUT_VERSION) return status;

  const hiddenSidebarSections = [...(status.hiddenSidebarSections ?? [])];
  for (const key of MUQYY_HIDDEN_SIDEBAR_SECTIONS) {
    if (!hiddenSidebarSections.includes(key)) hiddenSidebarSections.push(key);
  }

  return {
    ...status,
    hiddenHomeWidgets: [...MUQYY_HIDDEN_HOME_WIDGETS],
    hiddenSidebarSections,
    muqyyLayoutVersion: MUQYY_LAYOUT_VERSION,
    showHomePortrait: MUQYY_SHOW_HOME_PORTRAIT,
  };
};

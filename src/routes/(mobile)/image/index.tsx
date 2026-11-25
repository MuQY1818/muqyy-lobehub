'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { MOBILE_TABBAR_HEIGHT } from '@/const/layoutTokens';
import { TopicUrlSync } from '@/features/Generation';
import DesktopImagePage from '@/routes/(main)/(create)/image';
import { useImageStore } from '@/store/image';

/**
 * Muqyy: mobile had no image generation route, so `/image` rendered blank on
 * phones. Reuse the desktop page without its nav-panel sidebar (that portal
 * only exists on desktop) and keep the URL ⇄ active topic sync. Bottom padding
 * keeps the prompt input clear of the mobile tab bar.
 */
const MobileImagePage = memo(() => (
  <Flexbox height={'100%'} style={{ paddingBottom: MOBILE_TABBAR_HEIGHT }} width={'100%'}>
    <DesktopImagePage />
    <TopicUrlSync useStore={useImageStore} />
  </Flexbox>
));

MobileImagePage.displayName = 'MobileImagePage';

export default MobileImagePage;

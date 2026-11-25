'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { MOBILE_TABBAR_HEIGHT } from '@/const/layoutTokens';
import { TopicUrlSync } from '@/features/Generation';
import DesktopImagePage from '@/routes/(main)/(create)/image';
import { useImageStore } from '@/store/image';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';

/**
 * Muqyy: mobile had no image generation route, so `/image` rendered blank on
 * phones. Reuse the desktop page without its nav-panel sidebar (that portal
 * only exists on desktop) and keep the URL ⇄ active topic sync.
 *
 * The desktop sidebar is also what loads the topic list. Without it a freshly
 * created topic is never found, `switchGenerationTopic` bails out and the page
 * stays on the empty prompt, so load the list here as well.
 *
 * Bottom padding keeps the prompt input clear of the mobile tab bar.
 */
const MobileImagePage = memo(() => {
  const isLogin = useUserStore(authSelectors.isLogin);
  const useFetchGenerationTopics = useImageStore((s) => s.useFetchGenerationTopics);
  useFetchGenerationTopics(!!isLogin);

  return (
    <Flexbox height={'100%'} style={{ paddingBottom: MOBILE_TABBAR_HEIGHT }} width={'100%'}>
      <DesktopImagePage />
      <TopicUrlSync useStore={useImageStore} />
    </Flexbox>
  );
});

MobileImagePage.displayName = 'MobileImagePage';

export default MobileImagePage;

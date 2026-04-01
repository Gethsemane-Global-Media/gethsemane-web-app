const APP_SHELL_CACHE = 'gsom-app-shell-v7';
const BIBLE_DATA_CACHE = 'gsom-bible-data-v1';

const appShellUrls = [
  '/',
  '/index.html',
  '/index.tsx',
  '/metadata.json',
  '/App.tsx',
  '/types.ts',
  '/components/AuthPage.tsx',
  '/components/BibleNavigationModal.tsx',
  '/components/BiblePage.tsx',
  '/components/BookmarksPage.tsx',
  '/components/CalendarPage.tsx',
  '/components/CreatePlanPage.tsx',
  '/components/EditProfilePage.tsx',
  '/components/EmailSignInForm.tsx',
  '/components/EmailSignUpForm.tsx',
  '/components/HomePage.tsx',
  '/components/MainApp.tsx',
  '/components/NotificationSettingsPage.tsx',
  '/components/OnboardingPage.tsx',
  '/components/PlanCard.tsx',
  '/components/PlanDetailPage.tsx',
  '/components/PlanPage.tsx',
  '/components/ReaderPage.tsx',
  '/components/ReadingCompletedPage.tsx',
  '/components/ReferenceSelectorPage.tsx',
  '/components/ReferencesPage.tsx',
  '/components/SettingsPage.tsx',
  '/components/ShareModal.tsx',
  '/components/SignInForm.tsx',
  '/components/SignUpForm.tsx',
  '/components/SplashScreen.tsx',
  '/components/SuccessScreen.tsx',
  '/components/VerseActionMenu.tsx',
  '/components/icons/ArrowLeftIcon.tsx',
  '/components/icons/ArrowRightIcon.tsx',
  '/components/icons/BibleIcon.tsx',
  '/components/icons/BookOpenIcon.tsx',
  '/components/icons/BookmarkIcon.tsx',
  '/components/icons/CalendarIcon.tsx',
  '/components/icons/CheckmarkFabIcon.tsx',
  '/components/icons/CheckmarkIcon.tsx',
  '/components/icons/ChevronDownIcon.tsx',
  '/components/icons/ChevronLeftIcon.tsx',
  '/components/icons/ChevronRightIcon.tsx',
  '/components/icons/CloseIcon.tsx',
  '/components/icons/CopyIcon.tsx',
  '/components/icons/EmailIcon.tsx',
  '/components/icons/GoogleIcon.tsx',
  '/components/icons/HomeIcon.tsx',
  '/components/icons/NotificationIcon.tsx',
  '/components/icons/PauseIcon.tsx',
  '/components/icons/PlanIcon.tsx',
  '/components/icons/PlayCircleIcon.tsx',
  '/components/icons/PlayIcon.tsx',
  '/components/icons/PlusCircleIcon.tsx',
  '/components/icons/RefreshIcon.tsx',
  '/components/icons/SearchIcon.tsx',
  '/components/icons/SettingsIcon.tsx',
  '/components/icons/ShareIcon.tsx',
  '/hooks/useBookmarks.ts',
  '/hooks/useNotificationSettings.ts',
  '/hooks/useUserProfile.ts',
  '/data/bibleBooks.ts',
  '/data/bibleTextManager.ts',
  '/data/bibleVersions.ts',
  '/data/plans.ts',
  '/tsconfig.json',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/react@18.2.0/jsx-runtime',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
];

// Bible data will be cached by the browser/app logic, not the service worker directly
const bibleDataUrls = [];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(cache => {
      console.log('Opened app shell cache and caching assets');
      return cache.addAll(appShellUrls);
    }).catch(err => {
      console.error('Failed to cache assets during install:', err);
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [APP_SHELL_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = event.request.url;
  if (url.startsWith('https://cdn.jsdelivr.net/gh/wldeh/bible-api/') || url.startsWith('https://bolls.life/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(BIBLE_DATA_CACHE).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Only cache basic, same-origin requests.
            if (networkResponse.type !== 'basic' && !appShellUrls.includes(event.request.url)) {
                return networkResponse;
            }
            
            const responseToCache = networkResponse.clone();
            
            caches.open(APP_SHELL_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetching failed:', error);
          throw error;
        });
      })
  );
});
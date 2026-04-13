import { useState, useEffect, useCallback } from 'react';

// Fallback mock data when not running inside Electron (e.g. browser preview)
const mockCaches = [
  { id: 'descript-partitions', name: 'Descript', desc: 'Partitions', icon: '🎬', path: '~/Library/Application Support/Descript/Partitions', size: 12.4 * 1024 ** 3, safe: 'safe' },
  { id: 'chrome-sw', name: 'Chrome', desc: 'Service Worker CacheStorage', icon: '🌐', path: '~/Library/Application Support/Google/Chrome/Default/Service Worker/CacheStorage', size: 3.1 * 1024 ** 3, safe: 'manual', note: 'Clear from Chrome → Settings → Privacy and security → Clear browsing data.' },
  { id: 'spotify', name: 'Spotify', desc: 'Client cache', icon: '🎵', path: '~/Library/Caches/com.spotify.client', size: 2.2 * 1024 ** 3, safe: 'safe' },
  { id: 'slack-cache', name: 'Slack', desc: 'Cache', icon: '💬', path: '~/Library/Application Support/Slack/Cache', size: 860 * 1024 ** 2, safe: 'safe' },
  { id: 'cursor-cache', name: 'Cursor', desc: 'Cache', icon: '✏️', path: '~/Library/Application Support/Cursor/Cache', size: 540 * 1024 ** 2, safe: 'safe' },
  { id: 'discord-cache', name: 'Discord', desc: 'Cache', icon: '🎮', path: '~/Library/Application Support/discord/Cache', size: 320 * 1024 ** 2, safe: 'safe' },
  { id: 'claude-cache', name: 'Claude', desc: 'Cache', icon: '🤖', path: '~/Library/Application Support/Claude/Cache', size: 180 * 1024 ** 2, safe: 'safe' },
  { id: 'zoom', name: 'Zoom', desc: 'Cache', icon: '📹', path: '~/Library/Caches/us.zoom.xos', size: 95 * 1024 ** 2, safe: 'safe' },
  { id: 'notion-shipit', name: 'Notion', desc: 'ShipIt updater', icon: '📝', path: '~/Library/Caches/notion.id.ShipIt', size: 28 * 1024 ** 2, safe: 'safe' },
];
const mockInfo = { total: 994 * 1024 ** 3, used: 712 * 1024 ** 3, free: 282 * 1024 ** 3 };

export function useDiskData() {
  const [caches, setCaches] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [freedSpace, setFreedSpace] = useState(0);

  const hasAPI = typeof window !== 'undefined' && window.diskAPI;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (hasAPI) {
        const [scanned, diskInfo] = await Promise.all([
          window.diskAPI.scan(),
          window.diskAPI.getInfo(),
        ]);
        setCaches(scanned);
        setInfo(diskInfo);
      } else {
        // Browser preview fallback
        await new Promise((r) => setTimeout(r, 400));
        setCaches(mockCaches);
        setInfo(mockInfo);
      }
    } finally {
      setLoading(false);
    }
  }, [hasAPI]);

  const deletePaths = useCallback(async (paths) => {
    if (hasAPI) {
      const result = await window.diskAPI.delete(paths);
      setFreedSpace((prev) => prev + (result.freedSpace || 0));
      await refresh();
      return result;
    }
    // Mock
    const freed = caches.filter((c) => paths.includes(c.path)).reduce((a, c) => a + c.size, 0);
    setCaches((prev) => prev.filter((c) => !paths.includes(c.path)));
    setFreedSpace((prev) => prev + freed);
    return { success: true, freedSpace: freed };
  }, [hasAPI, caches, refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  return { caches, info, loading, freedSpace, refresh, deletePaths };
}

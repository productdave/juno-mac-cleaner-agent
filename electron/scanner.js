const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();

// Expand ~ to home dir
const expand = (p) => p.replace(/^~/, HOME);

// Cache targets. `safe` means the app can delete the directory; `manual` means
// we surface it but leave the cleaning to the user (inside the owning app).
const TARGETS = [
  { id: 'descript-partitions', name: 'Descript', desc: 'Partitions', icon: '🎬', path: '~/Library/Application Support/Descript/Partitions', safe: 'safe' },
  { id: 'descript-cache', name: 'Descript', desc: 'Cache', icon: '🎬', path: '~/Library/Application Support/Descript/Cache', safe: 'safe' },
  { id: 'descript-codecache', name: 'Descript', desc: 'Code Cache', icon: '🎬', path: '~/Library/Application Support/Descript/Code Cache', safe: 'safe' },
  { id: 'descript-assets', name: 'Descript', desc: 'Account assets', icon: '🎬', path: '~/Library/Application Support/Descript/accounts/*/assets', safe: 'manual', note: 'Open Descript → Preferences → Storage to clean project assets safely.' },
  { id: 'claude-cache', name: 'Claude', desc: 'Cache', icon: '🤖', path: '~/Library/Application Support/Claude/Cache', safe: 'safe' },
  { id: 'claude-codecache', name: 'Claude', desc: 'Code Cache', icon: '🤖', path: '~/Library/Application Support/Claude/Code Cache', safe: 'safe' },
  { id: 'chrome-sw', name: 'Chrome', desc: 'Service Worker CacheStorage', icon: '🌐', path: '~/Library/Application Support/Google/Chrome/Default/Service Worker/CacheStorage', safe: 'manual', note: 'Clear from Chrome → Settings → Privacy and security → Clear browsing data.' },
  { id: 'chrome-gpu', name: 'Chrome', desc: 'GPU Cache', icon: '🌐', path: '~/Library/Application Support/Google/Chrome/Default/GPUCache', safe: 'safe' },
  { id: 'slack-cache', name: 'Slack', desc: 'Cache', icon: '💬', path: '~/Library/Application Support/Slack/Cache', safe: 'safe' },
  { id: 'discord-cache', name: 'Discord', desc: 'Cache', icon: '🎮', path: '~/Library/Application Support/discord/Cache', safe: 'safe' },
  { id: 'cursor-cache', name: 'Cursor', desc: 'Cache', icon: '✏️', path: '~/Library/Application Support/Cursor/Cache', safe: 'safe' },
  { id: 'edge-updater', name: 'Microsoft Edge', desc: 'Updater', icon: '🧭', path: '~/Library/Application Support/Microsoft/EdgeUpdater', safe: 'safe' },
  { id: 'spotify', name: 'Spotify', desc: 'Client cache', icon: '🎵', path: '~/Library/Caches/com.spotify.client', safe: 'safe' },
  { id: 'slack-shipit', name: 'Slack', desc: 'ShipIt updater', icon: '💬', path: '~/Library/Caches/com.tinyspeck.slackmacgap.ShipIt', safe: 'safe' },
  { id: 'canva-shipit', name: 'Canva', desc: 'ShipIt updater', icon: '🎨', path: '~/Library/Caches/com.canva.CanvaDesktop.ShipIt', safe: 'safe' },
  { id: 'notion-shipit', name: 'Notion', desc: 'ShipIt updater', icon: '📝', path: '~/Library/Caches/notion.id.ShipIt', safe: 'safe' },
  { id: 'notion-mail-shipit', name: 'Notion Mail', desc: 'ShipIt updater', icon: '📬', path: '~/Library/Caches/notion.mail.id.ShipIt', safe: 'safe' },
  { id: 'openai-atlas', name: 'ChatGPT Atlas', desc: 'Cache', icon: '🧠', path: '~/Library/Caches/com.openai.atlas', safe: 'safe' },
  { id: 'zoom', name: 'Zoom', desc: 'Cache', icon: '📹', path: '~/Library/Caches/us.zoom.xos', safe: 'safe' },
  { id: 'google-caches', name: 'Google', desc: 'Shared caches', icon: '🔍', path: '~/Library/Caches/Google', safe: 'safe' },
  { id: 'claude-shipit', name: 'Claude Desktop', desc: 'ShipIt updater', icon: '🤖', path: '~/Library/Caches/com.anthropic.claudefordesktop.ShipIt', safe: 'safe' },

  // System
  { id: 'trash', name: 'Trash', desc: 'Files in the Trash', icon: '🗑️', path: '~/.Trash', safe: 'safe' },

  // Xcode / iOS dev
  { id: 'xcode-derived', name: 'Xcode', desc: 'DerivedData', icon: '🛠️', path: '~/Library/Developer/Xcode/DerivedData', safe: 'safe' },
  { id: 'xcode-archives', name: 'Xcode', desc: 'Archives', icon: '🛠️', path: '~/Library/Developer/Xcode/Archives', safe: 'manual', note: 'Archives contain shipped builds — review in Xcode → Window → Organizer before deleting.' },
  { id: 'xcode-ios-dsym', name: 'Xcode', desc: 'iOS DeviceSupport', icon: '📱', path: '~/Library/Developer/Xcode/iOS DeviceSupport', safe: 'safe' },
  { id: 'coresim-caches', name: 'CoreSimulator', desc: 'Caches', icon: '📱', path: '~/Library/Developer/CoreSimulator/Caches', safe: 'safe' },
  { id: 'coresim-devices', name: 'CoreSimulator', desc: 'Devices (simulators)', icon: '📱', path: '~/Library/Developer/CoreSimulator/Devices', safe: 'manual', note: 'Use `xcrun simctl delete unavailable` to clean orphaned simulators safely.' },

  // Package managers
  { id: 'npm-cache', name: 'npm', desc: 'Module cache', icon: '📦', path: '~/.npm/_cacache', safe: 'safe' },
  { id: 'yarn-cache', name: 'Yarn', desc: 'Cache', icon: '🧶', path: '~/Library/Caches/Yarn', safe: 'safe' },
  { id: 'pnpm-cache', name: 'pnpm', desc: 'Store cache', icon: '📦', path: '~/Library/Caches/pnpm', safe: 'safe' },
  { id: 'pip-cache', name: 'pip', desc: 'Wheel cache', icon: '🐍', path: '~/Library/Caches/pip', safe: 'safe' },
  { id: 'homebrew-cache', name: 'Homebrew', desc: 'Downloads', icon: '🍺', path: '~/Library/Caches/Homebrew', safe: 'safe' },
  { id: 'gradle-cache', name: 'Gradle', desc: 'Caches', icon: '🐘', path: '~/.gradle/caches', safe: 'safe' },
  { id: 'cargo-cache', name: 'Cargo', desc: 'Registry cache', icon: '🦀', path: '~/.cargo/registry/cache', safe: 'safe' },

  // Docker
  { id: 'docker-vm', name: 'Docker', desc: 'VM disk image', icon: '🐳', path: '~/Library/Containers/com.docker.docker/Data/vms', safe: 'manual', note: 'Reclaim space via Docker Desktop → Settings → Resources → Disk image size, or run `docker system prune -a`.' },
  { id: 'docker-group', name: 'Docker', desc: 'Group containers', icon: '🐳', path: '~/Library/Group Containers/group.com.docker', safe: 'manual', note: 'Managed by Docker Desktop. Use `docker system prune -a` instead of deleting directly.' },
];

// Resolve glob segment `*` for a path like `.../accounts/*/assets`
function resolveGlob(p) {
  const expanded = expand(p);
  if (!expanded.includes('*')) return [expanded];

  const parts = expanded.split('/');
  let resolved = [''];
  for (const part of parts) {
    if (part === '') continue;
    if (part === '*') {
      const next = [];
      for (const base of resolved) {
        const dir = base || '/';
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory()) next.push(path.join(dir, entry.name));
          }
        } catch (_) { /* skip */ }
      }
      resolved = next;
    } else {
      resolved = resolved.map((base) => (base ? path.join(base, part) : '/' + part));
    }
  }
  return resolved;
}

// Get size in bytes via `du -sk`
function getDirSize(p) {
  if (!fs.existsSync(p)) return { size: 0, exists: false, denied: false };
  try {
    const out = execSync(`du -sk ${JSON.stringify(p)} 2>/dev/null`, { encoding: 'utf8' });
    const kb = parseInt(out.trim().split(/\s+/)[0], 10) || 0;
    return { size: kb * 1024, exists: true, denied: false };
  } catch (e) {
    // Permission denied or other error
    return { size: 0, exists: true, denied: true };
  }
}

async function scan() {
  const results = [];
  for (const target of TARGETS) {
    const paths = resolveGlob(target.path);
    for (let i = 0; i < paths.length; i++) {
      const p = paths[i];
      const info = getDirSize(p);
      if (!info.exists) continue;
      results.push({
        id: paths.length > 1 ? `${target.id}-${i}` : target.id,
        name: target.name,
        desc: target.desc,
        icon: target.icon,
        path: p,
        size: info.size,
        safe: target.safe,
        denied: info.denied,
        note: target.note || null,
      });
    }
  }
  results.sort((a, b) => b.size - a.size);
  return results;
}

function deletePaths(paths) {
  let freed = 0;
  const errors = [];
  for (const p of paths) {
    if (!p || !fs.existsSync(p)) continue;
    const before = getDirSize(p).size;
    try {
      execSync(`rm -rf ${JSON.stringify(p)}`);
      freed += before;
    } catch (e) {
      errors.push({ path: p, error: e.message });
    }
  }
  return { success: errors.length === 0, freedSpace: freed, errors };
}

function getDiskInfo() {
  try {
    const out = execSync("df -k /", { encoding: 'utf8' });
    const lines = out.trim().split('\n');
    const parts = lines[1].split(/\s+/);
    // Filesystem 1024-blocks Used Available Capacity iused ifree %iused Mounted
    const totalKb = parseInt(parts[1], 10);
    const usedKb = parseInt(parts[2], 10);
    const freeKb = parseInt(parts[3], 10);
    return {
      total: totalKb * 1024,
      used: usedKb * 1024,
      free: freeKb * 1024,
    };
  } catch (e) {
    return { total: 0, used: 0, free: 0 };
  }
}

module.exports = { scan, deletePaths, getDiskInfo };

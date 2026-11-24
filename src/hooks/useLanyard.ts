import { useEffect, useState } from 'react';
import type { DiscordPresenceStatus, PhotoSlot } from '../types/keepsake';

export interface LanyardDiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  display_name?: string | null;
  avatar: string | null;
  discriminator: string;
  primary_guild?: {
    tag: string | null;
    badge: string | null;
    identity_guild_id: string | null;
    identity_enabled: boolean;
  } | null;
}

export interface LanyardActivity {
  id: string;
  name: string;
  type: number;
  state?: string;
  details?: string;
  emoji?: {
    name?: string;
    id?: string;
    animated?: boolean;
  };
}

export interface LanyardSpotify {
  track_id: string;
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  timestamps: {
    start: number;
    end: number;
  };
}

export interface LanyardUserData {
  discord_user: LanyardDiscordUser;
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
  active_on_discord_web: boolean;
}

interface LanyardRestResponse {
  success: boolean;
  data?: LanyardUserData;
}

export function getDiscordAvatarUrl(user: LanyardDiscordUser, size = 512): string {
  if (user.avatar) {
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`;
  }
  const index = Number(BigInt(user.id) >> 22n) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

function getCustomStatus(activities: LanyardActivity[]): string | undefined {
  const custom = activities.find((activity) => activity.type === 4);
  if (!custom) return undefined;
  const emojiPart = custom.emoji?.name && !custom.emoji.id ? `${custom.emoji.name} ` : '';
  const statePart = custom.state?.trim() ?? '';
  const combined = `${emojiPart}${statePart}`.trim();
  return combined || undefined;
}

function resolvePresenceStatus(data: LanyardUserData): DiscordPresenceStatus {
  if (data.activities.some((activity) => activity.type === 1)) {
    return 'streaming';
  }
  return data.discord_status;
}

function getActivitySummary(data: LanyardUserData): string | undefined {
  if (data.listening_to_spotify && data.spotify) {
    return `Listening to ${data.spotify.song} — ${data.spotify.artist}`;
  }
  const primary = data.activities.find((activity) => activity.type !== 4);
  if (!primary) return undefined;
  const detail = primary.details ? ` · ${primary.details}` : '';
  return `${primary.name}${detail}`;
}

export function mergePhotoWithLanyard(
  photo: PhotoSlot,
  lanyard?: LanyardUserData
): PhotoSlot {
  if (!lanyard) return photo;

  const user = lanyard.discord_user;
  const displayName = user.display_name || user.global_name || user.username || photo.discordDisplayName;
  const customStatus = getCustomStatus(lanyard.activities);
  const activityLabel = getActivitySummary(lanyard);
  const avatarUrl = getDiscordAvatarUrl(user, 512);
  const status = resolvePresenceStatus(lanyard);
  const guildTag = user.primary_guild?.tag || photo.guildTag;

  const platforms: string[] = [];
  if (lanyard.active_on_discord_desktop) platforms.push('Desktop');
  if (lanyard.active_on_discord_mobile) platforms.push('Mobile');
  if (lanyard.active_on_discord_web) platforms.push('Web');

  return {
    ...photo,
    src: avatarUrl,
    discordDisplayName: displayName,
    discordUsername: user.username,
    discordStatus: status,
    discordCustomStatus: customStatus,
    guildTag: guildTag ?? undefined,
    activityLabel,
    spotify: lanyard.listening_to_spotify && lanyard.spotify
      ? {
          song: lanyard.spotify.song,
          artist: lanyard.spotify.artist,
          albumArtUrl: lanyard.spotify.album_art_url,
        }
      : null,
    activePlatforms: platforms.length > 0 ? platforms.join(' · ') : undefined,
    caption: customStatus
      ? `“${customStatus}”`
      : activityLabel
        ? activityLabel
        : guildTag
          ? `Server tag · ${guildTag}`
          : '',
  };
}

export function useLanyardUsers(userIds: readonly string[]): Record<string, LanyardUserData> {
  const [users, setUsers] = useState<Record<string, LanyardUserData>>({});
  const idsKey = userIds.join(',');

  useEffect(() => {
    const ids = idsKey.split(',').filter(Boolean);
    if (ids.length === 0) return;

    let isCancelled = false;
    let socket: WebSocket | null = null;
    let heartbeatTimer: number | null = null;

    const fetchInitial = async () => {
      await Promise.all(
        ids.map(async (id) => {
          try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
            if (!response.ok) return;
            const json = (await response.json()) as LanyardRestResponse;
            if (!isCancelled && json.success && json.data) {
              setUsers((prev) => ({ ...prev, [id]: json.data! }));
            }
          } catch {
            // Keep initial fallback snapshot if offline
          }
        })
      );
    };

    void fetchInitial();

    try {
      socket = new WebSocket('wss://api.lanyard.rest/socket');

      socket.onmessage = (event) => {
        if (isCancelled) return;
        try {
          const payload = JSON.parse(event.data as string) as {
            op: number;
            t?: string;
            d?: unknown;
          };

          if (payload.op === 1) {
            const hello = payload.d as { heartbeat_interval?: number };
            const intervalMs = hello?.heartbeat_interval ?? 30000;

            socket?.send(
              JSON.stringify({
                op: 2,
                d: { subscribe_to_ids: ids },
              })
            );

            if (heartbeatTimer !== null) {
              window.clearInterval(heartbeatTimer);
            }
            heartbeatTimer = window.setInterval(() => {
              if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ op: 3 }));
              }
            }, intervalMs);
          } else if (payload.op === 0) {
            if (payload.t === 'INIT_STATE') {
              const stateMap = payload.d as Record<string, LanyardUserData>;
              setUsers((prev) => ({ ...prev, ...stateMap }));
            } else if (payload.t === 'PRESENCE_UPDATE') {
              const update = payload.d as LanyardUserData & { user_id?: string };
              const targetId = update.user_id ?? update.discord_user?.id;
              if (targetId) {
                setUsers((prev) => ({ ...prev, [targetId]: update }));
              }
            }
          }
        } catch {
          // Ignore malformed socket frames
        }
      };
    } catch {
      // Fallback to initial REST snapshot
    }

    const pollTimer = window.setInterval(() => {
      void fetchInitial();
    }, 60000);

    return () => {
      isCancelled = true;
      if (heartbeatTimer !== null) {
        window.clearInterval(heartbeatTimer);
      }
      window.clearInterval(pollTimer);
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    };
  }, [idsKey]);

  return users;
}

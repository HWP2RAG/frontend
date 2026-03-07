/**
 * PresenceOverlay — displays connected users as colored avatar circles.
 *
 * Reads connectedUsers from useEditorStore (populated via awareness changes).
 * Skips the current user. Shows "+N" badge if more than 5 others connected.
 */

'use client';

import type { HocuspocusProvider } from '@hocuspocus/provider';
import { useEditorStore } from '@/stores/editor-store';

interface PresenceOverlayProps {
  provider: HocuspocusProvider | null;
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function PresenceOverlay({ provider }: PresenceOverlayProps) {
  const connectedUsers = useEditorStore((s) => s.connectedUsers);

  if (!provider) return null;

  const localClientId = provider.awareness?.clientID ?? -1;
  const others = connectedUsers.filter((u) => u.clientId !== localClientId);

  if (others.length === 0) return null;

  const visible = others.slice(0, 5);
  const overflow = others.length - 5;

  return (
    <div className="flex items-center gap-1">
      {visible.map((user) => (
        <div
          key={user.clientId}
          className="relative group"
        >
          <div
            className="flex items-center justify-center rounded-full text-white text-xs font-medium select-none"
            style={{
              width: 28,
              height: 28,
              backgroundColor: user.color,
            }}
            title={user.name}
          >
            {getInitials(user.name)}
          </div>
          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded text-xs text-white bg-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
            {user.name}
          </div>
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium"
          style={{ width: 28, height: 28 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

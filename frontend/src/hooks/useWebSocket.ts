'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useMatchStore } from '@/store/matchStore';
import type { WsMatchUpdate, WsGoalEvent } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

export function useWebSocket() {
  const { accessToken } = useAuthStore();
  const { updateMatch, handleGoal } = useMatchStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    socket = io(WS_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => console.debug('[WS] connected'));
    socket.on('disconnect', () => console.debug('[WS] disconnected'));

    socket.on('match:update', (data: WsMatchUpdate) => updateMatch(data));
    socket.on('match:goal', (data: WsGoalEvent) => handleGoal(data));

    return () => {
      socket?.disconnect();
      socket = null;
      initialized.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function subscribeToMatch(matchId: string) {
    socket?.emit('subscribe:match', matchId);
  }

  function unsubscribeFromMatch(matchId: string) {
    socket?.emit('unsubscribe:match', matchId);
  }

  return { subscribeToMatch, unsubscribeFromMatch };
}

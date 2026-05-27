import { useEffect, useState } from 'react';
import { getSocket } from '@/app/lib/socket';
import style from './SocketStatus.module.css';

/**
 * SocketStatus — индикатор WebSocket
 */
const SocketStatus = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const updateStatus = () => {
      setStatus(socket.connected ? 'connected' : 'disconnected');
    };

    socket.on('connect', updateStatus);
    socket.on('disconnect', updateStatus);
    socket.on('reconnect_attempt', () => setStatus('reconnecting'));

    updateStatus();

    return () => {
      socket.off('connect', updateStatus);
      socket.off('disconnect', updateStatus);
      socket.off('reconnect_attempt');
    };
  }, []);

  const statusLabels: Record<typeof status, string> = {
    connected: 'ONLINE',
    disconnected: 'OFFLINE',
    reconnecting: 'RECONNECTING...'
  };

  return (
    <span className={style.wrapper}>
      <span className={`${style.indicator} ${style[status]}`} title={`Статус: ${statusLabels[status]}`}>
        {status === 'connected' ? '●' : status === 'reconnecting' ? '◍' : '○'}
      </span>
      <span className={style.statusLabel}>{`[${statusLabels[status]}]`}</span>
    </span>
  );
};

export default SocketStatus;
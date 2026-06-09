import { useEffect, useState } from 'react';
import { getSocketStatus, subscribeSocketStatus, type SocketConnectionStatus } from '@/app/lib/socket';
import style from './SocketStatus.module.css';

/**
 * SocketStatus — индикатор WebSocket realtime-соединения
 */
const SocketStatus = () => {
  const [status, setStatus] = useState<SocketConnectionStatus>(getSocketStatus());

  useEffect(() => subscribeSocketStatus(setStatus), []);

  const statusLabels: Record<SocketConnectionStatus, string> = {
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

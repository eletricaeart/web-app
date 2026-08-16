// hooks/useRoomEditor.ts
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { toast } from 'sonner';

export interface Opening {
  id: string;
  type: 'door' | 'window' | 'opening';
  w: number;
  h: number;
  posX: number; // posição horizontal em metros
  posY?: number; // posição vertical (opcional, para janelas/vãos)
  name?: string;
}

export interface ServiceInstance {
  id: string;
  type: 'wall' | 'ceiling' | 'sanca';
  tag: string;
  useInsulation?: boolean;
  measures: { w: number; h: number; openings: Opening[] }[];
  totalArea: number;
  boardType: 'ST' | 'RU' | 'RF';
  profileSize?: 48 | 70 | 90; // apenas parede
  studSpacing?: 0.4 | 0.6; // apenas parede
  // para sanca
  tiranteOffset?: number; // para forro
  perimeter?: number; // para sanca
  height?: number; // para sanca
}

export interface Room {
  id: string;
  name: string;
  services: ServiceInstance[];
}

export function useRoomEditor() {
  const [rooms, setRooms] = useLocalStorage<Room[]>('drywall-rooms', []);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const addRoom = useCallback(
    (room: Room) => {
      setRooms((prev) => [...prev, room]);
    },
    [setRooms],
  );

  const updateRoom = useCallback(
    (id: string, updated: Room) => {
      setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
    },
    [setRooms],
  );

  const removeRoom = useCallback(
    (id: string) => {
      setRooms((prev) => prev.filter((r) => r.id !== id));
      toast.success('Ambiente removido');
    },
    [setRooms],
  );

  const startEditRoom = useCallback((room: Room) => {
    setEditingRoomId(room.id);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setEditingRoomId(null);
  }, []);

  return {
    rooms,
    setRooms,
    editingRoomId,
    setEditingRoomId,
    isDrawerOpen,
    setIsDrawerOpen,
    addRoom,
    updateRoom,
    removeRoom,
    startEditRoom,
    closeDrawer,
  };
}

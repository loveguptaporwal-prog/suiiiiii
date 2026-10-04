// Project S — Continuous Physical Room Navigation & Spatial Registry
// Manages spatial room transitions without page reloads, cuts, or room destruction

import { worldEventBus } from './WorldEventBus.js';

export const Rooms = Object.freeze({
  PARTY_GATE: 'party_gate',
  MAIN_BIRTHDAY_ROOM: 'main_birthday_room',
  MEMORY_ROOM: 'memory_room', // Future
  SECRET_ROOM: 'secret_room', // Future
});

export class RoomNavigationManager {
  constructor() {
    this.currentRoom = Rooms.PARTY_GATE;
    this.previousRoom = null;

    // Spatial boundaries (Z-axis progression)
    // Party Gate: z >= 0
    // Main Room: z < 0 to z >= -6.5
    this.thresholdZ = 0.0;
    this.hysteresis = 0.25; // Prevents fluttering directly on the threshold line

    // Preloaded room status
    this.preloadedRooms = new Set([Rooms.PARTY_GATE, Rooms.MAIN_BIRTHDAY_ROOM]);
  }

  // Update room state based on camera's physical world position
  updateCameraPosition(pos) {
    const z = pos.z;

    if (this.currentRoom === Rooms.PARTY_GATE && z < this.thresholdZ - this.hysteresis) {
      this.transitionTo(Rooms.MAIN_BIRTHDAY_ROOM, { direction: 'forward', crossingZ: z });
    } else if (this.currentRoom === Rooms.MAIN_BIRTHDAY_ROOM && z > this.thresholdZ + this.hysteresis) {
      this.transitionTo(Rooms.PARTY_GATE, { direction: 'backward', crossingZ: z });
    }
  }

  transitionTo(newRoom, details = {}) {
    if (newRoom === this.currentRoom) return;

    this.previousRoom = this.currentRoom;
    this.currentRoom = newRoom;

    worldEventBus.emit('THRESHOLD_CROSS', {
      fromRoom: this.previousRoom,
      toRoom: this.currentRoom,
      timestamp: performance.now(),
      ...details,
    });
  }

  getCurrentRoom() {
    return this.currentRoom;
  }

  // Check if a room is preloaded
  isRoomReady(roomId) {
    return this.preloadedRooms.has(roomId);
  }

  // Seamless preloader hook for future rooms
  preloadRoom(roomId, assetLoaderPromise) {
    if (this.preloadedRooms.has(roomId)) return Promise.resolve();
    return assetLoaderPromise.then(() => {
      this.preloadedRooms.add(roomId);
    });
  }
}

export const roomManager = new RoomNavigationManager();

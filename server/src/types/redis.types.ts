import {
  blitzes,
  cracks,
  gamemodes,
  nopick_modes,
  user_groups,
} from "@prisma/client";

export interface HouseData {
  house_id: number;
  host_id: number;
  gamemode: gamemodes;
  player_count: number;
  nopick_mode: nopick_modes | null;
  automatic_double: boolean;
  blitz_legal: boolean;
  crack_legal: boolean;
  chat_enabled: boolean;
  players_permitted: user_groups;
  spectators_permitted: user_groups;
  player_ids: number[];
  dealer_index: number;
}

export interface HandData {
  house_id: number;
  hand_id: number | null;
  players: PlayerData[];
  blind: CardData[] | null;
  buried: CardData[] | null;
  tricks: TrickData[];
  nopick: boolean | null;
  blitz: blitzes | null;
  crack: cracks | null;
  called_ace: CardData | null;
  opposition_win: boolean | null;
  winning_score: number | null;
  phase: HandPhases;
  next_player: number;
}

export interface PlayerData {
  user_id: number;
  player_index: number;
  passed: boolean | null;
  role: PlayerRoles | null;
  hand: CardData[] | null;
}

export interface CardData {
  card_id: string;
  suit: string;
  power: number;
  points: number;
  playable: boolean | null;
}

export interface TrickData {
  trick_index: number;
  taker: number;
  points_taken: number;
  plays: PlayData[];
}

export interface PlayData {
  play_index: number;
  user_id: number;
  card_code: string;
}

export const enum PlayerRoles {
  PICKER = "PICKER",
  PARTNER = "PARTNER",
  OPPOSITION = "OPPOSITION",
}

export const enum HandPhases {
  POP = "POP",
  BURY = "BURY",
  CALL = "CALL",
  PLAY = "PLAY",
}

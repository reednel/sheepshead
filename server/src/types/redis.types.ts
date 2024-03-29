import { gamemodes, hand_roles, cards, user_groups } from "@prisma/client";

export interface HouseData {
  house_id: number;
  host_id: number;
  gamemode: gamemodes;
  player_count: number;
  leaster_legal: boolean | null;
  double: boolean;
  chat_enabled: boolean;
  players_permitted: user_groups;
  spectators_permitted: user_groups;
  player_ids: number[];
}

export interface HandData {
  house_id: number;
  players: PlayerData[];
  blind: cards[] | null;
  tricks: TrickData[];
  leaster: boolean | null;
  called_ace: cards | null;
  opposition_win: boolean | null;
  winning_score: number | null;
}

export interface PlayerData {
  user_id: number;
  player_index: number;
  role: hand_roles | null;
  hand: cards[] | null;
}

export interface TrickData {
  trick_index: number;
  winner: number;
  points_won: number;
  plays: PlayData[];
}

export interface PlayData {
  play_index: number;
  user_id: number;
  card_code: string;
}

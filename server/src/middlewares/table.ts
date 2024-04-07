import { HouseData, PlayerData, CardData } from "../types/redis.types";
import { randInt } from "./utils";

/**
 * Shuffle the deck of cards, with cryptographically secure randomness.
 * @returns {CardData[]}
 */
export function shuffle(deck: CardData[]): CardData[] {
  let currentIndex = deck.length;
  let randomIndex = 0;

  while (currentIndex !== 0) {
    randomIndex = randInt() % currentIndex;
    currentIndex--;
    [deck[currentIndex], deck[randomIndex]] = [
      deck[randomIndex],
      deck[currentIndex],
    ];
  }

  return deck;
}

/**
 * Deal numCards from the given deck to the given players.
 * @param {CardData[]} deck
 * @param {PlayerData[]} players
 * @param {number} numCards
 * @returns {PlayerData[], CardData[]} The players with cards dealt, and the updated deck.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export function dealPlayers(
  deck: CardData[],
  players: PlayerData[],
  numCards: number
): [PlayerData[], CardData[]] {
  let remainingDeck: CardData[] = deck;
  for (let i = 0; i < 5; i++) {
    const dealtCards = deck.slice(0, numCards);
    remainingDeck = deck.slice(numCards);
    if (!players[i].hand) {
      players[i].hand = [];
    }
    players[i].hand!.push(...dealtCards);
  }
  return [players, remainingDeck];
}

/**
 * Deal numCards from the given deck to the given blind.
 * @param {CardData[]} deck
 * @param {CardData[]} blind
 * @param {number} numCards
 * @returns {CardData[], CardData[]} The dealt cards, and the updated deck.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export function dealBlind(
  deck: CardData[],
  numCards: number
): [CardData[], CardData[]] {
  const dealtCards = deck.slice(0, numCards);
  const remainingDeck = deck.slice(numCards);
  return [dealtCards, remainingDeck];
}

/**
 * Seat the players in the house. The first player is left of the dealer, at index 0.
 * @param {HouseData} house
 * @returns {PlayerData[]}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export function seatPlayers(house: HouseData): PlayerData[] {
  const players: PlayerData[] = [];
  const playerCount = house.player_ids.length;
  const firstPlayer = (house.dealer_index + 1) % playerCount;
  for (let i = 0; i < playerCount; i++) {
    const player_id = house.player_ids[(firstPlayer + i) % playerCount];
    const player: PlayerData = {
      user_id: player_id,
      player_index: i,
      passed: null,
      role: null,
      hand: null,
    };
    players.push(player);
  }
  return players;
}

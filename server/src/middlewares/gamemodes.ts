import { shuffle, dealPlayers, dealBlind, seatPlayers } from "./table";
import {
  HandData,
  HandPhases,
  HouseData,
  PlayerData,
  CardData,
  CallTypes,
  PlayerRoles,
} from "../types/redis.types";

// enum gamemodes {
//   G_2H_4P // 2 handed, 4 pairs down each, 8 each hand
//   G_2H_6P // 2 handed, 6 pairs down each, 4 each hand
//   G_3H_10E // 3 handed, 10 each, 2 blind, picker alone
//   G_4H_8E_BQ // 4 handed, 8 each, black queens partners, double on the bump
//   G_4H_8E_Q7 // 4 handed, 8 each, QC 7D partners
//   G_4H_8E_FQ // 4 handed, 8 each, first 2 queens partners, double on the bump
//   G_4H_7E_2B_CA // 4 handed, 7 each, 2 blind, called ace, black 7s removed, double on the bump
//   G_4H_7E_4B_PA // 4 handed, 7 each, 4 blind, picker alone
//   G_5H_CA // 5 handed, 6 each, 2 blind, called ace
//   G_5H_JD // 5 handed, 6 each, 2 blind, jack of diamonds partner
//   G_5H_QJ // 5 handed, 6 each, black 7s removed, QS JC partners
//   G_5H_FT // 5 handed, 6 each, 2 blind, first trick is partner
//   G_6H_5E_DS // 6 handed, G_5H_CA, dealer sits
//   G_6H_5E_JC // 6 handed, 5 each, 4 blind jack of clubs partner
//   G_7H_4E_JD // 7 handed, 4 each, 4 blind, jack of diamonds partner
//   G_7H_4E_2P // 7 handed, 4 each, 4 blind, jack of diamonds and random partner
//   G_7H_4E_LP // 7 handed, 4 each, 4 blind, left of picker is partner
//   G_7H_DS // 7 handed, G_5H_CA, dealer and left of dealer sit
//   G_8H_4E_BQ // 8 handed, 4 each, black queens partners
//   G_8H_4E_FQ // 8 handed, 4 each, first two cleans partners, 7 of diamonds highest trump
// }

export function initHand(house: HouseData, deck: CardData[]): HandData {
  try {
    switch (house.gamemode) {
      // case "G_2H_4P":
      //   return await init2H4P(house, deck);
      // case "G_2H_6P":
      //   return await init2H6P(house, deck);
      // case "G_3H_10E":
      //   return await init3H10E(house, deck);
      // case "G_4H_8E_BQ":
      //   return await init4H8E_BQ(house, deck);
      // case "G_4H_8E_QJ":
      //   return await init4H8E_QJ(house, deck);
      // case "G_4H_8E_FQP":
      //   return await init4H8E_FQ(house, deck);
      // case "G_4H_7E_2B_CA":
      //   return await init4H7E_2B_CA(house, deck);
      // case "G_4H_7E_4B_PA":
      //   return await init4H7E_4B_PA(house, deck);
      case "G_5H_CA":
        return init5H_CA(house, deck);
      // case "G_5H_JD":
      //   return await init5H_JD(house, deck);
      // case "G_5H_QJ":
      //   return await init5H_QJ(house, deck);
      // case "G_5H_FT":
      //   return await init5H_FT(house, deck);
      // case "G_6H_5E_DS":
      //   return await init6H5E_DS(house, deck);
      // case "G_6H_5E_JC":
      //   return await init6H5E_JC(house, deck);
      // case "G_7H_4E_JD":
      //   return await init7H4E_JD(house, deck);
      // case "G_7H_4E_2P":
      //   return await init7H4E_2P(house, deck);
      // case "G_7H_4E_LP":
      //   return await init7H4E_LP(house, deck);
      // case "G_7H_DS":
      //   return await init7H_DS(house, deck);
      // case "G_8H_4E_BQ":
      //   return await init8H4E_BQ(house, deck);
      // case "G_8H_4E_FQP":
      //   return await init8H4E_FQP(house, deck);
      default:
        throw new Error("Invalid gamemode");
    }
  } catch (error) {
    console.error("Error in initHand:", error);
    throw new Error("Internal Server Error");
  }
}

export function getNextPhase(
  gamemode: string,
  currentPhase: HandPhases
): HandPhases | null {
  try {
    switch (gamemode) {
      // case "G_2H_4P":
      //   return getNextPhase2H4P(currentPhase);
      // case "G_2H_6P":
      //   return getNextPhase2H6P(currentPhase);
      // case "G_3H_10E":
      //   return getNextPhase3H10E(currentPhase);
      // case "G_4H_8E_BQ":
      //   return getNextPhase4H8E_BQ(currentPhase);
      // case "G_4H_8E_QJ":
      //   return getNextPhase4H8E_QJ(currentPhase);
      // case "G_4H_8E_FQ":
      //   return getNextPhase4H8E_FQ(currentPhase);
      // case "G_4H_7E_2B_CA":
      //   return getNextPhase4H7E_2B_CA(currentPhase);
      // case "G_4H_7E_4B_PA":
      //   return getNextPhase4H7E_4B_PA(currentPhase);
      case "G_5H_CA":
        return getNextPhase5H_CA(currentPhase);
      // case "G_5H_JD":
      //   return getNextPhase5H_JD(currentPhase);
      // case "G_5H_QJ":
      //   return getNextPhase5H_QJ(currentPhase);
      // case "G_5H_FT":
      //   return getNextPhase5H_FT(currentPhase);
      // case "G_6H_5E_DS":
      //   return getNextPhase6H5E_DS(currentPhase);
      // case "G_6H_5E_JC":
      //   return getNextPhase6H5E_JC(currentPhase);
      // case "G_7H_4E_JD":
      //   return getNextPhase7H4E_JD(currentPhase);
      // case "G_7H_4E_2P":
      //   return getNextPhase7H4E_2P(currentPhase);
      // case "G_7H_4E_LP":
      //   return getNextPhase7H4E_LP(currentPhase);
      // case "G_7H_DS":
      //   return getNextPhase7H_DS(currentPhase);
      // case "G_8H_4E_BQ":
      //   return getNextPhase8H4E_BQ(currentPhase);
      // case "G_8H_4E_FQ":
      //   return getNextPhase8H4E_FQP(currentPhase);
      default:
        throw new Error("Invalid gamemode");
    }
  } catch (error) {
    console.error("Error in getNextPhase:", error);
    throw new Error("Internal Server Error");
  }
}

/**
 * Identifies which cards in the given hand may be chosen as fail to call an ace for.
 * Updates the `playable` property of each card in the hand, and which type of call is being made.
 * @param {CardData[]} hand
 * @param {CardData[]} blind
 * @returns {[CardData[], CallTypes]}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export function setCallableCards(
  hand: CardData[],
  blind: CardData[]
): [CardData[], CallTypes] {
  try {
    // Call an ace
    for (let i = 0; i < hand.length; i++) {
      if (hand[i].suit === "T") {
        // the card is trump
        hand[i].playable = false;
      } else if (hand[i].power === 6) {
        // the card is an ace
        hand[i].playable = false;
      } else if (
        hand.some((card) => card.suit === hand[i].suit && card.power === 6)
      ) {
        // the ace of this suit is in this hand
        hand[i].playable = false;
      } else if (
        blind.some((card) => card.suit === hand[i].suit && card.power === 6)
      ) {
        // the ace of this suit is in the blind
        hand[i].playable = false;
      } else {
        // the card is callable
        hand[i].playable = true;
      }
    }

    // If there are any callable cards, return
    if (hand.some((card) => card.playable)) {
      return [hand, CallTypes.CALLED_ACE];
    }

    // No cards are playable, call an unknown ace
    for (let i = 0; i < hand.length; i++) {
      if (hand[i].power === 6) {
        // the card is an ace
        hand[i].playable = false;
      } else if (
        hand.some((card) => card.suit === hand[i].suit && card.power === 6)
      ) {
        // the ace of this suit is in this hand
        hand[i].playable = false;
      } else if (
        blind.some((card) => card.suit === hand[i].suit && card.power === 6)
      ) {
        // the ace of this suit is in the blind
        hand[i].playable = false;
      } else {
        // the card is callable
        hand[i].playable = true;
      }
    }

    // If there are any callable cards, return
    if (hand.some((card) => card.playable)) {
      return [hand, CallTypes.UNKNOWN_ACE];
    }

    // Call a 10
    for (let i = 0; i < hand.length; i++) {
      if (hand[i].suit === "T") {
        // the card is trump
        hand[i].playable = false;
      } else if (hand[i].power === 5) {
        // the card is a 10
        hand[i].playable = false;
      } else if (
        hand.some((card) => card.suit === hand[i].suit && card.power === 5)
      ) {
        // the 10 of this suit is in this hand
        hand[i].playable = false;
      } else if (
        blind.some((card) => card.suit === hand[i].suit && card.power === 5)
      ) {
        // the 10 of this suit is in the blind
        hand[i].playable = false;
      } else {
        // the card is callable
        hand[i].playable = true;
      }
    }

    // If there are any callable cards, return
    if (hand.some((card) => card.playable)) {
      return [hand, CallTypes.CALLED_TEN];
    }

    // Call going alone
    return [hand, CallTypes.GOING_ALONE];
  } catch (error) {
    console.error("Error in setCallableCards:", error);
    throw new Error("Internal Server Error");
  }
}

/**
 * Identifies which cards in the given hand may be played in the current trick.
 * Updates the `playable` property of each card in the hand.
 * @param {CardData[]} hand
 * @param {CardData} leadCard
 * @param {PlayerRoles} playerRole
 * @returns {CardData[]}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export function setPlayableCards(
  hand: CardData[],
  leadCard: CardData | null,
  playerRole: PlayerRoles,
  calledCard: CardData | null,
  calledCardPlayed: boolean | null
): CardData[] {
  try {
    if (leadCard === null) {
      // It's the lead, all cards are playable
      for (let i = 0; i < hand.length; i++) {
        hand[i].playable = true;
      }
      return hand;
    }

    if (!calledCardPlayed) {
      // The called card has not been played yet
      if (playerRole === PlayerRoles.PICKER) {
        // This is the partner's play
        if (leadCard.suit === calledCard.suit) {
          // The lead card is the same suit as the called card
          for (let i = 0; i < hand.length; i++) {
            // Only something of the same suit is playable
            if (hand[i].suit === calledCard.suit) {
              hand[i].playable = true;
            } else {
              hand[i].playable = false;
            }
          }
          return hand;
        }
      } else if (playerRole === PlayerRoles.PARTNER) {
        // This is the picker's play
        if (leadCard.suit === calledCard.suit) {
          // The lead card is the same suit as the called card
          for (let i = 0; i < hand.length; i++) {
            // Only the called card is playable
            if (hand[i].card_id === calledCard.card_id) {
              hand[i].playable = true;
            } else {
              hand[i].playable = false;
            }
          }
          return hand;
        }
      }
    }

    

    for (let i = 0; i < hand.length; i++) {
      if (hand[i].suit === leadCard.suit) {
        // The card is the same suit as the lead card
        hand[i].playable = true;
      } 
    }

    return hand;
  } catch (error) {
    console.error("Error in setPlayableCards:", error);
    throw new Error("Internal Server Error");
  }
}

// ...

/**
 * Initialize a hand of Sheepshead.
 * Mode: 5 handed, called ace.
 * @param {HouseData} house
 * @param {CardData[]} deck
 * @returns {HandData}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
function init5H_CA(house: HouseData, newDeck: CardData[]): HandData {
  let deck: CardData[] = shuffle(newDeck);
  let players: PlayerData[] = seatPlayers(house);
  let blind: CardData[] = [];

  [players, deck] = dealPlayers(deck, players, 3);
  [blind, deck] = dealBlind(deck, 2);
  [players, deck] = dealPlayers(deck, players, 3);

  const handData: HandData = {
    house_id: house.house_id,
    hand_id: null,
    players: players,
    blind: blind,
    buried: [],
    tricks: [],
    nopick: null,
    blitz: null,
    crack: null,
    call_type: null,
    called_card: null,
    opposition_win: null,
    winning_score: null,
    phase: HandPhases.POP,
    next_player: 0,
  };

  return handData;
}

function getNextPhase5H_CA(currentPhase: HandPhases): HandPhases | null {
  switch (currentPhase) {
    case HandPhases.POP:
      return HandPhases.BURY;
    case HandPhases.BURY:
      return HandPhases.CALL;
    case HandPhases.CALL:
      return HandPhases.PLAY;
    case HandPhases.PLAY:
      return null;
    default:
      return null;
  }
}

// ...

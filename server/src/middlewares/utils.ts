import { randomBytes } from "crypto";

export function randInt(): number {
  return parseInt(randomBytes(4).toString("hex"), 16);
}

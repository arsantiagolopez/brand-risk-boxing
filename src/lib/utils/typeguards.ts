import type { Card, Fight, Fighter } from "../db/schema";

// Type guard for Card
export const isCard = (item: any): item is Card => {
  return (item as Card).number !== undefined;
};

// Type guard for Fight
export const isFight = (item: any): item is Fight => {
  return (item as Fight).rounds !== undefined;
};

// Type guard for Fighter
export const isFighter = (item: any): item is Fighter => {
  return (item as Fighter).nationality !== undefined;
};

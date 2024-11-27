export interface AidRequest {
  id: string;
  fullName: string;
  identityNumber: string;
  address: string;
  coordinates: [number, number];
  items: RequestedItems;
  timestamp: Date;
}

export interface RequestedItems {
  blankets: number;
  diapers: number;
  foodBoxes: number;
  waterBottles: number;
  hygieneKits: number;
}

export interface AreaReport {
  totalRequests: number;
  items: RequestedItems;
  coordinates: [number, number][];
}
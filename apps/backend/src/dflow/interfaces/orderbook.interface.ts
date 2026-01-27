export interface DFlowOrderbook {
  yes_bids: Record<string, number>; // price -> quantity
  no_bids: Record<string, number>; // price -> quantity
  sequence: number;
}

export interface OrderbookLevel {
  price: number;
  shares: number;
  total: number;
}

export interface ProcessedOrderbook {
  yesBids: OrderbookLevel[];
  noBids: OrderbookLevel[];
  spread: number;
  lastPrice: number;
  sequence: number;
}

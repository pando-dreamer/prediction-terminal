// DFlow enum types for frontend use
export enum DFlowEventSort {
  VOLUME = 'VOLUME',
  VOLUME_24H = 'VOLUME_24H',
  LIQUIDITY = 'LIQUIDITY',
  OPEN_INTEREST = 'OPEN_INTEREST',
  START_DATE = 'START_DATE',
}

export enum DFlowMarketStatus {
  INITIALIZED = 'INITIALIZED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED',
  DETERMINED = 'DETERMINED',
}

// Human-readable labels for the enums
export const DFlowEventSortLabels = {
  [DFlowEventSort.VOLUME]: 'Volume',
  [DFlowEventSort.VOLUME_24H]: '24h Volume',
  [DFlowEventSort.LIQUIDITY]: 'Liquidity',
  [DFlowEventSort.OPEN_INTEREST]: 'Open Interest',
  [DFlowEventSort.START_DATE]: 'Start Date',
};

export const DFlowMarketStatusLabels = {
  [DFlowMarketStatus.INITIALIZED]: 'Initialized',
  [DFlowMarketStatus.ACTIVE]: 'Active',
  [DFlowMarketStatus.INACTIVE]: 'Inactive',
  [DFlowMarketStatus.CLOSED]: 'Closed',
  [DFlowMarketStatus.DETERMINED]: 'Determined',
};

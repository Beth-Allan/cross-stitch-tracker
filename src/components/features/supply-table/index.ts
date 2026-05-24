/**
 * Public API for the Unified Supply Table component system.
 *
 * Consumers (project detail page, supply takeover flow)
 * import from this barrel file. Internal sub-components
 * (AddRow, DataRow, SectionDivider, Footer) are implementation details
 * and are NOT exported.
 */

// Components
export { SupplyTable } from "./supply-table";
export { StatusDonut } from "./status-donut";

// Types
export type {
  SupplyTableAdapter,
  SupplyTableProps,
  SupplyRow,
  SupplySearchResult,
  CalcParams,
  FabricOption,
  CreateSupplyData,
  SupplyType,
  Result,
} from "./types";
export { DEFAULT_CALC_PARAMS } from "./types";

// Adapters
export { LocalStateAdapter } from "./local-state-adapter";
export { ServerActionAdapter } from "./server-action-adapter";
export { CreationFlowAdapter } from "./creation-flow-adapter";

// cartridges/cooperative_markets/settlement.ts
//
// VC Deal Engine — P4: pluggable SettlementVehicle (VC_DEAL_ENGINE_SPEC §8, ADR-0016).
//
// Settlement is the EXECUTION of an approved, allocated deal (P3 `AllocationResult`,
// status "proposed"). This module records the lifecycle of that execution as a series
// of provenance-bearing steps — it never invents amounts beyond what allocation already
// proposed. The core pipeline (intake → score → diligence → IC memo → allocation) is
// identical across every vehicle; only settlement differs, so the vehicle is a pluggable
// adapter behind a stable contract (open → allocate → call capital → close → distribute).
//
// Vehicle-agnostic by design (ADR-0016):
//   * `advisory`    — ships now. No capital held; Auric Works arranges the deal and earns
//                     fees/carry, not principal. committed/called reflect ARRANGED amounts,
//                     distributed is 0.
//   * `syndication` — ships now. Participations/syndications direct to CU/LP subscribers;
//                     the vehicle_object is `capital_markets:participation` / `:syndication`.
//   * `fund`        — STUB. Returns status "vehicle_pending". The investment vehicle
//                     (`capital_markets:fund` + capital_call/distribution mechanics) is a
//                     follow-on decision (ADR-0016); we do NOT fabricate fund mechanics here.
//   * `spv`         — STUB. Returns status "vehicle_pending". Per-deal SPV
//                     (`capital_markets:spv`) is likewise TBD; no SPV mechanics invented.
//
// Alloya is the vehicle-agnostic fund/deal-administration seam at this layer
// (`connector:fund_admin`) — the same admin_connector applies across all four modes.
//
// Pure, deterministic module: NO Date.now / Math.random. The caller passes any ids and
// timestamps (`occurred_at`) it wants recorded. Vehicle-agnostic; consumes P3.

import type { AllocationResult } from "@/cartridges/cooperative_markets/allocation";

export type VehicleMode = "advisory" | "syndication" | "fund" | "spv";

export type SettlementStatus =
  | "opened"
  | "capital_called"
  | "closed"
  | "distributed"
  | "vehicle_pending";

/** One recorded step in the settlement lifecycle, with optional provenance timestamp. */
export interface SettlementStep {
  step: string;
  status: SettlementStatus;
  detail?: string;
  occurred_at?: string;
}

export interface SettlementResult {
  deal: string;
  mode: VehicleMode;
  /** Alloya fund/deal-admin seam — vehicle-agnostic across all modes. */
  admin_connector: "connector:fund_admin";
  steps: SettlementStep[];
  committed_usd: number;
  called_usd: number;
  distributed_usd: number;
  status: SettlementStatus;
  /** capital_markets:participation | :syndication (set only where a vehicle object exists). */
  vehicle_object?: string;
  note?: string;
  generated_by: "settlement:v1";
}

/**
 * The stable contract every settlement vehicle implements. Advisory and syndication
 * ship real steps; fund/spv are pending until the vehicle is decided (ADR-0016). Keeping
 * this interface fixed is what lets fund/spv attach later without reworking the core.
 */
export interface SettlementVehicle {
  mode: VehicleMode;
  open(alloc: AllocationResult): SettlementStep;
  allocate(alloc: AllocationResult): SettlementStep;
  callCapital(alloc: AllocationResult, pct?: number): SettlementStep;
  close(): SettlementStep;
  distribute(amountUsd: number): SettlementStep;
}

const PARTICIPATION = "financial_services:capital_markets:participation";
const SYNDICATION = "financial_services:capital_markets:syndication";

function round0(n: number): number {
  return Math.round(n);
}

// ---------------------------------------------------------------------------
// Advisory vehicle — no capital held. Auric Works arranges the deal and earns
// fees/carry on it, not principal. committed/called mirror the ARRANGED amount;
// nothing is distributed because no principal ever sits in a vehicle.
// ---------------------------------------------------------------------------

/** Factory: advisory SettlementVehicle (default mode; fees/carry, no principal held). */
export function advisorySettlement(): SettlementVehicle {
  return {
    mode: "advisory",
    open(alloc) {
      return {
        step: "open",
        status: "opened",
        detail: `advisory arrangement opened for ${alloc.deal} (no capital held)`,
      };
    },
    allocate(alloc) {
      return {
        step: "allocate",
        status: "opened",
        detail: `${alloc.allocations.length} arranged participation(s), ${alloc.allocated_usd} USD placed`,
      };
    },
    callCapital(alloc, pct = 1) {
      const called = round0(alloc.allocated_usd * pct);
      return {
        step: "call_capital",
        status: "capital_called",
        detail: `arranged ${called} USD (${Math.round(pct * 100)}%); capital flows subscriber→company, not through Auric Works`,
      };
    },
    close() {
      return {
        step: "close",
        status: "closed",
        detail: "advisory arrangement closed; Auric Works earns placement fees + carry, not principal",
      };
    },
    distribute() {
      return {
        step: "distribute",
        status: "distributed",
        detail: "no principal held in advisory mode; distributions handled by the parties directly",
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Syndication vehicle — allocate participations/syndications directly to the
// CU/LP subscribers. Capital is called against the allocated amount and settled
// through the subscriber vehicle objects.
// ---------------------------------------------------------------------------

/** Factory: syndication SettlementVehicle (participations/syndications to subscribers). */
export function syndicationSettlement(): SettlementVehicle {
  return {
    mode: "syndication",
    open(alloc) {
      return {
        step: "open",
        status: "opened",
        detail: `syndication opened for ${alloc.deal}`,
      };
    },
    allocate(alloc) {
      return {
        step: "allocate",
        status: "opened",
        detail: `${alloc.allocations.length} participation/syndication object(s) issued, ${alloc.allocated_usd} USD`,
      };
    },
    callCapital(alloc, pct = 1) {
      const called = round0(alloc.allocated_usd * pct);
      return {
        step: "call_capital",
        status: "capital_called",
        detail: `called ${called} USD (${Math.round(pct * 100)}%) across subscribers`,
      };
    },
    close() {
      return {
        step: "close",
        status: "closed",
        detail: "syndication closed; participations settled to subscribers",
      };
    },
    distribute(amountUsd) {
      return {
        step: "distribute",
        status: "distributed",
        detail: `distributed ${round0(amountUsd)} USD pro-rata to syndicate participants`,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Vehicle selection.
// ---------------------------------------------------------------------------

function vehicleFor(mode: VehicleMode): SettlementVehicle | null {
  if (mode === "advisory") return advisorySettlement();
  if (mode === "syndication") return syndicationSettlement();
  // fund / spv are intentionally unimplemented — vehicle TBD per ADR-0016.
  return null;
}

// ---------------------------------------------------------------------------
// settle — run the lifecycle for a shipped vehicle, or emit vehicle_pending.
// ---------------------------------------------------------------------------

/**
 * Run settlement for an approved, allocated deal.
 *
 * advisory/syndication: executes open → allocate → callCapital → close over the
 * allocation's `allocated_usd`. fund/spv: returns a "vehicle_pending" record with a
 * note that the vehicle decision (ADR-0016) is outstanding — no fund/SPV mechanics
 * are fabricated. distribute() is exposed on the vehicle but not driven here: there is
 * nothing to distribute at settlement time (advisory holds no principal; syndication
 * distributions are proceeds events that occur later).
 */
export function settle(alloc: AllocationResult, mode: VehicleMode): SettlementResult {
  const admin_connector = "connector:fund_admin" as const;
  const vehicle = vehicleFor(mode);

  if (!vehicle) {
    return {
      deal: alloc.deal,
      mode,
      admin_connector,
      steps: [
        {
          step: "vehicle_check",
          status: "vehicle_pending",
          detail: `${mode} vehicle not yet decided`,
        },
      ],
      committed_usd: alloc.allocated_usd,
      called_usd: 0,
      distributed_usd: 0,
      status: "vehicle_pending",
      note:
        `Settlement vehicle "${mode}" is pending: the investment vehicle decision is outstanding ` +
        "(follow-on ADR to ADR-0016). advisory/syndication ship now; fund/spv attach later " +
        "with the Alloya fund-admin connector, without reworking the core pipeline.",
      generated_by: "settlement:v1",
    };
  }

  const steps: SettlementStep[] = [
    vehicle.open(alloc),
    vehicle.allocate(alloc),
    vehicle.callCapital(alloc),
    vehicle.close(),
  ];

  const committed_usd = alloc.allocated_usd;
  const called_usd = alloc.allocated_usd;

  const note =
    mode === "advisory"
      ? "Advisory: no capital held. Auric Works earns placement fees + carry on the arranged " +
        "deal, not principal; distributed_usd is 0."
      : "Syndication: participations/syndications issued directly to eligible CU/LP subscribers.";

  return {
    deal: alloc.deal,
    mode,
    admin_connector,
    steps,
    committed_usd,
    called_usd,
    distributed_usd: 0,
    status: "closed",
    vehicle_object: mode === "advisory" ? PARTICIPATION : SYNDICATION,
    note,
    generated_by: "settlement:v1",
  };
}

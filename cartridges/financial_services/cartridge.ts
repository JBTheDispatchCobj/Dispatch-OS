// cartridges/financial_services/cartridge.ts
//
// Base domain package — the Financial Services Object Registry as an installable
// packaged configuration (CONFIGURATION_RULES §9). It contributes the 341
// canonical object classes as entity_types (config-as-data: core/registry/data +
// core/registry/objects.ts), and nothing else: no workflows, rules, or reports of
// its own. It is a TAXONOMY BASE. Vertical cartridges (e.g. cooperative_markets)
// install on top and add the process/interpretation layer, inheriting these
// classes by spreading `financialServicesEntityTypes()` or referencing schema_refs.

import { installConfiguration, type Cartridge } from "@/core/cartridge";
import {
  financialServicesEntityTypes,
  FINANCIAL_SERVICES_CARTRIDGE_KEY,
} from "@/core/registry/objects";

const pkg: Cartridge = {
  key: FINANCIAL_SERVICES_CARTRIDGE_KEY, // "financial_services"
  label: "Financial Services Object Registry",
  description:
    "Canonical Financial Services object taxonomy (20 families, 341 classes) installed as entity_types. Base domain package extended by vertical cartridges.",
  version: 1,
  status: "active",
  entityTypes: financialServicesEntityTypes(),
  workflows: [],
  checklistTemplates: [],
  rules: [],
  reports: [],
  knowledge: [],
};

installConfiguration(pkg);

export default pkg;

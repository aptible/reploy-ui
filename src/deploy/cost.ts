import { DEFAULT_INSTANCE_CLASS } from "@app/schema";
import type {
  DeployBackup,
  DeployDisk,
  DeployService,
  DeployStack,
} from "@app/types";
import { CONTAINER_PROFILES } from "./container";

export const hoursPerMonth = 731;

export const diskCostPerGBMonth = 0.2;
export const diskIopsCostPerMonth = 0.01;
export const endpointCostPerHour = 0.05;
export const backupCostPerGBHour = 0.02;
export const vpnTunnelCostPerMonth = 99;
export const stackCostPerMonth = 499;

export type CalculateCostProps = {
  services?: Pick<
    DeployService,
    "containerCount" | "containerMemoryLimitMb" | "instanceClass"
  >[];
  disks?: Pick<DeployDisk, "size" | "provisionedIops">[];
  endpoints?: any[];
  backups?: Pick<DeployBackup, "size">[];
  vpnTunnels?: any[];
  stacks?: Pick<DeployStack, "organizationId">[];
};
export const estimateMonthlyCost = ({
  services = [],
  disks = [],
  endpoints = [],
  backups = [],
  vpnTunnels: vpn_tunnels = [],
  stacks = [],
}: CalculateCostProps) => {
  // Returns the monthly cost of all resources
  // Hourly cost
  let hourlyCost = 0;

  for (const service of services) {
    hourlyCost +=
      (((service.containerCount * service.containerMemoryLimitMb) / 1024) *
        CONTAINER_PROFILES[service.instanceClass || DEFAULT_INSTANCE_CLASS]
          .costPerContainerGBHourInCents) /
      100;
  }

  hourlyCost += endpoints.length * endpointCostPerHour;

  for (const backup of backups) {
    hourlyCost += backup.size * backupCostPerGBHour;
  }

  // Monthly cost
  let monthlyCost = hourlyCost * hoursPerMonth;

  for (const disk of disks) {
    monthlyCost += disk.size * diskCostPerGBMonth;
    monthlyCost +=
      Math.max(disk.provisionedIops - 3000, 0) * diskIopsCostPerMonth;
  }

  monthlyCost += vpn_tunnels.length * vpnTunnelCostPerMonth;
  monthlyCost +=
    stacks.filter((stack) => stack.organizationId !== "").length *
    stackCostPerMonth;

  return monthlyCost;
};

export const formatCurrency = (num: number) =>
  num.toLocaleString("en", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

import fs from "node:fs";
import path from "node:path";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  REFUND_STATUS_OPTIONS,
  RETURN_STATUS_OPTIONS,
  SHIPPING_STATUS_OPTIONS,
  type OrderStatusUpdateInput,
  updateOrderStatuses,
} from "@/features/order/order-status-test.service";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  }
}

function loadLocalEnv() {
  const rootDir = process.cwd();
  loadEnvFile(path.join(rootDir, ".env.local"));
  loadEnvFile(path.join(rootDir, ".env"));
}

function printHelp() {
  console.log(`
Script chuyen status don hang.

Lenh:
  npm run order:status -- --order-code <ORDER_CODE> --order-status <STATUS> [options]

Bat buoc:
  --order-code       Ma don hang, vd: XX202607120451224563322
  --order-status     ${ORDER_STATUS_OPTIONS.join(" | ")}

Tuy chon:
  --payment-status   ${PAYMENT_STATUS_OPTIONS.join(" | ")}
  --shipping-status  ${SHIPPING_STATUS_OPTIONS.join(" | ")}
  --refund-status    ${REFUND_STATUS_OPTIONS.join(" | ")}
  --return-status    ${RETURN_STATUS_OPTIONS.join(" | ")}
  --shipping-provider Ten don vi van chuyen
  --tracking-code    Ma van don
  --help             Hien huong dan

Vi du:
  npm run order:status -- --order-code XX202607120451224563322 --order-status CONFIRMED
  npm run order:status -- --order-code XX202607120451224563322 --order-status SHIPPING --payment-status PAID --shipping-status SHIPPING --shipping-provider GHTK --tracking-code TK123
  npm run order:status -- --order-code XX202607120451224563322 --order-status RETURNED --payment-status REFUNDED --refund-status COMPLETED --return-status COMPLETED
`.trim());
}

function readArg(args: string[], name: string) {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

function normalizeOptional(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function buildInput(args: string[]): OrderStatusUpdateInput {
  const orderCode = normalizeOptional(readArg(args, "--order-code"));
  const orderStatus = normalizeOptional(readArg(args, "--order-status"));

  if (!orderCode) {
    throw new Error("Thieu --order-code.");
  }

  if (!orderStatus) {
    throw new Error("Thieu --order-status.");
  }

  return {
    orderCode,
    orderStatus: orderStatus.toUpperCase() as OrderStatusUpdateInput["orderStatus"],
    paymentStatus: normalizeOptional(readArg(args, "--payment-status"))?.toUpperCase() as
      | OrderStatusUpdateInput["paymentStatus"]
      | undefined,
    shippingStatus: normalizeOptional(readArg(args, "--shipping-status"))?.toUpperCase() as
      | OrderStatusUpdateInput["shippingStatus"]
      | undefined,
    refundStatus: normalizeOptional(readArg(args, "--refund-status"))?.toUpperCase() as
      | OrderStatusUpdateInput["refundStatus"]
      | undefined,
    returnStatus: normalizeOptional(readArg(args, "--return-status"))?.toUpperCase() as
      | OrderStatusUpdateInput["returnStatus"]
      | undefined,
    shippingProvider: normalizeOptional(readArg(args, "--shipping-provider")),
    trackingCode: normalizeOptional(readArg(args, "--tracking-code")),
  };
}

async function main() {
  loadLocalEnv();

  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const input = buildInput(args);
  const result = await updateOrderStatuses(input);

  console.log("Cap nhat thanh cong.");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Khong the chuyen status don hang.",
  );
  process.exitCode = 1;
});

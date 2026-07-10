/* eslint-disable no-console */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  getOrderStatusSnapshot,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  REFUND_STATUS_OPTIONS,
  RETURN_STATUS_OPTIONS,
  SHIPPING_STATUS_OPTIONS,
  type OrderTestStatus,
  updateOrderStatuses,
  type OrderStatusUpdateInput,
  type PaymentTestStatus,
  type RefundTestStatus,
  type ReturnTestStatus,
  type ShippingTestStatus,
} from "../src/features/order/order-status-test.service";

const dotenv = require("dotenv");
dotenv.config();

type CliArgs = {
  orderCode?: string;
  orderStatus?: string;
  paymentStatus?: string;
  shippingStatus?: string;
  refundStatus?: string;
  returnStatus?: string;
  shippingProvider?: string;
  trackingCode?: string;
  yes?: boolean;
  help?: boolean;
};

function parseArgs(argv: string[]) {
  const args: CliArgs = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    switch (token) {
      case "--order-code":
        args.orderCode = next;
        index += 1;
        break;
      case "--order-status":
        args.orderStatus = next;
        index += 1;
        break;
      case "--payment-status":
        args.paymentStatus = next;
        index += 1;
        break;
      case "--shipping-status":
        args.shippingStatus = next;
        index += 1;
        break;
      case "--refund-status":
        args.refundStatus = next;
        index += 1;
        break;
      case "--return-status":
        args.returnStatus = next;
        index += 1;
        break;
      case "--shipping-provider":
        args.shippingProvider = next;
        index += 1;
        break;
      case "--tracking-code":
        args.trackingCode = next;
        index += 1;
        break;
      case "--yes":
      case "-y":
        args.yes = true;
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      default:
        break;
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Script test cap nhat trang thai don hang tren Supabase.

Lenh:
  npm run test:order-status
  npm run test:order-status -- --order-code ORD202607080004 --order-status COMPLETED

Tuy chon:
  --order-code <code>
  --order-status <${ORDER_STATUS_OPTIONS.join(" | ")}>
  --payment-status <${PAYMENT_STATUS_OPTIONS.join(" | ")}>
  --shipping-status <${SHIPPING_STATUS_OPTIONS.join(" | ")}>
  --refund-status <${REFUND_STATUS_OPTIONS.join(" | ")}>
  --return-status <${RETURN_STATUS_OPTIONS.join(" | ")}>
  --shipping-provider <text>
  --tracking-code <text>
  --yes
`);
}

async function askChoice<TOption extends readonly string[]>(
  rl: ReturnType<typeof createInterface>,
  label: string,
  options: TOption,
  defaultValue?: TOption[number] | string | null,
): Promise<TOption[number]> {
  console.log(`\n${label}:`);
  options.forEach((option, index) => {
    const marker = option === defaultValue ? " (default)" : "";
    console.log(`  ${index + 1}. ${option}${marker}`);
  });

  const answer = (await rl.question(`Chon 1-${options.length}${defaultValue ? `, Enter = ${defaultValue}` : ""}: `)).trim();

  if (!answer && defaultValue) {
    return defaultValue as TOption[number];
  }

  const numericIndex = Number(answer);
  if (Number.isInteger(numericIndex) && numericIndex >= 1 && numericIndex <= options.length) {
    return options[numericIndex - 1];
  }

  const normalized = answer.toUpperCase();
  if (options.includes(normalized as TOption[number])) {
    return normalized as TOption[number];
  }

  throw new Error(`Lua chon khong hop le cho ${label}.`);
}

function parseCliOption<TOption extends readonly string[]>(
  value: string,
  options: TOption,
  label: string,
): TOption[number] {
  const normalized = value.trim().toUpperCase();

  if (options.includes(normalized as TOption[number])) {
    return normalized as TOption[number];
  }

  throw new Error(`${label} khong hop le: ${value}`);
}

async function askOptionalText(
  rl: ReturnType<typeof createInterface>,
  label: string,
  defaultValue?: string | null,
) {
  const answer = await rl.question(
    `${label}${defaultValue ? ` (Enter = ${defaultValue})` : " (bo trong neu khong doi)"}: `,
  );

  const trimmed = answer.trim();
  if (!trimmed) {
    return defaultValue ?? null;
  }

  return trimmed;
}

async function buildInputFromPrompt(args: CliArgs) {
  const rl = createInterface({ input, output });

  try {
    const orderCode =
      args.orderCode?.trim() ||
      (await rl.question("Nhap ma don hang (order_code): ")).trim();

    if (!orderCode) {
      throw new Error("Ban can nhap ma don hang.");
    }

    const snapshot = await getOrderStatusSnapshot(orderCode);
    console.log("\nTrang thai hien tai:");
    console.log(
      JSON.stringify(
        {
          order: snapshot.order,
          shipping: snapshot.shipping,
          latestPayment: snapshot.latestPayment,
          latestReturnRequest: snapshot.latestReturnRequest,
          latestRefund: snapshot.latestRefund,
        },
        null,
        2,
      ),
    );

    const orderStatus: OrderTestStatus = args.orderStatus
      ? parseCliOption(args.orderStatus, ORDER_STATUS_OPTIONS, "order-status")
      : await askChoice(
          rl,
          "Trang thai don hang moi",
          ORDER_STATUS_OPTIONS,
          snapshot.order.order_status,
        );

    const paymentStatus: PaymentTestStatus = args.paymentStatus
      ? parseCliOption(args.paymentStatus, PAYMENT_STATUS_OPTIONS, "payment-status")
      : await askChoice(
          rl,
          "Trang thai thanh toan",
          PAYMENT_STATUS_OPTIONS,
          snapshot.latestPayment?.payment_status ?? snapshot.order.payment_status,
        );

    const shippingStatus: ShippingTestStatus | null = args.shippingStatus
      ? parseCliOption(args.shippingStatus, SHIPPING_STATUS_OPTIONS, "shipping-status")
      : snapshot.shipping
        ? await askChoice(
            rl,
            "Trang thai giao hang",
            SHIPPING_STATUS_OPTIONS,
            snapshot.shipping.shipping_status,
          )
        : null;

    const returnStatus: ReturnTestStatus | null = args.returnStatus
      ? parseCliOption(args.returnStatus, RETURN_STATUS_OPTIONS, "return-status")
      : snapshot.latestReturnRequest
        ? await askChoice(
            rl,
            "Trang thai doi/tra",
            RETURN_STATUS_OPTIONS,
            snapshot.latestReturnRequest.return_status,
          )
        : null;

    const refundStatus: RefundTestStatus | null = args.refundStatus
      ? parseCliOption(args.refundStatus, REFUND_STATUS_OPTIONS, "refund-status")
      : snapshot.latestRefund
        ? await askChoice(
            rl,
            "Trang thai hoan tien",
            REFUND_STATUS_OPTIONS,
            snapshot.latestRefund.refund_status,
          )
        : null;

    const shippingProvider =
      args.shippingProvider ??
      (snapshot.shipping
        ? await askOptionalText(
            rl,
            "Don vi van chuyen",
            snapshot.shipping.shipping_provider,
          )
        : null);

    const trackingCode =
      args.trackingCode ??
      (snapshot.shipping
        ? await askOptionalText(rl, "Ma van don", snapshot.shipping.tracking_code)
        : null);

    return {
      orderCode,
      orderStatus,
      paymentStatus,
      shippingStatus,
      returnStatus,
      refundStatus,
      shippingProvider,
      trackingCode,
    } satisfies OrderStatusUpdateInput;
  } finally {
    rl.close();
  }
}

async function confirmIfNeeded(args: CliArgs, payload: OrderStatusUpdateInput) {
  if (args.yes) {
    return true;
  }

  const rl = createInterface({ input, output });
  try {
    console.log("\nKe hoach update:");
    console.log(JSON.stringify(payload, null, 2));
    const answer = (await rl.question("Xac nhan cap nhat? (y/N): ")).trim().toLowerCase();
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const payload = await buildInputFromPrompt(args);
  const confirmed = await confirmIfNeeded(args, payload);

  if (!confirmed) {
    console.log("Da huy thao tac.");
    return;
  }

  const result = await updateOrderStatuses(payload);

  console.log("\nCap nhat thanh cong.");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("\nScript that bai.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import { NextResponse } from "next/server";

// Chuẩn hóa response của tất cả API route để FE xử lý nhất quán.
// Mọi response đều có dạng: { success, data?, message?, error? }
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: unknown;
};

export function ok<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function fail(message: string, status = 400, error?: unknown) {
  return NextResponse.json(
    { success: false, message, error: error ?? null },
    { status }
  );
}

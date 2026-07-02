import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Gộp class Tailwind, xử lý xung đột (vd: "p-2" + "p-4" -> "p-4").
// Dùng trong mọi component để merge className truyền từ ngoài vào.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Định dạng giá tiền VND: 1250000 -> "1.250.000 VND".
export function formatPrice(value: number): string {
  return `${value.toLocaleString("vi-VN")} VND`;
}

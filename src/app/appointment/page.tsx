import type { Metadata } from "next";
import { AppointmentModal } from "@/components/organisms/AppointmentModal";

export const metadata: Metadata = {
  title: "Dat lich hen",
};

const BRANCHES = [
  { label: "XEO XO Ha Noi", value: "ha-noi" },
  { label: "XEO XO Sai Gon", value: "sai-gon" },
];

const TIME_SLOTS = [
  { id: "09:00", label: "09:00" },
  { id: "10:30", label: "10:30" },
  { id: "14:00", label: "14:00" },
  { id: "15:30", label: "15:30" },
  { id: "17:00", label: "17:00" },
];

export default function AppointmentPage() {
  return (
    <main className="min-h-screen bg-secondary px-6 py-10">
      <AppointmentModal branches={BRANCHES} timeSlots={TIME_SLOTS} />
    </main>
  );
}

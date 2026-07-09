"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MeasurementKey,
  MeasurementValues,
} from "@/features/size-recommendation/size-recommendation";
import { getCurrentProfile } from "@/services/measurement.service";
import type { Gender } from "@/types/product.types";
import type { MeasurementProfileDto } from "@/types/measurement.types";

type SharedMeasurementValues = Partial<Record<MeasurementKey, string>>;

const STORAGE_PREFIX = "xeoxo.shared-measurements";
const STORAGE_VERSION = "v1";
const CHANGE_EVENT = "xeoxo-shared-measurements-updated";

function storageKey(gender: Gender) {
  return `${STORAGE_PREFIX}.${STORAGE_VERSION}.${gender}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readSessionValues(gender: Gender): SharedMeasurementValues {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(storageKey(gender));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SharedMeasurementValues;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSessionValues(gender: Gender, values: SharedMeasurementValues) {
  if (!canUseStorage()) return;

  const cleaned = Object.fromEntries(
    Object.entries(values).filter(([, value]) => value != null && String(value).trim() !== ""),
  ) as SharedMeasurementValues;

  window.localStorage.setItem(storageKey(gender), JSON.stringify(cleaned));
  window.dispatchEvent(
    new CustomEvent(CHANGE_EVENT, {
      detail: { gender, values: cleaned },
    }),
  );
}

function profileMatchesGender(profile: MeasurementProfileDto | null, gender: Gender) {
  if (!profile) return false;
  const codes = new Set(
    profile.measurements.map((item) => item.measurement_code.trim().toLowerCase()),
  );

  // Current product-size forms distinguish gender by field set:
  // male profiles include height/weight, female profiles do not.
  return gender === "nam"
    ? codes.has("height") && codes.has("weight")
    : !codes.has("height") && !codes.has("weight");
}

function profileToValues(
  profile: MeasurementProfileDto | null,
  gender: Gender,
): SharedMeasurementValues {
  if (!profileMatchesGender(profile, gender)) return {};
  if (!profile) return {};

  return Object.fromEntries(
    profile.measurements.map((item) => [
      item.measurement_code as MeasurementKey,
      String(item.value),
    ]),
  ) as SharedMeasurementValues;
}

export function useSharedMeasurements(gender: Gender = "nu") {
  const [profile, setProfile] = useState<MeasurementProfileDto | null>(null);
  const [values, setValues] = useState<SharedMeasurementValues>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sessionValues = readSessionValues(gender);
      const data = await getCurrentProfile();
      const matchedProfile = profileMatchesGender(data, gender) ? data : null;
      setProfile(matchedProfile);
      setValues(
        Object.keys(sessionValues).length
          ? sessionValues
          : profileToValues(matchedProfile, gender),
      );
    } catch (err) {
      if (err instanceof Error && err.message === "Vui long dang nhap.") {
        // Not logged in, that's fine for guests
        setProfile(null);
        setValues(readSessionValues(gender));
      } else {
        setError(err instanceof Error ? err : new Error("Failed to load profile"));
        setValues(readSessionValues(gender));
      }
    } finally {
      setIsLoading(false);
    }
  }, [gender]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === storageKey(gender)) {
        setValues(readSessionValues(gender));
      }
    }

    function handleLocalChange(event: Event) {
      const customEvent = event as CustomEvent<{
        gender: Gender;
        values: SharedMeasurementValues;
      }>;
      if (customEvent.detail?.gender === gender) {
        setValues(customEvent.detail.values ?? {});
      }
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(CHANGE_EVENT, handleLocalChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(CHANGE_EVENT, handleLocalChange);
    };
  }, [gender]);

  const updateValues = useCallback(
    (nextValues: Partial<MeasurementValues>) => {
      const merged = {
        ...readSessionValues(gender),
        ...nextValues,
      } as SharedMeasurementValues;
      writeSessionValues(gender, merged);
      setValues(merged);
    },
    [gender],
  );

  const clearValues = useCallback(() => {
    writeSessionValues(gender, {});
    setValues({});
  }, [gender]);

  const measurementValues = useMemo(() => values, [values]);

  return {
    profile,
    values: measurementValues,
    updateValues,
    clearValues,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}

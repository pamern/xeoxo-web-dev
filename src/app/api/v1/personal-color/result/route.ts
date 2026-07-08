import type { NextRequest } from "next/server";
import { getCartOwner } from "@/features/cart/cart-server.service";
import { SEASON_DESCRIPTION } from "@/features/personal-color/color-classification";
import {
  getPersonalColorPalette,
  getPersonalColorProducts,
  savePersonalColorResult,
} from "@/features/personal-color/personal-color.service";
import type { Season } from "@/features/personal-color/personal-color-quiz";
import { fail, ok } from "@/lib/api-response";
import { personalColorResultSchema } from "@/validations/personal-color/personal-color-result.schema";

const VALID_SEASONS: Season[] = ["SPRING", "SUMMER", "AUTUMN", "WINTER"];

function isValidSeason(value: string | null): value is Season {
  return value !== null && (VALID_SEASONS as string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const season = request.nextUrl.searchParams.get("season");

  if (!isValidSeason(season)) {
    return fail("Season không hợp lệ.", 400);
  }

  try {
    const [palette, products] = await Promise.all([
      getPersonalColorPalette(season),
      getPersonalColorProducts(season, 4),
    ]);

    return ok(
      { palette, products, description: SEASON_DESCRIPTION[season] },
      "Lấy bảng màu personal color thành công.",
    );
  } catch (error) {
    return fail(
      "Không thể tải bảng màu personal color.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = personalColorResultSchema.safeParse(await request.json());

    if (!parsed.success) {
      return fail("Dữ liệu kết quả personal color không hợp lệ.", 422, {
        issues: parsed.error.issues,
      });
    }

    const { temperature, value, season } = parsed.data;
    const [owner, palette, products] = await Promise.all([
      getCartOwner(),
      getPersonalColorPalette(season),
      getPersonalColorProducts(season, 4),
    ]);
    const { resultId } = await savePersonalColorResult({
      owner,
      temperature,
      value,
      season,
      palette,
    });

    return ok(
      {
        resultId,
        palette,
        products,
        description: SEASON_DESCRIPTION[season],
      },
      "Lưu kết quả personal color thành công.",
      201,
    );
  } catch (error) {
    return fail(
      "Không thể lưu kết quả personal color.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}

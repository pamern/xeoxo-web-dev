import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    // 1. Authenticate customer
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return fail("Bạn cần đăng nhập để tải lên tệp tin.", 401);
    }

    const { data: customer, error: custErr } = await admin
      .schema("iam")
      .from("customer")
      .select("customer_id")
      .eq("account_id", user.id)
      .maybeSingle();

    if (custErr) throw new Error(custErr.message);
    if (!customer) {
      return fail("Khách hàng không tồn tại.", 404);
    }

    const customerId = Number(customer.customer_id);

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return fail("Không tìm thấy tệp tin để tải lên.", 400);
    }

    // 3. Validate file
    const mimeType = file.type;
    const fileSize = file.size;
    let mediaType: "IMAGE" | "VIDEO" = "IMAGE";

    if (mimeType.startsWith("image/")) {
      mediaType = "IMAGE";
      // Max 5MB for images
      if (fileSize > 5 * 1024 * 1024) {
        return fail("Kích thước ảnh tối đa là 5MB.", 400);
      }
    } else if (mimeType.startsWith("video/")) {
      mediaType = "VIDEO";
      // Max 20MB for videos
      if (fileSize > 20 * 1024 * 1024) {
        return fail("Kích thước video tối đa là 20MB.", 400);
      }
    } else {
      return fail("Định dạng tệp không được hỗ trợ. Chỉ cho phép ảnh hoặc video.", 400);
    }

    // 4. Generate unique storage path
    const extension = file.name.split(".").pop() || "";
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const storageKey = `reviews/${customerId}/${uniqueId}.${extension}`;
    const bucketName = "product-media";

    // 5. Upload to Supabase Storage using admin client
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await admin.storage
      .from(bucketName)
      .upload(storageKey, buffer, {
        contentType: mimeType,
        duplex: "half", // Required for node-fetch/Next.js request streaming
      } as any);

    if (uploadError) {
      console.error("Lỗi tải lên Supabase Storage:", uploadError);
      return fail("Không thể lưu trữ tệp tin.", 500, uploadError);
    }

    // 6. Insert metadata into catalog.media
    const { data: mediaRecord, error: mediaError } = await admin
      .schema("catalog")
      .from("media")
      .insert({
        storage_key: storageKey,
        bucket_name: bucketName,
        media_type: mediaType,
        mime_type: mimeType,
        file_size: fileSize,
        alt_text: `Review media for customer ${customerId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("media_id")
      .single();

    if (mediaError) {
      // Clean up uploaded file if DB insert fails
      await admin.storage.from(bucketName).remove([storageKey]);
      console.error("Lỗi insert catalog.media:", mediaError);
      return fail("Không thể tạo bản ghi tệp tin.", 500, mediaError);
    }

    // 7. Get public URL
    const { data: { publicUrl } } = admin.storage
      .from(bucketName)
      .getPublicUrl(storageKey);

    return ok(
      {
        media_id: Number(mediaRecord.media_id),
        storage_key: storageKey,
        public_url: publicUrl,
        media_type: mediaType,
      },
      "Tải lên tệp tin thành công."
    );
  } catch (error: any) {
    console.error("[reviews/media/POST]", error);
    return fail(
      "Đã xảy ra lỗi khi tải lên tệp tin.",
      500,
      error instanceof Error ? error.message : error
    );
  }
}

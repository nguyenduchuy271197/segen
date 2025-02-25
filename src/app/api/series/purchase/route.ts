import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Kiểm tra người dùng đã đăng nhập
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { seriesId, episodeId } = await request.json();

    if (!seriesId) {
      return NextResponse.json(
        { error: "Series ID is required" },
        { status: 400 }
      );
    }

    // Lấy thông tin series để biết giá
    const { data: series, error: seriesError } = await supabase
      .from("series")
      .select("price, title, user_id")
      .eq("id", seriesId)
      .single();

    if (seriesError || !series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    // Kiểm tra xem người dùng có phải chủ sở hữu không
    if (series.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot purchase your own series" },
        { status: 400 }
      );
    }

    // Kiểm tra xem đã mua chưa
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select()
      .eq("user_id", user.id)
      .eq("series_id", seriesId)
      .eq("status", "completed")
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json(
        { message: "Already purchased", purchase: existingPurchase },
        { status: 200 }
      );
    }

    // Trong thực tế, bạn sẽ tích hợp với cổng thanh toán tại đây
    // Ví dụ: Stripe, PayPal, VNPay, MOMO, v.v.
    // Tạo payment intent và trả về client_secret để client hoàn tất thanh toán

    // Ở đây, chúng ta giả định thanh toán thành công và tạo bản ghi
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: user.id,
        series_id: seriesId,
        episode_id: episodeId || null,
        amount: series.price || 0,
        status: "completed", // Trong thực tế, ban đầu sẽ là 'pending'
      })
      .select()
      .single();

    if (purchaseError) {
      return NextResponse.json(
        { error: "Failed to create purchase" },
        { status: 500 }
      );
    }

    // Trong trường hợp thực tế, tại đây bạn sẽ chuyển hướng người dùng đến trang thanh toán
    // Sau khi thanh toán thành công, bạn sẽ cập nhật trạng thái purchase thành 'completed'

    return NextResponse.json({
      message: "Purchase successful",
      purchase,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}

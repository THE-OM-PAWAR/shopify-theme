import { NextRequest, NextResponse } from "next/server";

// force runtime (fixes NEXT_STATIC_GEN_BAILOUT)
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();

    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN; // ❌ not NEXT_PUBLIC
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      return NextResponse.json(
        { error: "Shopify credentials are missing" },
        { status: 500 }
      );
    }

    // Build order payload
    const shopifyOrder = {
      order: {
        email: orderData.email,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address || orderData.shipping_address,
        line_items: orderData.line_items,
        note: orderData.note,
        tags: orderData.tags,
        currency: "INR",
        source_name: "custom-nextjs-storefront",
      },
    };

    const response = await fetch(
      `https://${shopifyDomain}/admin/api/2025-07/orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify(shopifyOrder),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to create order in Shopify",
          details: result.errors || result,
        },
        { status: response.status }
      );
    }

    const order = result.order;
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        number: order.order_number || order.name,
        total: order.total_price,
        currency: order.currency,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();
    console.log('Received order data:', orderData);

    // Validate required fields
    if (!orderData.email || !orderData.shipping_address || !orderData.line_items) {
      return NextResponse.json(
        { error: "Missing required order data" },
        { status: 400 }
      );
    }

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      console.error('Missing Shopify credentials:', { 
        domain: !!shopifyDomain, 
        token: !!accessToken 
      });
      return NextResponse.json(
        { error: "Shopify credentials are missing" },
        { status: 500 }
      );
    }

    // Build the Shopify order payload
    const shopifyOrder = {
      order: {
        email: orderData.email,
        shipping_address: {
          first_name: orderData.shipping_address.first_name,
          last_name: orderData.shipping_address.last_name,
          address1: orderData.shipping_address.address1,
          address2: orderData.shipping_address.address2 || "",
          city: orderData.shipping_address.city,
          province: orderData.shipping_address.province,
          zip: orderData.shipping_address.zip,
          country: orderData.shipping_address.country,
          phone: orderData.shipping_address.phone,
        },
        billing_address: orderData.billing_address || orderData.shipping_address,
        line_items: orderData.line_items.map((item: any) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        })),
        financial_status: "pending", // COD orders start as pending
        fulfillment_status: "unfulfilled",
        tags: "payment_method:cod,source:nextjs-storefront",
        note: "Payment Method: Cash on Delivery (COD)",
        currency: "INR",
        source_name: "nextjs-storefront",
        processing_method: "manual",
        // Add shipping lines if provided
        ...(orderData.shipping_lines && orderData.shipping_lines.length > 0 && {
          shipping_lines: orderData.shipping_lines
        }),
        // Add tax lines if provided
        ...(orderData.total_tax && parseFloat(orderData.total_tax) > 0 && {
          tax_lines: [{
            title: "Tax",
            price: orderData.total_tax,
            rate: 0.1
          }]
        })
      },
    };

    console.log('Sending to Shopify:', JSON.stringify(shopifyOrder, null, 2));

    const response = await fetch(
      `https://${shopifyDomain}/admin/api/2024-01/orders.json`,
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
    console.log('Shopify response:', result);

    if (!response.ok) {
      console.error('Shopify API error:', result);
      return NextResponse.json(
        {
          error: "Failed to create order in Shopify",
          details: result.errors || result,
          status: response.status
        },
        { status: response.status }
      );
    }

    const order = result.order;
    
    // Return success response
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number || order.name,
        total_price: order.total_price,
        currency: order.currency,
        created_at: order.created_at,
        financial_status: order.financial_status,
        fulfillment_status: order.fulfillment_status,
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
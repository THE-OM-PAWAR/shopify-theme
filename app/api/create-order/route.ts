import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    if (!orderData.email || !orderData.shipping_address || !orderData.line_items || orderData.line_items.length === 0) {
      return NextResponse.json({ error: 'Missing required order data' }, { status: 400 });
    }

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const shipMozoApiKey = process.env.SHIPMOZO_API_KEY;

    if (!shopifyDomain || !accessToken) {
      return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
    }

    // 1. Create order in Shopify
    const shopifyOrder = await createShopifyOrder(orderData, shopifyDomain, accessToken);
    
    if (!shopifyOrder) {
      return NextResponse.json({ error: 'Failed to create order in Shopify' }, { status: 500 });
    }

    // 2. Create shipment in ShipMozo if available
    let shipment = null;
    if (shipMozoApiKey && shopifyOrder.id) {
      shipment = await createShipMozoShipment(shopifyOrder, shipMozoApiKey);
    }

    // 3. Return success response with order details
    return NextResponse.json({
      success: true,
      order: {
        id: shopifyOrder.id,
        order_number: shopifyOrder.name,
        total_price: shopifyOrder.total_price,
        currency: shopifyOrder.currency,
        status: shopifyOrder.financial_status,
        fulfillment_status: shopifyOrder.fulfillment_status || 'unfulfilled',
        shipping_address: shopifyOrder.shipping_address,
        shipment: shipment,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Create order in Shopify
async function createShopifyOrder(orderData: any, shopifyDomain: string, accessToken: string) {
  try {
    // Format the order data for Shopify API
    const shopifyOrderData = {
      order: {
        email: orderData.email,
        fulfillment_status: 'unfulfilled',
        send_receipt: true,
        send_fulfillment_receipt: true,
        line_items: orderData.line_items.map((item: any) => ({
          variant_id: parseInt(item.variant_id),
          quantity: item.quantity,
          price: item.price,
        })),
        shipping_address: {
          first_name: orderData.shipping_address.first_name,
          last_name: orderData.shipping_address.last_name,
          address1: orderData.shipping_address.address1,
          address2: orderData.shipping_address.address2 || '',
          city: orderData.shipping_address.city,
          province: orderData.shipping_address.province,
          zip: orderData.shipping_address.zip,
          country: orderData.shipping_address.country,
          phone: orderData.shipping_address.phone,
        },
        billing_address: orderData.billing_address || orderData.shipping_address,
        shipping_lines: orderData.shipping_lines || [
          {
            title: 'Standard Shipping',
            price: '0.00',
            code: 'standard',
          },
        ],
        tags: 'website-order',
        note: `Payment Method: ${orderData.payment_method || 'COD'}`,
      },
    };

    // If payment details are available, add them to the order
    if (orderData.payment_details) {
      (shopifyOrderData.order as any).transactions = [
        {
          kind: 'sale',
          status: 'success',
          amount: orderData.total_price,
          gateway: 'razorpay',
          payment_details: {
            credit_card_number: 'XXXX',
            credit_card_company: 'Razorpay',
          },
        },
      ];
    }

    // Create the order in Shopify
    const response = await fetch(`https://${shopifyDomain}/admin/api/2024-01/orders.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify(shopifyOrderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Shopify order creation error:', errorData);
      throw new Error(`Shopify API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result.order;
  } catch (error) {
    console.error('Error creating Shopify order:', error);
    throw error;
  }
}

// Create shipment in ShipMozo
async function createShipMozoShipment(order: any, apiKey: string) {
  try {
    // Format shipment data for ShipMozo API
    const shipmentData = {
      order_id: order.id,
      order_number: order.name,
      shipping_address: {
        name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
        address1: order.shipping_address.address1,
        address2: order.shipping_address.address2 || '',
        city: order.shipping_address.city,
        state: order.shipping_address.province,
        pincode: order.shipping_address.zip,
        country: order.shipping_address.country,
        phone: order.shipping_address.phone,
        email: order.email,
      },
      items: order.line_items.map((item: any) => ({
        name: item.name,
        sku: item.sku || '',
        quantity: item.quantity,
        price: item.price,
      })),
      payment_method: order.note?.includes('COD') ? 'cod' : 'prepaid',
      total_amount: parseFloat(order.total_price),
    };

    // Create shipment in ShipMozo
    const response = await fetch('https://api.shipmozo.com/v1/shipments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(shipmentData),
    });

    if (!response.ok) {
      console.error('ShipMozo API error:', response.status);
      return null;
    }

    const result = await response.json();
    return {
      id: result.id,
      tracking_number: result.tracking_number,
      tracking_url: result.tracking_url,
      label_url: result.label_url,
      status: result.status,
    };
  } catch (error) {
    console.error('Error creating ShipMozo shipment:', error);
    return null;
  }
}
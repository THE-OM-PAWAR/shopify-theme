import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const refreshType = searchParams.get('type') || 'all'; // 'all', 'products', 'collections', 'store'

    console.log('🔄 Refresh request received:', { productId, refreshType });

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      return NextResponse.json({ 
        error: 'Shopify credentials not configured' 
      }, { status: 500 });
    }

    const refreshResults: any = {
      timestamp: new Date().toISOString(),
      refreshed: [],
      errors: []
    };

    // Refresh products
    if (refreshType === 'all' || refreshType === 'products') {
      try {
        const productsResponse = await fetch(
          `https://${shopifyDomain}/admin/api/2024-01/products.json?limit=250`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
            },
          }
        );

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          refreshResults.refreshed.push({
            type: 'products',
            count: productsData.products?.length || 0
          });
          console.log(`✅ Refreshed ${productsData.products?.length || 0} products`);
        } else {
          refreshResults.errors.push({
            type: 'products',
            error: `HTTP ${productsResponse.status}`
          });
        }
      } catch (error) {
        refreshResults.errors.push({
          type: 'products',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Refresh collections
    if (refreshType === 'all' || refreshType === 'collections') {
      try {
        const collectionsResponse = await fetch(
          `https://${shopifyDomain}/admin/api/2024-01/collections.json?limit=250`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
            },
          }
        );

        if (collectionsResponse.ok) {
          const collectionsData = await collectionsResponse.json();
          refreshResults.refreshed.push({
            type: 'collections',
            count: collectionsData.collections?.length || 0
          });
          console.log(`✅ Refreshed ${collectionsData.collections?.length || 0} collections`);
        } else {
          refreshResults.errors.push({
            type: 'collections',
            error: `HTTP ${collectionsResponse.status}`
          });
        }
      } catch (error) {
        refreshResults.errors.push({
          type: 'collections',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Refresh specific product if productId is provided
    if (productId) {
      try {
        const productResponse = await fetch(
          `https://${shopifyDomain}/admin/api/2024-01/products/${productId}.json`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
            },
          }
        );

        if (productResponse.ok) {
          const productData = await productResponse.json();
          refreshResults.refreshed.push({
            type: 'product',
            id: productId,
            title: productData.product?.title
          });
          console.log(`✅ Refreshed product: ${productData.product?.title}`);
        } else {
          refreshResults.errors.push({
            type: 'product',
            id: productId,
            error: `HTTP ${productResponse.status}`
          });
        }
      } catch (error) {
        refreshResults.errors.push({
          type: 'product',
          id: productId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Refresh store information
    if (refreshType === 'all' || refreshType === 'store') {
      try {
        const shopResponse = await fetch(
          `https://${shopifyDomain}/admin/api/2024-01/shop.json`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
            },
          }
        );

        if (shopResponse.ok) {
          const shopData = await shopResponse.json();
          refreshResults.refreshed.push({
            type: 'store',
            name: shopData.shop?.name
          });
          console.log(`✅ Refreshed store: ${shopData.shop?.name}`);
        } else {
          refreshResults.errors.push({
            type: 'store',
            error: `HTTP ${shopResponse.status}`
          });
        }
      } catch (error) {
        refreshResults.errors.push({
          type: 'store',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const hasErrors = refreshResults.errors.length > 0;
    const statusCode = hasErrors ? 207 : 200; // 207 = Multi-Status (partial success)

    return NextResponse.json({
      success: !hasErrors,
      message: hasErrors ? 'Partial refresh completed with errors' : 'Refresh completed successfully',
      ...refreshResults
    }, { status: statusCode });

  } catch (error) {
    console.error('❌ Refresh API error:', error);
    return NextResponse.json({ 
      error: 'Failed to refresh data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint for manual refresh triggers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, refreshType = 'all', forceRefresh = false } = body;

    console.log('🔄 Manual refresh request:', { productId, refreshType, forceRefresh });

    // If forceRefresh is true, clear all caches
    if (forceRefresh) {
      console.log('🧹 Force refresh - clearing all caches');
      // This would typically clear server-side caches
      // For now, we'll just log it
    }

    // Call the GET endpoint logic
    const url = new URL(request.url);
    if (productId) url.searchParams.set('productId', productId);
    if (refreshType) url.searchParams.set('type', refreshType);

    const getRequest = new NextRequest(url.toString());
    return await GET(getRequest);

  } catch (error) {
    console.error('❌ Manual refresh error:', error);
    return NextResponse.json({ 
      error: 'Failed to trigger manual refresh',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

# Customer Creation Error Debugging Guide

## Problem: "Failed to create customer" Error

This guide will help you troubleshoot and fix the customer creation error in your Shopify integration.

## Quick Fix Checklist

### 1. Environment Variables Setup
First, make sure you have the correct environment variables set up:

1. **Create a `.env.local` file** in your project root with the following variables:
```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-shopify-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
SHOPIFY_ADMIN_ACCESS_TOKEN=your-admin-access-token
NEXT_PUBLIC_STORE_NAME=Your Store Name
```

2. **Get your Shopify credentials:**
   - **Store Domain**: Your Shopify store URL (e.g., `mystore.myshopify.com`)
   - **Storefront Access Token**: 
     - Go to Shopify Admin → Apps → App and sales channel settings
     - Click "Develop apps" → "Create an app"
     - Go to "Storefront API" tab
     - Copy the access token
   - **Admin Access Token**:
     - In the same app, go to "Admin API" tab
     - Enable required permissions (Customer access)
     - Copy the access token

### 2. Check Server Logs
The updated code now provides detailed logging. Check your server console for:

- `Registration request received:` - Shows the data being processed
- `Creating customer with data:` - Shows customer data
- `Shopify Domain: Set/Missing` - Confirms environment variables
- `Access Token: Set/Missing` - Confirms environment variables
- `Shopify API response status:` - Shows HTTP response code
- `Shopify API response:` - Shows full API response

### 3. Common Error Scenarios

#### Scenario 1: Missing Environment Variables
**Error**: "Shopify credentials are not configured properly"
**Solution**: Set up your `.env.local` file with correct credentials

#### Scenario 2: Invalid Shopify Credentials
**Error**: "Shopify API Error (401): Unauthorized"
**Solution**: 
- Verify your access tokens are correct
- Check if tokens have expired
- Ensure Admin API has customer creation permissions

#### Scenario 3: Duplicate Email
**Error**: "Shopify API Error: Email has already been taken"
**Solution**: 
- Customer with this email already exists
- Check if you're trying to create duplicate accounts

#### Scenario 4: Invalid Store Domain
**Error**: "Shopify API Error (404): Not Found"
**Solution**: 
- Verify your store domain is correct
- Ensure it includes `.myshopify.com`

### 4. Testing the Fix

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Try creating a customer** through your registration form

3. **Check the server console** for detailed logs

4. **Check the browser network tab** for API response details

### 5. Advanced Debugging

If the issue persists, check:

1. **Shopify API Version**: The code uses `2024-01` API version
2. **Permissions**: Ensure your Admin API token has customer creation permissions
3. **Rate Limits**: Check if you're hitting Shopify API rate limits
4. **Network Issues**: Verify your server can reach Shopify APIs

### 6. Alternative Customer Creation Method

If the Admin API continues to fail, you can use the Storefront API method in `lib/shopify-customer.ts`:

```typescript
import { createCustomer } from '@/lib/shopify-customer';

// Use the GraphQL-based customer creation
const customer = await createCustomer({
  email,
  firstName,
  lastName,
  phone,
  // ... other fields
});
```

## Next Steps

1. Set up your environment variables
2. Test customer creation
3. Check server logs for specific error messages
4. If issues persist, share the specific error messages from the logs

The updated code now provides much more detailed error information, making it easier to identify and fix the root cause of the customer creation failure.

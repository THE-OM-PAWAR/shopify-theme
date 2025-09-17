// Customer management utilities for Shopify integration
export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  defaultAddress?: {
    id: string;
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    phone?: string;
  };
  addresses: Array<{
    id: string;
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    phone?: string;
  }>;
  ordersCount: number;
  totalSpent: string;
}

export interface CustomerFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
}

// Client-side Shopify fetch function for customer operations
const shopifyFetchClient = async ({ query, variables = {} }: { query: string; variables?: any }) => {
  const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('Shopify GraphQL errors:', result.errors);
      throw new Error('GraphQL errors occurred');
    }

    return { data: result.data };
  } catch (error) {
    console.error('Shopify Customer API Error:', error);
    throw error;
  }
};

// GraphQL queries for customer operations
export const CUSTOMER_CREATE_MUTATION = `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
        phone
        defaultAddress {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          zip
          country
          phone
        }
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

export const CUSTOMER_QUERY = `
  query Customer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
      defaultAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      addresses(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            address1
            address2
            city
            province
            zip
            country
            phone
          }
        }
      }
      orders(first: 10) {
        totalCount
      }
    }
  }
`;

export const CUSTOMER_UPDATE_MUTATION = `
  mutation CustomerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        email
        firstName
        lastName
        phone
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_CREATE_MUTATION = `
  mutation CustomerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

// Customer service functions
export const createCustomer = async (customerData: CustomerFormData): Promise<ShopifyCustomer | null> => {
  try {
    const response = await shopifyFetchClient({
      query: CUSTOMER_CREATE_MUTATION,
      variables: {
        input: {
          email: customerData.email,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
          password: generateTemporaryPassword(), // Generate a temporary password
          acceptsMarketing: false,
        }
      }
    });

    if (response.data?.customerCreate?.customer) {
      const customer = response.data.customerCreate.customer;
      
      // Create default address if provided
      if (customerData.address1) {
        await createCustomerAddress(customer.id, {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          address1: customerData.address1,
          address2: customerData.address2,
          city: customerData.city,
          province: customerData.province,
          zip: customerData.zip,
          country: customerData.country,
          phone: customerData.phone,
        });
      }

      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        addresses: [],
        ordersCount: 0,
        totalSpent: '0.00',
      };
    } else if (response.data?.customerCreate?.customerUserErrors?.length > 0) {
      const errors = response.data.customerCreate.customerUserErrors;
      throw new Error(errors[0].message);
    }

    return null;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const getCustomerAccessToken = async (email: string, password: string): Promise<string | null> => {
  try {
    const response = await shopifyFetchClient({
      query: CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
      variables: {
        input: {
          email,
          password,
        }
      }
    });

    if (response.data?.customerAccessTokenCreate?.customerAccessToken) {
      return response.data.customerAccessTokenCreate.customerAccessToken.accessToken;
    } else if (response.data?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
      const errors = response.data.customerAccessTokenCreate.customerUserErrors;
      throw new Error(errors[0].message);
    }

    return null;
  } catch (error) {
    console.error('Error getting customer access token:', error);
    throw error;
  }
};

export const getCustomer = async (accessToken: string): Promise<ShopifyCustomer | null> => {
  try {
    const response = await shopifyFetchClient({
      query: CUSTOMER_QUERY,
      variables: {
        customerAccessToken: accessToken,
      }
    });

    if (response.data?.customer) {
      const customer = response.data.customer;
      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        defaultAddress: customer.defaultAddress,
        addresses: customer.addresses.edges.map((edge: any) => edge.node),
        ordersCount: customer.orders.totalCount,
        totalSpent: '0.00', // This would need to be calculated from orders
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
};

export const createCustomerAddress = async (customerId: string, addressData: any): Promise<any> => {
  // This would typically require admin API access
  // For now, we'll handle this in the order creation process
  return null;
};

// Utility functions
const generateTemporaryPassword = (): string => {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
};

// Local storage utilities for customer data
export const saveCustomerToLocal = (customer: ShopifyCustomer, accessToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('shopify_customer', JSON.stringify(customer));
    localStorage.setItem('shopify_customer_token', accessToken);
  }
};

export const getCustomerFromLocal = (): { customer: ShopifyCustomer | null; accessToken: string | null } => {
  if (typeof window !== 'undefined') {
    const customerData = localStorage.getItem('shopify_customer');
    const accessToken = localStorage.getItem('shopify_customer_token');
    
    return {
      customer: customerData ? JSON.parse(customerData) : null,
      accessToken,
    };
  }
  
  return { customer: null, accessToken: null };
};

export const clearCustomerFromLocal = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('shopify_customer');
    localStorage.removeItem('shopify_customer_token');
  }
};
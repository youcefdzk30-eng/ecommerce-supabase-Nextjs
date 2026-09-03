'use server'

import { Polar } from '@polar-sh/sdk'
import { createServerSupabase, getAuthenticatedUser } from '@/lib/supabase/server'
import { ProductType } from '@/types'

const polarAccessToken = process.env.POLAR_ACCESS_TOKEN?.trim()
const polarServer = process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox'

const polar = polarAccessToken
	? new Polar({
			accessToken: polarAccessToken,
			server: polarServer,
		})
	: null

/**
 * Get an existing Polar product for e-commerce checkouts
 * Uses POLAR_PRODUCT_ID if set, otherwise finds the first non-archived product
 */
async function getPolarProduct(): Promise<string> {
	// If product ID is explicitly provided, use it
	const productId = process.env.POLAR_PRODUCT_ID
	if (productId) {
		return productId
	}

	if (!polar) {
		throw new Error('POLAR_ACCESS_TOKEN is missing. Add a valid Polar token to .env.local and restart Next.js.')
	}

	// Otherwise, list existing products and find one
	// When using organization token, don't pass organizationId
	const organizationId = process.env.POLAR_ORG_ID
	const listParams = organizationId ? { organizationId } : {}

	try {
		const productsIterator = await polar.products.list(listParams)

		// Iterate through pages to find first non-archived product
		for await (const page of productsIterator) {
			if (page?.result?.items) {
				const product = page.result.items.find(
					(p: { isArchived?: boolean; id?: string }) => !p.isArchived
				)

				if (product?.id) {
					return product.id
				}
			}
		}

		throw new Error('No active Polar products found. Please create a product in Polar or set POLAR_PRODUCT_ID environment variable.')
	} catch (error) {
		console.error('Error getting Polar product:', error)
		throw new Error(`Failed to get Polar product: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}

export async function createPolarCheckout(orderInfo?: {
  deliveryType?: string;
  recipientName?: string;
  phone?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  governorate?: string;
  municipality?: string;
}) {
	try {
		if (!polar) {
			throw new Error('Polar is not configured. Set POLAR_ACCESS_TOKEN in .env.local and restart the dev server.')
		}

		// Get authenticated user
		const user = await getAuthenticatedUser()
		if (!user) {
			throw new Error('Unauthorized')
		}

		// Get Supabase client
		const supabase = await createServerSupabase()

		let userCartQuery = supabase
			.from('carts')
			.select('*')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })

		let { data: carts, error: cartsError } = await userCartQuery

		let cart = carts?.find((entry) => entry.status === 'active') ?? carts?.[0] ?? null

		if (!cart && (!cartsError || cartsError.code !== '42P01')) {
			const { data: insertedCart, error: insertError } = await supabase
				.from('carts')
				.insert({ user_id: user.id, status: 'active' })
				.select('*')
				.maybeSingle()

			if (!insertError && insertedCart) {
				cart = insertedCart
			}
		}

		if (!cart) {
			throw new Error('No active cart found')
		}

		const { data: cartItems, error: itemsError } = await supabase
			.from('cart_items')
			.select('*')
			.eq('cart_id', cart.id)

		if (itemsError) {
			throw new Error(`Unable to load cart items: ${itemsError.message}`)
		}

		if (!cartItems || cartItems.length === 0) {
			throw new Error('Cart is empty')
		}

		// Get existing Polar product
		const polarProductId = await getPolarProduct()

		// Calculate total amount for all cart items
		let totalAmountInCents = 0
		const cartItemsData: Array<{
			product_id: string
			quantity: number
			price: number
			product_title: string
		}> = []

		for (const item of cartItems) {
			const productId = item.product_id
			const product = item.product as ProductType | null | undefined
			const itemTotalInCents = Math.round(item.price * item.quantity * 100)
			totalAmountInCents += itemTotalInCents

			cartItemsData.push({
				product_id: productId,
				quantity: item.quantity,
				price: item.price,
				product_title: product?.title || '',
			})
		}

		// Build ad-hoc prices object for Polar
		// Polar only allows ONE static price per product, so we combine all items into a single total
		// Store individual cart items in metadata as JSON for webhook processing
		const prices: Record<string, Array<{
			amountType: 'fixed'
			priceAmount: number
			priceCurrency: string
			metadata?: Record<string, string>
		}>> = {}

		// Insert order record (if orders table exists) so admin can see details immediately
		try {
			const itemsForOrder = cartItems.map((item: any) => ({
				product_id: item.product_id,
				product_title: item.product_title || null,
				quantity: item.quantity,
				price: item.price,
			}));

			const totalAmount = cartItems.reduce((acc: number, it: any) => acc + Number(it.price) * Number(it.quantity), 0);

			const { error: orderError } = await supabase
				.from('orders')
				.insert([
					{
						user_id: user.id,
						cart_id: cart.id,
						status: 'pending_payment',
						delivery_type: orderInfo?.deliveryType || 'home',
						recipient_name: orderInfo?.recipientName || null,
						phone: orderInfo?.phone || null,
						address_line: orderInfo?.addressLine || null,
						city: orderInfo?.city || null,
						state: orderInfo?.state || orderInfo?.governorate || null,
						postal_code: orderInfo?.postalCode || null,
						country: orderInfo?.country || null,
						municipality: orderInfo?.municipality || null,
						items: itemsForOrder,
						total_amount: totalAmount,
					},
				])
				.select('*')
				.maybeSingle();

			if (orderError) {
				console.warn('Order insert failed (orders table might be missing):', orderError);
			}
		} catch (e) {
			console.warn('Order insert threw:', e);
		}

		// Single price entry with total amount and all items in metadata
		prices[polarProductId] = [{
			amountType: 'fixed' as const,
			priceAmount: totalAmountInCents,
			priceCurrency: 'usd' as const,
			metadata: {
				cart_items: JSON.stringify(cartItemsData),
				total_items: cartItems.length.toString(),
				delivery: JSON.stringify(orderInfo || {}),
			},
		}]

		// Get base URL for redirect URLs
		const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

		// Create Polar checkout session
		// Use the single Polar product ID with multiple price entries
		const checkout = await polar.checkouts.create({
			products: [polarProductId], // Single Polar product ID
			prices: prices as Parameters<typeof polar.checkouts.create>[0]['prices'],
			externalCustomerId: user.id, // Map to Supabase user ID
			successUrl: `${baseUrl}/checkout/success?checkout_id={CHECKOUT_ID}`,
			customerEmail: user.email || undefined,
		})

		if (!checkout.url) {
			throw new Error('Failed to create checkout session')
		}

		return {
			success: true,
			checkoutUrl: checkout.url,
			checkoutId: checkout.id,
		}
	} catch (error) {
		console.error('Error creating Polar checkout:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Internal server error',
		}
	}
}

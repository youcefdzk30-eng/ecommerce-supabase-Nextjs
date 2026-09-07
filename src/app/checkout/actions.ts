'use server'

import { createServerSupabase, getAuthenticatedUser } from '@/lib/supabase/server'

export async function createCashOnDeliveryOrder(orderInfo?: {
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
			.select('*, product:products(title)')
			.eq('cart_id', cart.id)

		if (itemsError) {
			throw new Error(`Unable to load cart items: ${itemsError.message}`)
		}

		if (!cartItems || cartItems.length === 0) {
			throw new Error('Cart is empty')
		}

		const itemsForOrder = cartItems.map((item: Record<string, unknown>) => ({
			product_id: item.product_id,
			product_title:
				item.product_title ||
				(item.product as { title?: string } | null)?.title ||
				null,
			quantity: item.quantity,
			price: item.price,
		}))
		const totalAmount = cartItems.reduce(
			(acc: number, item: Record<string, unknown>) =>
				acc + Number(item.price) * Number(item.quantity),
			0,
		)

		const { data: order, error: orderError } = await supabase
			.from('orders')
			.insert({
				user_id: user.id,
				cart_id: cart.id,
				status: 'pending',
				payment_method: 'cash_on_delivery',
				delivery_type: orderInfo?.deliveryType || 'home',
				recipient_name: orderInfo?.recipientName || null,
				phone: orderInfo?.phone || null,
				address_line: orderInfo?.addressLine || null,
				city: orderInfo?.city || null,
				state: orderInfo?.state || orderInfo?.governorate || null,
				postal_code: orderInfo?.postalCode || null,
				country: orderInfo?.country || 'Algeria',
				municipality: orderInfo?.municipality || null,
				items: itemsForOrder,
				total_amount: totalAmount,
			})
			.select('id')
			.single()

		if (orderError || !order) {
			throw new Error(orderError?.message || 'تعذر حفظ الطلب')
		}

		const { error: clearError } = await supabase
			.from('cart_items')
			.delete()
			.eq('cart_id', cart.id)

		if (clearError) {
			throw new Error(`تم حفظ الطلب لكن تعذر تفريغ السلة: ${clearError.message}`)
		}

		return {
			success: true,
			orderId: order.id,
		}
	} catch (error) {
		console.error('Error creating cash-on-delivery order:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Internal server error',
		}
	}
}

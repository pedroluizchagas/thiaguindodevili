import { NextResponse } from "next/server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/server"
import {
  ACCOMPANIMENT_OPTIONS,
  BEVERAGE_OPTIONS,
  CALCULATION_DEFAULTS,
  MEAT_OPTIONS,
  SERVICE_OPTIONS,
} from "@/lib/constants/builder"

const CreateOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    whatsapp: z.string().trim().min(8).max(30),
    address: z.string().trim().min(5).max(250),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  selection: z.object({
    guests: z.number().int(),
    meatId: z.string().min(1),
    beverages: z.array(z.object({ id: z.string().min(1), quantity: z.number().int().min(0).max(500) })).default([]),
    services: z.array(z.string().min(1)).default([]),
    accompaniments: z.array(z.string().min(1)).default([]),
  }),
})

function clampGuests(guests: number) {
  return Math.max(CALCULATION_DEFAULTS.minGuests, Math.min(CALCULATION_DEFAULTS.maxGuests, guests))
}

function splitAddress(rawAddress: string) {
  const parts = rawAddress
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)

  if (parts.length >= 3) {
    return { deliveryAddress: parts.slice(0, -1).join(", "), neighborhood: parts.at(-1) || null }
  }

  return { deliveryAddress: rawAddress.trim(), neighborhood: null }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = CreateOrderSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos para criar o agendamento." }, { status: 400 })
  }

  const { customer, selection } = parsed.data
  const guests = clampGuests(selection.guests)

  const meat = MEAT_OPTIONS.find((m) => m.id === selection.meatId)
  if (!meat) {
    return NextResponse.json({ error: "Kit de carne inválido." }, { status: 400 })
  }

  const beverages = selection.beverages.filter((b) => b.quantity > 0).map((b) => {
    const option = BEVERAGE_OPTIONS.find((o) => o.id === b.id)
    if (!option) return null
    return {
      id: option.id,
      name: option.name,
      category: option.category,
      quantity: b.quantity,
      pricePerUnit: option.pricePerUnit,
      total: Number((option.pricePerUnit * b.quantity).toFixed(2)),
    }
  })

  if (beverages.some((b) => b === null)) {
    return NextResponse.json({ error: "Bebida inválida." }, { status: 400 })
  }

  const services = selection.services.map((id) => {
    const option = SERVICE_OPTIONS.find((o) => o.id === id)
    if (!option) return null
    return { id: option.id, name: option.name, price: option.price }
  })

  if (services.some((s) => s === null)) {
    return NextResponse.json({ error: "Serviço inválido." }, { status: 400 })
  }

  const sides = selection.accompaniments.map((id) => {
    const option = ACCOMPANIMENT_OPTIONS.find((o) => o.id === id)
    if (!option) return null
    return { id: option.id, name: option.name, price: option.price }
  })

  if (sides.some((s) => s === null)) {
    return NextResponse.json({ error: "Acompanhamento inválido." }, { status: 400 })
  }

  const subtotal =
    meat.pricePerPerson * guests +
    (beverages as Array<NonNullable<(typeof beverages)[number]>>).reduce((sum, b) => sum + b.total, 0) +
    (services as Array<NonNullable<(typeof services)[number]>>).reduce((sum, s) => sum + s.price, 0) +
    (sides as Array<NonNullable<(typeof sides)[number]>>).reduce((sum, s) => sum + s.price, 0)

  const total = Number(subtotal.toFixed(2))
  const meatWeightKg = Number(((CALCULATION_DEFAULTS.meatPerPerson * guests) / 1000).toFixed(2))

  const { deliveryAddress, neighborhood } = splitAddress(customer.address)
  const phone = customer.whatsapp.replace(/\D/g, "") || customer.whatsapp.trim()

  const supabase = createAdminClient()

  const { data: existingCustomers, error: existingCustomerError } = await supabase
    .from("customers")
    .select("id, name, phone, address, neighborhood")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)

  if (existingCustomerError) {
    return NextResponse.json({ error: "Falha ao consultar cliente." }, { status: 500 })
  }

  const existingCustomer = existingCustomers?.[0] ?? null
  let customerId = existingCustomer?.id ?? null

  if (!customerId) {
    const { data: insertedCustomer, error: insertCustomerError } = await supabase
      .from("customers")
      .insert({
        name: customer.name,
        phone,
        address: deliveryAddress,
        neighborhood: neighborhood,
      })
      .select("id")
      .single()

    if (insertCustomerError || !insertedCustomer) {
      return NextResponse.json({ error: "Falha ao salvar cliente." }, { status: 500 })
    }

    customerId = insertedCustomer.id
  } else {
    const shouldUpdateCustomer =
      existingCustomer?.name !== customer.name || existingCustomer?.address !== deliveryAddress || existingCustomer?.neighborhood !== neighborhood

    if (shouldUpdateCustomer) {
      await supabase
        .from("customers")
        .update({ name: customer.name, address: deliveryAddress, neighborhood: neighborhood })
        .eq("id", customerId)
    }
  }

  const { data: insertedOrder, error: insertOrderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      guests_count: guests,
      meat_type: meat.name,
      meat_weight: meatWeightKg,
      beverages: beverages as Array<NonNullable<(typeof beverages)[number]>>,
      services: services as Array<NonNullable<(typeof services)[number]>>,
      sides: sides as Array<NonNullable<(typeof sides)[number]>>,
      subtotal: total,
      discount: 0,
      total: total,
      delivery_date: customer.date,
      delivery_time: customer.time,
      delivery_address: deliveryAddress,
      delivery_neighborhood: neighborhood,
      status: "new",
    })
    .select("id, order_number")
    .single()

  if (insertOrderError || !insertedOrder) {
    return NextResponse.json({ error: "Falha ao criar pedido." }, { status: 500 })
  }

  return NextResponse.json({ id: insertedOrder.id, orderNumber: insertedOrder.order_number }, { status: 201 })
}


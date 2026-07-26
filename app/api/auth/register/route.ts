import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name_uz, surname_uz, phone, address, latitude, longitude } = body

    if (!name_uz?.trim()) {
      return NextResponse.json({ error: "Ism kiritilmagan" }, { status: 400 })
    }

    if (!surname_uz?.trim()) {
      return NextResponse.json({ error: "Familya kiritilmagan" }, { status: 400 })
    }

    if (!phone?.trim()) {
      return NextResponse.json({ error: "Telefon raqam kiritilmagan" }, { status: 400 })
    }

    if (!address?.trim()) {
      return NextResponse.json({ error: "Manzil kiritilmagan" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: existingUser } = await supabase
      .from("users")
      .select("id, name_uz, surname_uz, phone, address, latitude, longitude, created_at")
      .eq("phone", phone)
      .single()

    if (existingUser) {
      return NextResponse.json({
        user: existingUser,
        message: "User already exists",
      })
    }

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          name_uz,
          surname_uz,
          phone,
          address,
          latitude,
          longitude,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Foydalanuvchi yaratishda xatolik" }, { status: 400 })
    }

    try {
      await supabase.from("admin_notifications").insert([
        {
          type: "new_registration",
          title: "Yangi foydalanuvchi ro'yxatdan o'tdi",
          message: `${name_uz} ${surname_uz} (${phone}) - ${address}`,
          user_id: newUser.id,
          is_read: false,
        },
      ])
    } catch (notifError) {
      // Notification error - non-critical
    }

    return NextResponse.json({
      user: {
        id: newUser.id,
        name_uz: newUser.name_uz,
        surname_uz: newUser.surname_uz,
        phone: newUser.phone,
        address: newUser.address,
        latitude: newUser.latitude,
        longitude: newUser.longitude,
        created_at: newUser.created_at,
      },
      message: "Registration successful",
    })
  } catch (error) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 })
  }
}

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { name, phone, address, latitude, longitude } = await request.json()

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (existingUser) {
      const { data, error } = await supabase
        .from("users")
        .update({
          name_uz: name,
          name_ru: name,
          surname_uz: "",
          surname_ru: "",
          address: address || null,
          latitude: latitude || null,
          longitude: longitude || null,
          updated_at: new Date().toISOString(),
        })
        .eq("phone", phone)
        .select()
        .maybeSingle()

      if (error) throw error
      return NextResponse.json({ success: true, data })
    } else {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            name_uz: name,
            name_ru: name,
            surname_uz: "",
            surname_ru: "",
            phone,
            address: address || null,
            latitude: latitude || null,
            longitude: longitude || null,
            is_active: true,
          },
        ])
        .select()
        .maybeSingle()

      if (error) throw error

      await supabase.from("admin_notifications").insert([
        {
          type: "registration",
          title: "Yangi foydalanuvchi ro'yxatdan o'tdi",
          message: `${name} (${phone}) ro'yxatdan o'tdi${address ? ` - ${address}` : ""}`,
        },
      ])

      return NextResponse.json({ success: true, data })
    }
  } catch (error: any) {
    console.error("[v0] Error in users API:", error)
    return NextResponse.json({ error: error.message || "Failed to save user" }, { status: 500 })
  }
}

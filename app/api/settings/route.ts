import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("store_settings").select("*").limit(1).single()

    if (error) {
      return NextResponse.json(null)
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(null)
  }
}

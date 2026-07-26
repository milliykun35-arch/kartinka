import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to Base64 Data URL for instant, 100% reliable local/remote image storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = file.type || "image/jpeg"
    const dataUrl = `data:${mimeType};base64,${base64}`

    return NextResponse.json({ url: dataUrl, name: file.name })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error?.message || "Failed to upload file" }, { status: 500 })
  }
}

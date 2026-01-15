import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { packId } = body

        if (!packId) {
            return NextResponse.json({ error: "packId required" }, { status: 400 })
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        return NextResponse.json({
            userId: user?.id,
            packId,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error("Error in debug endpoint:", error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

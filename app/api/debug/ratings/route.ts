import { ratingService } from "@/services/ratingService"
import { authService } from "@/services/authService"

export async function GET() {
    try {
        const user = await authService.getUser()
        
        if (!user) {
            return Response.json({ error: "Not authenticated" }, { status: 401 })
        }

        // Get this user's stats (they are the rated_to_id if they're a seller)
        const stats = await ratingService.getRatingsStats(user.id)

        return Response.json({
            userId: user.id,
            stats,
            message: "OK"
        })
    } catch (error) {
        return Response.json({
            error: String(error)
        }, { status: 500 })
    }
}

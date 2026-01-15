import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { ProfileContent } from "./profile-content"

export default function ProfilePage() {
    return (
        <Suspense 
            fallback={
                <div className="flex justify-center items-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            }
        >
            <ProfileContent />
        </Suspense>
    )
}

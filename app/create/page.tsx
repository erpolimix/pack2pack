import { CreatePackForm } from "@/components/create-pack-form";

export default function CreatePage() {
    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Sell a Pack</h1>
                <p className="text-muted-foreground">
                    Snap a photo, let AI do the rest, and give your items a new home.
                </p>
            </div>
            <CreatePackForm />
        </div>
    );
}

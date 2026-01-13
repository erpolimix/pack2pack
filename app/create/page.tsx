import { CreatePackForm } from "@/components/create-pack-form";

export default function CreatePage() {
    return (
        <div className="container max-w-2xl mx-auto py-10 px-6">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Vender un Pack</h1>
                <p className="text-muted-foreground">
                    Saca una foto, deja que la IA haga el resto, y dale a tus cosas un nuevo hogar.
                </p>
            </div>
            <CreatePackForm />
        </div>
    );
}

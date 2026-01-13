import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function AuthCodeError() {
    return (
        <div className="container flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md border-destructive/50">
                <CardHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertCircle className="h-6 w-6" />
                        <CardTitle>Error de Autenticación</CardTitle>
                    </div>
                    <CardDescription>
                        Ha ocurrido un problema al intentar iniciar sesión con el proveedor.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Esto puede deberse a que el enlace ha caducado, el usuario canceló la operación o hubo un problema de configuración.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/login">Volver a intentar</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

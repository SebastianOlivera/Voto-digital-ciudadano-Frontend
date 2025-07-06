import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateEleccionForm } from "./CreateEleccionForm";
import { Vote, AlertTriangle } from "lucide-react";

export const NewElectionWarning = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="w-full justify-start" variant="outline">
            <Vote className="h-4 w-4 mr-2" />
            Nueva Elección
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              <span>¡Advertencia Importante!</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-gray-700">
                <p className="font-medium">
                  Al crear una nueva elección se realizarán las siguientes acciones:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Se desactivará la elección actual</li>
                  <li>La nueva elección quedará activa automáticamente</li>
                  <li>Los votos de la elección anterior se <strong>mantienen</strong> para consulta</li>
                  <li>Esta acción <strong>no se puede deshacer</strong></li>
                </ul>
                <p className="text-sm text-blue-600 font-medium">
                  ℹ️ Los resultados mostrados seguirán correspondiendo a la elección anterior hasta que se emitan nuevos votos
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Vote className="h-5 w-5 text-purple-500" />
              <span>Crear Nueva Elección</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <CreateEleccionForm onElectionCreated={() => {
              setShowForm(false);
              // Solo mostrar mensaje informativo, no recargar datos
            }} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
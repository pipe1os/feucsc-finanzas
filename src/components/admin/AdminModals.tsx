"use client";

import { useState } from"react";
import Image from"next/image";
import { Modal, AlertDialog, Button, Alert, toast } from"@heroui/react";
import { formatCLP } from"@/lib/utils";
import {
 deleteGasto as deleteGastoAction,
 deleteCategoria as deleteCategoriaAction,
} from"@/app/actions/gastos";
import EditGastoForm from"@/components/admin/EditGastoForm";

import type { GastoDB } from"@/hooks/useGastos";

export interface AdminModalsProps {
 editGasto: GastoDB | null;
 setEditGasto: (g: GastoDB | null) => void;
 deleteGasto: GastoDB | null;
 setDeleteGasto: (g: GastoDB | null) => void;
 deletingCat: string | null;
 setDeletingCat: (c: string | null) => void;
 lightboxUrl: string | null;
 setLightboxUrl: (url: string | null) => void;

 categorias: string[];
 categoriasDB: { nombre: string; color?: string; }[];
 
 mutateGastos: () => void;
 mutateCategorias: () => void;
 onGastoDeleted: () => void;
}

export default function AdminModals({
 editGasto,
 setEditGasto,
 deleteGasto,
 setDeleteGasto,
 deletingCat,
 setDeletingCat,
 lightboxUrl,
 setLightboxUrl,
 categorias,
 categoriasDB,
 mutateGastos,
 mutateCategorias,
 onGastoDeleted,
}: AdminModalsProps) {
 const [deletingCatLoading, setDeletingCatLoading] = useState(false);
 const [deleting, setDeleting] = useState(false);
 const [deleteError, setDeleteError] = useState<string | null>(null);

 const handleDeleteCategory = async () => {
 if (!deletingCat) return;
 setDeletingCatLoading(true);
 try {
 await deleteCategoriaAction(deletingCat);
 setDeletingCat(null);
 mutateCategorias();
 mutateGastos();
 } catch {
 toast.danger("Error al eliminar categoría");
 } finally {
 setDeletingCatLoading(false);
 }
 };

 const handleDelete = async () => {
 if (!deleteGasto) return;
 setDeleting(true);
 setDeleteError(null);
 try {
 await deleteGastoAction(deleteGasto.id);
 toast.success("Gasto eliminado exitosamente");
 setDeleteGasto(null);
 mutateGastos();
 onGastoDeleted();
 } catch (err: unknown) {
 const msg = err instanceof Error ? err.message :"";
 const safeMsg =
 msg ==="No autorizado" || msg.includes("inválid")
 ? msg
 :"Ocurrió un error al eliminar el gasto";
 setDeleteError(safeMsg);
 toast.danger("Error al eliminar gasto");
 } finally {
 setDeleting(false);
 }
 };

 return (
 <>
 <Modal.Backdrop
 isOpen={!!editGasto}
 onOpenChange={() => { setEditGasto(null); }}
 >
 <Modal.Container>
 <Modal.Dialog className="sm:max-w-lg bg-white border border-border shadow-apple-lg">
 <Modal.CloseTrigger className="hover:bg-zinc-100 transition-colors" />
 <Modal.Header className="sm:px-8 sm:pt-6 border-b border-border pb-4 mb-4">
 <Modal.Heading className="text-xl font-semibold font-heading">
 Editar Gasto
 </Modal.Heading>
 </Modal.Header>
 <Modal.Body className="sm:px-8 sm:pb-6">
 {editGasto && (
 <EditGastoForm
 key={editGasto.id}
 gasto={editGasto}
 categorias={categorias}
 categoriasDB={categoriasDB}
 mutateCategorias={mutateCategorias}
 onSuccess={() => {
 setEditGasto(null);
 mutateGastos();
 toast.success("Gasto actualizado exitosamente");
 }}
 onCancel={() => { setEditGasto(null); }}
 onDeleteCategory={setDeletingCat}
 onViewImage={setLightboxUrl}
 />
 )}
 </Modal.Body>
 </Modal.Dialog>
 </Modal.Container>
 </Modal.Backdrop>
 <AlertDialog.Backdrop
 isOpen={!!deleteGasto}
 onOpenChange={() => { setDeleteGasto(null); }}
 >
 <AlertDialog.Container>
 <AlertDialog.Dialog className="sm:max-w-100 bg-white border border-border shadow-apple-lg">
 <AlertDialog.CloseTrigger className="hover:bg-zinc-100 transition-colors" />
 <AlertDialog.Header>
 <AlertDialog.Icon status="danger" />
 <AlertDialog.Heading>¿Eliminar gasto?</AlertDialog.Heading>
 </AlertDialog.Header>
 <AlertDialog.Body>
 <p className="text-sm text-zinc-600">
 Estás por eliminar{""}
 <strong>&ldquo;{deleteGasto?.descripcion}&rdquo;</strong> por{""}
 <strong>
 {deleteGasto ? formatCLP(deleteGasto.monto) :""}
 </strong>
 . Esta acción no se puede deshacer.
 </p>
 {deleteError && (
 <Alert status="danger" className="mt-3">
 <Alert.Indicator />
 <Alert.Content>
 <Alert.Title className="text-sm">{deleteError}</Alert.Title>
 </Alert.Content>
 </Alert>
 )}
 </AlertDialog.Body>
 <AlertDialog.Footer>
 <Button
 variant="tertiary"
 slot="close"
 className="cursor-pointer text-zinc-700"
 >
 Cancelar
 </Button>
 <Button
 variant="danger"
 isDisabled={deleting}
 onPress={handleDelete}
 className="cursor-pointer"
 >
 {deleting ?"Eliminando..." :"Eliminar"}
 </Button>
 </AlertDialog.Footer>
 </AlertDialog.Dialog>
 </AlertDialog.Container>
 </AlertDialog.Backdrop>
 <AlertDialog.Backdrop
 isOpen={!!deletingCat}
 onOpenChange={() => { setDeletingCat(null); }}
 >
 <AlertDialog.Container>
 <AlertDialog.Dialog className="sm:max-w-100 bg-white border border-border shadow-apple-lg">
 <AlertDialog.CloseTrigger className="hover:bg-zinc-100 transition-colors" />
 <AlertDialog.Header>
 <AlertDialog.Icon status="warning" />
 <AlertDialog.Heading>¿Eliminar categoría?</AlertDialog.Heading>
 </AlertDialog.Header>
 <AlertDialog.Body>
 <p className="text-sm text-zinc-600">
 Vas a eliminar la categoría{""}
 <strong>&ldquo;{deletingCat}&rdquo;</strong>.
 {""}
 Los gastos que usan esta categoría pasarán a <strong>&ldquo;N/A&rdquo;</strong>.
 </p>
 </AlertDialog.Body>
 <AlertDialog.Footer>
 <Button
 variant="tertiary"
 slot="close"
 className="cursor-pointer text-zinc-700"
 >
 Cancelar
 </Button>
 <Button
 isDisabled={deletingCatLoading}
 onPress={handleDeleteCategory}
 className="bg-amber-500 text-white hover:bg-amber-600 cursor-pointer rounded-xl px-6"
 >
 {deletingCatLoading ?"Eliminando..." :"Eliminar categoría"}
 </Button>
 </AlertDialog.Footer>
 </AlertDialog.Dialog>
 </AlertDialog.Container>
 </AlertDialog.Backdrop>
 <Modal.Backdrop
 isOpen={!!lightboxUrl}
 onOpenChange={() => { setLightboxUrl(null); }}
 >
 <Modal.Container size="lg">
 <Modal.Dialog>
 <Modal.CloseTrigger />
 <Modal.Header>
 <Modal.Heading>Comprobante</Modal.Heading>
 </Modal.Header>
 <Modal.Body className="flex items-center justify-center p-6">
 {lightboxUrl && (
 <Image
 src={lightboxUrl}
 alt="Comprobante de gasto"
 width={600}
 height={800}
 className="max-h-[70vh] w-auto rounded-xl object-contain"
 unoptimized
 />
 )}
 </Modal.Body>
 </Modal.Dialog>
 </Modal.Container>
 </Modal.Backdrop>
 </>
 );
}

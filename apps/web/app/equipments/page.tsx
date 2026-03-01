"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { equipments, type EquipmentListDto } from "@/lib/api";
import { Package, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export default function MyEquipmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<EquipmentListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!user) return;
    equipments.mine().then(setItems).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return;
    setDeleting(id);
    try {
      await equipments.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      alert("Erreur lors de la suppression.");
    } finally {
      setDeleting(null);
    }
  };

  const toggleAvailability = async (item: EquipmentListDto) => {
    try {
      await equipments.update(item.id, { isAvailable: !item.isAvailable });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
    } catch {
      alert("Erreur lors de la mise à jour.");
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Chargement...</div></div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-alt py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-primary">Mes équipements</h1>
            <p className="text-gray-600 mt-1">{items.length} équipement{items.length > 1 ? "s" : ""}</p>
          </div>
          <Link href="/equipments/new" className="bg-green-primary text-white hover:bg-green-darker py-2.5 px-6 rounded-full text-sm font-semibold transition-colors inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Ajouter
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">Aucun équipement pour le moment.</p>
            <p className="text-gray-400 text-sm mb-6">Ajoutez votre premier matériel pour le proposer à la location.</p>
            <Link href="/equipments/new" className="bg-green-primary text-white hover:bg-green-darker py-2.5 px-6 rounded-full text-sm font-semibold transition-colors inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Ajouter un équipement
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Équipement</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix/jour</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qte</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/catalogue/${item.id}`} className="font-medium text-gray-900 hover:text-green-primary transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-400">{item.condition}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.categoryName}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.dailyPrice} CHF</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleAvailability(item)} className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${item.isAvailable ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {item.isAvailable ? <><Eye className="w-3 h-3" /> Disponible</> : <><EyeOff className="w-3 h-3" /> Masqué</>}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/equipments/${item.id}/edit`} className="p-2 text-gray-400 hover:text-green-primary transition-colors" title="Modifier">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(item.id, item.name)} disabled={deleting === item.id} className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

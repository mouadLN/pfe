import { Store } from "lucide-react"

export default function AnalyseMagasinHeader() {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-2 border-red-500 rounded-md bg-white dark:bg-zinc-900">
      <Store className="w-5 h-5 text-red-500 shrink-0" />
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 m-0">Analyse par Magasin</h2>
    </div>
  )
}
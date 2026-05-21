// components/SectionHeader.jsx
export default function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-2 border-red-500 rounded-md bg-white dark:bg-zinc-900">
      {Icon && <Icon className="w-5 h-5 text-red-500 shrink-0" />}
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 m-0">{title}</h2>
    </div>
  );
}
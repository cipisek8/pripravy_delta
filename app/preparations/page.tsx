import { getPreparations } from '@/app/actions/getPreparations'
import { FieldOptions } from '@/components/field-options';
import { getField } from '../actions/getField';

export default async function PreparationsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const filters = {
  year: searchParams.year,
  fieldId: searchParams.fieldId,
  theme: searchParams.theme,
}
  const preparations = await getPreparations(filters);

  return (
    <div className="p-8">
      <form method="get" className="mb-6 flex gap-4 flex-wrap">
        <input
          type="number"
          name="year"
          placeholder="Ročník"
          min={1}
          max={13}
          defaultValue={filters.year}
          className="border p-2 rounded"
        />
        <select name="fieldId" className="border p-2 rounded" defaultValue={filters.fieldId}>
          <FieldOptions />
        </select>
        <input
          name="theme"
          placeholder="Téma"
          defaultValue={filters.theme}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Filter
        </button>
      </form>
      <h1 className="text-2xl font-bold mb-6">Přípravy</h1>
      
      {preparations.length === 0 ? (
        <p>Žádné přípravy nebyly nalezeny.</p>
      ) : (
      <ul className="space-y-4">
        {preparations.map((prep) => (
          <li key={prep.id} className="flex justify-between items-center border rounded p-4 hover:bg-gray-50">
            <div>
              <p className="font-semibold text-lg">{prep.theme}</p>
              <p className="text-sm text-gray-600">
                Ročník: {prep.year} | Předmět: {getField(prep.fieldId)}
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={`/preparations/${prep.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Otevřít
              </a>
              <a
                href={`/preparations/${prep.id}/export`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Export PDF
              </a>
            </div>
          </li>
        ))}
      </ul>)}
    </div>
  )
}

import { FieldOptions } from '@/components/field-options';
import { getField } from '@/app/actions/getField';
import { getGrade } from '@/app/actions/getGrade';
import { GradeOptions } from '@/components/grade-options';
import { getRole } from '@/app/actions/getRole';
import { getReviewingPreparations } from '@/app/actions/getReviewingPreperations';

export default async function ReviewsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const filters = {
  gradeId: searchParams.gradeId,
  fieldId: searchParams.fieldId,
  name: searchParams.name,
}
  const preparations = await getReviewingPreparations(filters);
  if(await getRole() !== 'reviewer') return (<><h1>nemate pristup</h1></>)

  return (
    <div className="p-8">
      <form method="get" className="mb-6 flex gap-4 flex-wrap">
        <select name="gradedId" className="border p-2 rounded" defaultValue={filters.gradeId}>
          <GradeOptions />
        </select>
        <select name="fieldId" className="border p-2 rounded" defaultValue={filters.fieldId}>
          <FieldOptions />
        </select>
        <input
          name="theme"
          placeholder="Název"
          defaultValue={filters.name}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Filter
        </button>
      </form>
      <h1 className="text-2xl font-bold mb-6">Přípravy k hodnocení</h1>
      
      {preparations.length === 0 ? (
        <p>Žádné přípravy nebyly nalezeny.</p>
      ) : (
      <ul className="space-y-4">
        {preparations.map((prep) => (
          <li key={prep.id} className="flex justify-between items-center border rounded p-4 hover:bg-gray-50">
            <div>
              <p className="font-semibold text-lg">{prep.name}</p>
              <p className="text-sm text-gray-600">
                Ročník: {getGrade(prep.gradeId)} | Předmět: {getField(prep.fieldId)}
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={`/reviews/${prep.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Otevřít
              </a>
              <a
                href={`/reviews/${prep.id}/export`}
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

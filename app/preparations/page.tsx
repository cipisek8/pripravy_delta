import { getPreparations } from '@/app/actions/getPreparations'
import { FieldOptions } from '@/components/field-options';
import { getField } from '@/app/actions/getField';
import { getGrade } from '@/app/actions/getGrade';
import { GradeOptions } from '@/components/grade-options';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PreparationsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams
  const filters = {
  gradeId: params.gradeId,
  fieldId: params.fieldId,
  name: params.name,
}
  const preparations = await getPreparations(filters);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Přípravy</h1>
        <p className="text-gray-600">Správa a export příprav</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form method="get" className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Ročník</label>
              <select name="gradeId" className="border bg-white p-2 rounded-md" defaultValue={filters.gradeId}>
                <GradeOptions />
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Předmět</label>
              <select name="fieldId" className="border bg-white p-2 rounded-md" defaultValue={filters.fieldId}>
                <FieldOptions />
              </select>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm text-gray-600">Název</label>
              <input
                name="name"
                placeholder="Např. Derivace"
                defaultValue={filters.name}
                className="border bg-white p-2 rounded-md"
              />
            </div>
            <Button type="submit" className="md:mb-[2px]">Filtrovat</Button>
          </form>
        </CardContent>
      </Card>

      {preparations.length === 0 ? (
        <p className="text-gray-600">Žádné přípravy nebyly nalezeny.</p>
      ) : (
        <div className="grid gap-6">
          {preparations.map((prep) => (
            <Card key={prep.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{prep.name}</CardTitle>
                      <CardDescription className="mt-1.5">
                        Ročník: {getGrade(prep.gradeId)} · Předmět: {getField(prep.fieldId)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="flex items-center gap-2">
                    <Link href={`/preparations/${prep.id}`}>Otevřít</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex items-center gap-2">
                    <a href={`/preparations/${prep.id}/export`} target="_blank" rel="noopener noreferrer">
                      Export PDF
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

import { getField } from '@/app/actions/getField'
import PreparationForm from '../EditOrCreatePreparationPage'
import { getPreparation } from '@/app/actions/getPreparation'
import { isPreparationOwner } from '@/app/actions/isPreparationOwner'
import { renderMarkdown } from '@/app/actions/renderMarkdown'
import { getGrade } from '@/app/actions/getGrade'
import { getRVP } from '@/app/actions/getRVP'

interface Params {
  params: { id: string }
}

export default async function PreparationPage({ params }: { params: { id: string } }) {
  const parameters = await params
  const preparation = parameters.id !== 'new' ? await getPreparation(parameters.id) : null;

  // if(!preparation)
  //   return <p>Příprava nebyla nalezena</p>

  const { isOwner } = await isPreparationOwner(preparation.id)

  if (isOwner) {
    // Editable form for owner
    return <PreparationForm initialData={preparation} />
  }
  
  const htmlPreview = await renderMarkdown(String(preparation.content))

  return (
    <div className="prose">
      <h1>{preparation.name}</h1>
      <p><strong>Ročník:</strong> {getGrade(preparation.gradeId)}</p>
      <p><strong>Předmět:</strong> {getField(preparation.fieldId)}</p>
      {preparation.goals ? <p><strong>Cíle:</strong> {preparation.goals}</p> : ''}
      {preparation.teachingAids ? <p><strong>Pomůcky:</strong> {preparation.teachingAids}</p> : ''}
      <p><strong>Celkový čas:</strong> {preparation.totalTime} minut</p>
      <h2>Časy</h2>
      <ul>
        {(preparation.times as any[]).map(o => <li>{o.subtheme} – {o.time}</li>)}
      </ul>
      <h2>RVP</h2>
        <ul>
          {(await Promise.all(
            preparation.RVPCodes.map(code => getRVP(code))))
            .map(o => <li>{o}</li>)}
        </ul>
      <hr/>
      <div className="prose" dangerouslySetInnerHTML={{ __html: htmlPreview }} />

      <a
        href={`/preparations/${await parameters.id}/export`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block bg-gray-700 text-white px-4 py-2 rounded"
      >
        Export PDF
      </a>
    </div>
  )
}


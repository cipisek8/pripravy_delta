import { getField } from '@/app/actions/getField'
import { getPreparation } from '@/app/actions/getPreparation'
import { renderMarkdown } from '@/app/actions/renderMarkdown'
import { getGrade } from '@/app/actions/getGrade'
import { getRVP } from '@/app/actions/getRVP'
import { getRole } from '@/app/actions/getRole'
import { createClient } from '@/lib/supabase/server'
/* eslint-disable react/jsx-key */   

export default async function PreparationPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) {
        return <h1>Nemáte přístup. Musíte být přihlášeni.</h1>;
    }

    const parameters = await params
    const preparation = parameters.id !== 'new' ? await getPreparation(parameters.id) : null;

    // if(!preparation)
    //   return <p>Příprava nebyla nalezena</p>

    if (await getRole() !== 'reviewer') return (<><h1>Nemáte přístup</h1></>)

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
                {(preparation.times as any[]).map(o => <li>{o.subtheme} – {o.time}</li>) /* eslint-disable-line @typescript-eslint/no-explicit-any */}
            </ul>
            <h2>RVP</h2>
            <ul>
                {(await Promise.all(
                    preparation.RVPCodes.map(code => getRVP(code))))
                    .map(o => <li>{o}</li>)}
            </ul>
            <hr />
            <div className="prose" dangerouslySetInnerHTML={{ __html: htmlPreview }} />

            <a
                href={`/preparations/${parameters.id}/export`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-gray-700 text-white px-4 py-2 rounded"
            >
                Export PDF
            </a>
            <form method="post" action={`/reviews/${parameters.id}/accept`} className="inline-block">
                <button type="submit" className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded">
                    Přijmou přípravu
                </button>
            </form>
            <form method="post" action={`/reviews/${parameters.id}/deny`} className="inline-block">
                <button type="submit" className="mt-4 inline-block bg-red-500 text-white px-4 py-2 rounded">
                    Odmítnout přípravu
                </button>
            </form>
        </div>
    )
}


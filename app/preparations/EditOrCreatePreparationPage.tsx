'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm, useFieldArray, set } from 'react-hook-form'
import { renderMarkdown } from '@/app/actions/renderMarkdown'
import { savePreparation } from '@/app/actions/savePreparation'
import { FieldOptions } from '@/components/field-options'
import { GradeOptions } from '@/components/grade-options'
import { RVPOptions } from '@/components/rvp-options'
import { getGrade } from '../actions/getGrade'
import { getField } from '../actions/getField'
import { getRVP } from '../actions/getRVP'

export default function EditOrCreatePreparationPage({ initialData }: { initialData?: any }) {
    const [previewContent, setPreviewContent] = useState('')
    const [gradeName, setGradeName] = useState('')
    const [fieldName, setFieldName] = useState('')
    const [fieldId, setFieldId] = useState<string | undefined>(initialData?.fieldId || undefined)
    const [gradeId, setGradeId] = useState<number | undefined>(initialData?.gradeId || undefined)
    const [RVPs, setRVPs] = useState<string[]>([]);
    const { register, control, handleSubmit, watch, reset, setValue } = useForm({
        defaultValues: initialData || {
            gradeId: 0,
            fieldId: '',
            name: '',
            goals: '',
            times: [{ subtheme: '', time: 0 }],
            totalTime: 0,
            content: '',
            teachingAids: '',
            RVPCodes: [],
            reviewing: initialData?.uploaded ?? initialData?.reviewing ?? false,
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: 'times' })
    const inputs = watch()
    const prevValues = useRef(inputs)

    useEffect(() => {
        if (initialData) reset(initialData)
    }, [initialData, reset])

    useEffect(() => {
        const updatePreview = async () => {
            if (inputs.content && (inputs.content !== prevValues.current.content)) 
                setPreviewContent(await renderMarkdown(inputs.content))
                setGradeName(await getGrade(inputs.gradeId))
                setFieldName(await getField(inputs.fieldId))
            if ((inputs.gradeId > 0) && (inputs.gradeId !== prevValues.current.gradeId)) {
                setGradeName(await getGrade(inputs.gradeId))
                setGradeId(inputs.gradeId)
                setRVPs([])
                inputs.RVPCodes = []
                setValue("RVPCodes", [])
            }
            if (inputs.fieldId && (inputs.fieldId !== prevValues.current.fieldId)) {
                setFieldName(await getField(inputs.fieldId))
                setFieldId(inputs.fieldId)
                setRVPs([])
                inputs.RVPCodes = []
                setValue("RVPCodes", [])
            }
            if (inputs.RVPCodes && (inputs.RVPCodes !== prevValues.current.RVPCodes)) 
                setRVPs(await Promise.all(inputs.RVPCodes.map(code => getRVP(code))))
            prevValues.current = inputs
        }
        const handler = setTimeout(() => {
            updatePreview()
        }, 1000); // delay = 1s

        return () => {
            clearTimeout(handler);
        };
    }, [inputs])

    // Called only on submit
const validateAndToggleReviewing = (data: any) => {
      if (!data.reviewing) {
    return true;
  }
  if (
    !data.name ||
    !data.fieldId ||
    !data.goals ||
    !data.times ||
    !data.totalTime ||
    data.gradeId <= 0
  ) {
    alert('Chybí jméno, předmět, ročník, cíle nebo časy.');
    setValue('reviewing', false); // uncheck the box
    return false;
  } else if (data.times.reduce((acc: number, curr: any) => acc + curr.time, 0) !== data.totalTime) {
    alert('Časy v položce "Celková doba" a "Doba" jednotlivých tématů se neshodují.');
    setValue('reviewing', false); // uncheck the box
    return false;
  }
  
  setValue('reviewing', true); // check the box if valid
  return true;
};

const onSubmit = async (data: any) => {
    data.uploaded = false;

    if (!validateAndToggleReviewing(data)) return;

    try {
        await savePreparation({ id: initialData?.id, ...data });
        alert('Uloženo!');
    } catch (err: any) {
        alert(err.message);
    }
};



    return (
        <div className="flex gap-8 p-8 h-screen">
            {/* Left - form */}
            <form onSubmit={handleSubmit(onSubmit)} className="w-1/2 space-y-4 overflow-auto">
                <div className="grid grid-cols-2 gap-2">
                    <select {...register('gradeId', { valueAsNumber: true })} className="border p-2 rounded">
                        <GradeOptions />
                    </select>
                    <select {...register('fieldId')} className="border p-2 rounded">
                        <FieldOptions />
                    </select>
                </div>
                <input {...register('name')} placeholder="Název" className="w-full border p-2 rounded" />
                <input {...register('goals')} placeholder="Cíle" className="w-full border p-2 rounded" />
                <input {...register('teachingAids')} placeholder="Učební pomůcky" className="w-full border p-2 rounded" />
                <input
                    {...register('reviewing')}
                    type="checkbox"
                    className="mt-2"
                />
                <label htmlFor="reviewing" className="mt-2">
                    Je veřejné
                </label>
                <input type="number" {...register('totalTime', { valueAsNumber: true })} placeholder="Celkový čas (v minutách)" className="w-full border p-2 rounded" />
                <div>
                    <label className="font-semibold block mb-2">Časy (podtémata a délka v minutách)</label>
                    {fields.map((field: any, index: any) => (
                        <div key={field.id} className="flex gap-2 mb-2">
                            <input
                                {...register(`times.${index}.subtheme`)}
                                placeholder="Podtéma"
                                className="border p-2 rounded w-2/3"
                            />
                            <input
                                type="number"
                                {...register(`times.${index}.time`, { valueAsNumber: true })}
                                placeholder="Čas (v minutách)"
                                className="border p-2 rounded w-1/3"
                            />
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-500 font-bold"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => append({ subtheme: '', time: 0 })}
                        className="text-blue-600 underline"
                    >
                        + Přidat podtéma
                    </button>
                </div>
                <label className="font-semibold block mb-2">RVP kódy</label>
                <select
                    multiple
                    className="w-full border p-2 rounded"
                    {...register('RVPCodes')}
                >
                    <RVPOptions startFilter={fieldId} containFilter={gradeId} />
                </select>

                <textarea
                    {...register('content')}
                    placeholder="Formátovaný text (.md)"
                    rows={10}
                    className="w-full border p-2 rounded font-mono"
                />

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Uložit
                </button>
                <button
                    type="button"
                    disabled={!initialData?.id}
                    onClick={() => window.open(`/preparations/${initialData?.id}/export`, '_blank')}
                    className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    Exportovat do PDF
                </button>

            </form>


            <div className="w-1/2 border rounded p-4 overflow-auto prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Náhled</h2>

                <div className="prose">
                    <h1>{inputs.name}</h1>
                    <p><strong>Ročník:</strong>
                        {inputs.gradeId && gradeName}
                    </p>
                    <p><strong>Předmět:</strong>
                        {inputs.fieldId && fieldName}
                    </p>
                    {inputs.goals ? <p><strong>Cíle:</strong> {inputs.goals}</p> : ''}
                    {inputs.teachingAids ? <p><strong>Pomůcky:</strong> {inputs.teachingAids}</p> : ''}
                    <p><strong>Celkový čas:</strong> {inputs.totalTime} minut</p>
                    <h2>Časy</h2>
                    <ul>
                        {(inputs.times as any[]).map(o => <li>{o.subtheme} – {o.time} minut</li>)}
                    </ul>
                    <h2>RVP</h2>
                    <ul>
                        {RVPs.map(rvp => <li>{rvp}</li>)}
                    </ul>
                    <hr />
                    <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                </div>
            </div>
        </div>
    )
}

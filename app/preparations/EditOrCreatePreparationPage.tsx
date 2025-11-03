'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { renderMarkdown } from '@/app/actions/renderMarkdown'
import { savePreparation } from '@/app/actions/savePreparation'
import { exportToPdf } from '@/app/actions/exportToPdf'
import { FieldOptions } from '@/components/field-options'

export default function EditOrCreatePreparationPage({ initialData }: { initialData?: any }) {
    const [preview, setPreview] = useState('')
    const [uploaded, setUploaded] = useState(initialData?.uploaded ?? false)
    const { register, control, handleSubmit, watch, reset } = useForm({
        defaultValues: initialData || {
            year: '',
            fieldId: '',
            theme: '',
            goals: '',
            times: [{ subtheme: '', time: 0 }],
            content: '',
            uploaded: false,
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: 'times' })
    const content = watch('content')

    useEffect(() => {
        if (initialData) reset(initialData)
    }, [initialData, reset])

    useEffect(() => {
        const updatePreview = async () => {
            const html = await renderMarkdown(content)
            setPreview(html)
        }
        updatePreview()
    }, [content])

    const onSubmit = async (data: any) => {
        try {
            await savePreparation({ id: initialData?.id, ...data })
            alert('Uloženo!')
        } catch (err: any) {
            alert(err.message)
        }
    }

    const onExport = async (data: any) => {
        const path = await exportToPdf(data)
        alert(`PDF exportováno do: ${path}`)
    }

    const toggleUploaded = () => {
        setUploaded(!uploaded)
    }

    return (
        <div className="flex gap-8 p-8 h-screen">
            {/* Left - form */}
            <form onSubmit={handleSubmit(onSubmit)} className="w-1/2 space-y-4 overflow-auto">
                <div className="grid grid-cols-2 gap-2">
                    <input {...register('year')} placeholder="Ročník" className="border p-2 rounded" />
                    <select {...register('fieldId')} className="border p-2 rounded">
                        <FieldOptions />
                    </select>
                </div>
                <input {...register('theme')} placeholder="Téma" className="w-full border p-2 rounded" />
                <input {...register('goals')} placeholder="Cíle" className="w-full border p-2 rounded" />
                <input
                    {...register('uploaded')}
                    type="checkbox"
                    checked={uploaded}
                    onChange={toggleUploaded}
                    className="mt-2"
                />
                <label htmlFor="uploaded" className="mt-2">
                    Je veřejné
                </label>

                <div>
                    <label className="font-semibold block mb-2">Časy (podtémata a časy)</label>
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

            {/* Right - Preview */}
            <div className="w-1/2 border rounded p-4 overflow-auto prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Náhled</h2>
                <div dangerouslySetInnerHTML={{ __html: preview }} />
            </div>
        </div>
    )
}

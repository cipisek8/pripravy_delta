'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { renderMarkdown } from '@/app/actions/renderMarkdown'
import { savePreparation } from '@/app/actions/savePreparation'
import { FieldOptions } from '@/components/field-options'
import { GradeOptions } from '@/components/grade-options'
import { RVPOptions } from '@/components/rvp-options'
import { getGrade } from '../actions/getGrade'
import { getField } from '../actions/getField'
import { getRVP } from '../actions/getRVP'
import Link from 'next/link'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

type TimeRow = {
    subtheme: string
    time: number
}

type PreparationFormValues = {
    gradeId: number
    fieldId: string
    name: string
    goals: string
    times: TimeRow[]
    totalTime: number
    content: string
    teachingAids: string
    RVPCodes: string[]
    reviewing: boolean
    uploaded?: boolean
}

type PreparationInitialData = Partial<PreparationFormValues> & { id?: string }

export default function EditOrCreatePreparationPage({ initialData }: { initialData?: PreparationInitialData }) {
    const [previewContent, setPreviewContent] = useState('')
    const [gradeName, setGradeName] = useState('')
    const [fieldName, setFieldName] = useState('')
    const [fieldId, setFieldId] = useState<string | undefined>(initialData?.fieldId || undefined)
    const [gradeId, setGradeId] = useState<number | undefined>(initialData?.gradeId || undefined)
    const [RVPs, setRVPs] = useState<string[]>([]);
    const { register, control, handleSubmit, watch, reset, setValue } = useForm<PreparationFormValues>({
        defaultValues: {
            gradeId: initialData?.gradeId ?? 0,
            fieldId: initialData?.fieldId ?? '',
            name: initialData?.name ?? '',
            goals: initialData?.goals ?? '',
            times: (initialData?.times as TimeRow[] | undefined) ?? [{ subtheme: '', time: 0 }],
            totalTime: initialData?.totalTime ?? 0,
            content: initialData?.content ?? '',
            teachingAids: initialData?.teachingAids ?? '',
            RVPCodes: initialData?.RVPCodes ?? [],
            reviewing: initialData?.uploaded ?? initialData?.reviewing ?? false,
            uploaded: initialData?.uploaded,
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
            if (inputs.content !== prevValues.current.content) {
                setPreviewContent(await renderMarkdown(inputs.content || ''))
            }

            if ((inputs.gradeId > 0) && (inputs.gradeId !== prevValues.current.gradeId)) {
                setGradeName(await getGrade(inputs.gradeId))
                setGradeId(inputs.gradeId)
                setRVPs([])
                setValue("RVPCodes", [])
            }
            if (inputs.fieldId && (inputs.fieldId !== prevValues.current.fieldId)) {
                setFieldName(await getField(inputs.fieldId))
                setFieldId(inputs.fieldId)
                setRVPs([])
                setValue("RVPCodes", [])
            }

            if (inputs.RVPCodes !== prevValues.current.RVPCodes) {
                setRVPs(await Promise.all((inputs.RVPCodes ?? []).map((code) => getRVP(code))))
            }
            prevValues.current = inputs
        }
        const handler = setTimeout(() => {
            updatePreview()
        }, 1000); // delay = 1s

        return () => {
            clearTimeout(handler);
        };
    }, [inputs, setValue])

    // Called only on submit
const validateAndToggleReviewing = (data: PreparationFormValues) => {
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
    } else if (data.times.reduce((acc, curr) => acc + (curr.time || 0), 0) !== data.totalTime) {
    alert('Časy v položce "Celková doba" a "Doba" jednotlivých tématů se neshodují.');
    setValue('reviewing', false); // uncheck the box
    return false;
  }
  
  setValue('reviewing', true); // check the box if valid
  return true;
};

const onSubmit = async (data: PreparationFormValues) => {
    data.uploaded = false;

    if (!validateAndToggleReviewing(data)) return;

    try {
        await savePreparation({ id: initialData?.id, ...data });
        alert('Uloženo!');
    } catch (err) {
        alert(err instanceof Error ? err.message : 'Chyba při ukládání');
    }
};



    const isEditing = Boolean(initialData?.id)
    const reviewingChecked = Boolean(inputs.reviewing)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-6">
                <div>
                    <Button asChild variant="ghost" className="mb-4 flex items-center gap-2">
                        <Link href="/preparations">
                            <ArrowLeft className="h-4 w-4" />
                            Zpět na přípravy
                        </Link>
                    </Button>
                    <h1 className="text-3xl mb-2">{isEditing ? 'Upravit přípravu' : 'Nová příprava'}</h1>
                    <p className="text-gray-600">Uprav detaily a obsah (Markdown). Náhled zůstává vpravo.</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left - form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Základní informace</CardTitle>
                            <CardDescription>Obecné údaje o přípravě</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Název</Label>
                                <Input id="name" {...register('name')} placeholder="Např. Derivace" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="gradeId">Ročník</Label>
                                    <select
                                        id="gradeId"
                                        {...register('gradeId', { valueAsNumber: true })}
                                        className="h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
                                    >
                                        <GradeOptions />
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fieldId">Předmět</Label>
                                    <select
                                        id="fieldId"
                                        {...register('fieldId')}
                                        className="h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
                                    >
                                        <FieldOptions />
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="goals">Cíle</Label>
                                <Input id="goals" {...register('goals')} placeholder="Co se žáci naučí…" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teachingAids">Učební pomůcky</Label>
                                <Input id="teachingAids" {...register('teachingAids')} placeholder="Např. tabule, projektor…" />
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="reviewing"
                                    checked={reviewingChecked}
                                    onCheckedChange={(checked) => setValue('reviewing', Boolean(checked))}
                                />
                                <Label htmlFor="reviewing" className="cursor-pointer">Je veřejné</Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="totalTime">Celkový čas (min)</Label>
                                <Input
                                    id="totalTime"
                                    type="number"
                                    {...register('totalTime', { valueAsNumber: true })}
                                    placeholder="Např. 45"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="RVPCodes">RVP kódy</Label>
                                <select
                                    id="RVPCodes"
                                    multiple
                                    className="min-h-28 w-full rounded-md border border-input bg-white p-2 text-sm shadow-sm"
                                    {...register('RVPCodes')}
                                >
                                    <RVPOptions startFilter={fieldId} containFilter={gradeId} />
                                </select>
                                <p className="text-sm text-gray-500">
                                    Vybrané RVP: {RVPs.length > 0 ? RVPs.join(', ') : 'žádné'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Časový plán</CardTitle>
                                    <CardDescription>
                                        Podtémata a délka • Celkem: {inputs.times?.reduce((acc, curr) => acc + (curr?.time || 0), 0) ?? 0} min
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => append({ subtheme: '', time: 0 })}
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Přidat
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((row, index) => (
                                <div key={row.id} className="flex gap-3 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor={`subtheme-${index}`}>Podtéma</Label>
                                        <Input
                                            id={`subtheme-${index}`}
                                            {...register(`times.${index}.subtheme`)}
                                            placeholder="Např. Definice"
                                        />
                                    </div>
                                    <div className="w-32 space-y-2">
                                        <Label htmlFor={`time-${index}`}>Min</Label>
                                        <Input
                                            id={`time-${index}`}
                                            type="number"
                                            {...register(`times.${index}.time`, { valueAsNumber: true })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Obsah</CardTitle>
                            <CardDescription>Text přípravy ve formátu Markdown</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="content">Markdown</Label>
                                <Textarea
                                    id="content"
                                    {...register('content')}
                                    placeholder="Formátovaný text (.md)"
                                    rows={14}
                                    className="font-mono"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap gap-3 pb-6">
                        <Button type="submit" className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Uložit
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!initialData?.id}
                            onClick={() => window.open(`/preparations/${initialData?.id}/export`, '_blank')}
                        >
                            Exportovat do PDF
                        </Button>
                    </div>
                </form>

                {/* Right - preview */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Náhled</CardTitle>
                        <CardDescription>Jak bude příprava vypadat po uložení</CardDescription>
                    </CardHeader>
                    <CardContent className="prose max-w-none overflow-auto">
                        <h1>{inputs.name}</h1>
                        <p><strong>Ročník:</strong> {inputs.gradeId ? gradeName : ''}</p>
                        <p><strong>Předmět:</strong> {inputs.fieldId ? fieldName : ''}</p>
                        {inputs.goals ? <p><strong>Cíle:</strong> {inputs.goals}</p> : ''}
                        {inputs.teachingAids ? <p><strong>Pomůcky:</strong> {inputs.teachingAids}</p> : ''}
                        <p><strong>Celkový čas:</strong> {inputs.totalTime} minut</p>
                        <h2>Časy</h2>
                        <ul>
                            {(inputs.times ?? []).map((o, idx) => (
                                <li key={`${o.subtheme}-${idx}`}>{o.subtheme} – {o.time} minut</li>
                            ))}
                        </ul>
                        <h2>RVP</h2>
                        <ul>
                            {RVPs.map((rvp) => <li key={rvp}>{rvp}</li>)}
                        </ul>
                        <hr />
                        <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

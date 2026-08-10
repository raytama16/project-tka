'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { InlineMath } from 'react-katex'

type QuestionType =
    | 'multiple_choice'
    | 'complex_multiple_choice'
    | 'true_false_matrix'

type OptionsObject = Record<string, string>

type CorrectAnswerMatrix = Record<string, string>

export default function EditQuestionPage({
    params,
}: {
    params: Promise<{ questionId: string }>
}) {
    const resolvedParams = use(params)
    const questionId = resolvedParams.questionId

    const router = useRouter()
    const supabase = createClient()

    // ==============================
    // STATE
    // ==============================

    const [chapterId, setChapterId] = useState<string>('')

    const [qText, setQText] = useState<string>('')

    const [qType, setQType] = useState<QuestionType>(
        'multiple_choice'
    )

    const [qExplanation, setQExplanation] = useState<string>('')

    const [optionsObj, setOptionsObj] = useState<OptionsObject>({})

    const [correctAnsMC, setCorrectAnsMC] =
        useState<string>('A')

    const [correctAnsComplex, setCorrectAnsComplex] =
        useState<string[]>([])

    const [correctAnsMatrix, setCorrectAnsMatrix] =
        useState<CorrectAnswerMatrix>({})

    const [loading, setLoading] = useState<boolean>(true)

    const [submitting, setSubmitting] =
        useState<boolean>(false)

    const [errorMessage, setErrorMessage] =
        useState<string>('')


    // ==============================
    // LOAD DATA SOAL
    // ==============================

    useEffect(() => {
        let mounted = true

        const fetchQuestion = async () => {
            try {
                setLoading(true)
                setErrorMessage('')

                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('id', questionId)
                    .single()

                if (error) {
                    console.error(
                        'Error mengambil soal:',
                        error
                    )

                    if (mounted) {
                        setErrorMessage(
                            'Data soal tidak ditemukan.'
                        )
                        setLoading(false)
                    }

                    return
                }

                if (!data) {
                    if (mounted) {
                        setErrorMessage(
                            'Data soal tidak ditemukan.'
                        )
                        setLoading(false)
                    }

                    return
                }

                console.log(
                    'Data soal yang berhasil diambil:',
                    data
                )

                if (!mounted) return

                // ==============================
                // ISI DATA KE FORM
                // ==============================

                setChapterId(
                    data.chapter_id
                        ? String(data.chapter_id)
                        : ''
                )

                setQText(
                    data.question_text || ''
                )

                setQType(
                    data.question_type ||
                        'multiple_choice'
                )

                setQExplanation(
                    data.explanation || ''
                )

                // ==============================
                // OPTIONS
                // ==============================

                const loadedOptions =
                    data.options &&
                    typeof data.options === 'object'
                        ? data.options
                        : {}

                setOptionsObj(loadedOptions)

                // ==============================
                // CORRECT ANSWER
                // ==============================

                if (
                    data.question_type ===
                    'multiple_choice'
                ) {
                    setCorrectAnsMC(
                        typeof data.correct_answer ===
                            'string'
                            ? data.correct_answer
                            : 'A'
                    )
                }

                else if (
                    data.question_type ===
                    'complex_multiple_choice'
                ) {
                    setCorrectAnsComplex(
                        Array.isArray(
                            data.correct_answer
                        )
                            ? data.correct_answer
                            : []
                    )
                }

                else if (
                    data.question_type ===
                    'true_false_matrix'
                ) {
                    setCorrectAnsMatrix(
                        data.correct_answer &&
                            typeof data.correct_answer ===
                                'object'
                            ? data.correct_answer
                            : {}
                    )
                }

                setLoading(false)

            } catch (err) {
                console.error(
                    'Unexpected error:',
                    err
                )

                if (mounted) {
                    setErrorMessage(
                        'Terjadi kesalahan saat mengambil data soal.'
                    )

                    setLoading(false)
                }
            }
        }

        fetchQuestion()

        return () => {
            mounted = false
        }

    }, [questionId])


    // ==============================
    // RENDER MATH
    // ==============================

    const renderMathText = (
        text: string
    ) => {
        if (!text) return null

        const parts =
            text.split(/(\$.*?\$)/g)

        return (
            <span>
                {parts.map(
                    (part, index) => {
                        if (
                            part.startsWith('$') &&
                            part.endsWith('$')
                        ) {
                            const mathContent =
                                part.slice(
                                    1,
                                    -1
                                )

                            return (
                                <InlineMath
                                    key={index}
                                    math={
                                        mathContent
                                    }
                                />
                            )
                        }

                        return (
                            <span key={index}>
                                {part}
                            </span>
                        )
                    }
                )}
            </span>
        )
    }


    // ==============================
    // TAMBAH OPSI PILIHAN GANDA
    // ==============================

    const addMcOption = () => {
        const keys =
            Object.keys(optionsObj)

        const nextKey =
            String.fromCharCode(
                65 + keys.length
            )

        setOptionsObj(
            prev => ({
                ...prev,
                [nextKey]: '',
            })
        )
    }


    // ==============================
    // HAPUS OPSI PILIHAN GANDA
    // ==============================

    const removeMcOption = (
        key: string
    ) => {
        const keys =
            Object.keys(optionsObj)

        if (keys.length <= 2) {
            alert(
                'Minimal harus ada 2 opsi!'
            )
            return
        }

        const updated = {
            ...optionsObj,
        }

        delete updated[key]

        setOptionsObj(updated)

        // Jika opsi yang dihapus adalah
        // jawaban benar
        if (correctAnsMC === key) {
            const remainingKeys =
                Object.keys(updated)

            setCorrectAnsMC(
                remainingKeys[0] || 'A'
            )
        }

        // Hapus dari jawaban kompleks
        setCorrectAnsComplex(
            prev =>
                prev.filter(
                    item => item !== key
                )
        )
    }


    // ==============================
    // TAMBAH PERNYATAAN MATRIX
    // ==============================

    const addMatrixStatement = () => {
        const nextKey =
            `stmt_${Date.now()}`

        setOptionsObj(
            prev => ({
                ...prev,
                [nextKey]: '',
            })
        )

        setCorrectAnsMatrix(
            prev => ({
                ...prev,
                [nextKey]: 'Benar',
            })
        )
    }


    // ==============================
    // HAPUS PERNYATAAN MATRIX
    // ==============================

    const removeMatrixStatement = (
        key: string
    ) => {
        const keys =
            Object.keys(optionsObj)

        if (keys.length <= 1) {
            alert(
                'Minimal harus ada 1 pernyataan!'
            )
            return
        }

        const updated = {
            ...optionsObj,
        }

        delete updated[key]

        setOptionsObj(updated)

        const updatedAnswers = {
            ...correctAnsMatrix,
        }

        delete updatedAnswers[key]

        setCorrectAnsMatrix(
            updatedAnswers
        )
    }


    // ==============================
    // UPDATE SOAL
    // ==============================

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault()

        if (!qText.trim()) {
            alert(
                'Teks soal tidak boleh kosong!'
            )
            return
        }

        if (
            Object.keys(optionsObj).length ===
            0
        ) {
            alert(
                'Opsi jawaban tidak boleh kosong!'
            )
            return
        }

        // ==============================
        // TENTUKAN JAWABAN BENAR
        // ==============================

        let finalCorrectAnswer: any = null

        if (
            qType === 'multiple_choice'
        ) {
            finalCorrectAnswer =
                correctAnsMC
        }

        else if (
            qType ===
            'complex_multiple_choice'
        ) {
            finalCorrectAnswer =
                correctAnsComplex
        }

        else if (
            qType ===
            'true_false_matrix'
        ) {
            finalCorrectAnswer =
                correctAnsMatrix
        }


        // ==============================
        // SUBMIT
        // ==============================

        setSubmitting(true)

        const {
            error,
        } = await supabase
            .from('questions')
            .update({
                question_text:
                    qText.trim(),

                question_type:
                    qType,

                options:
                    optionsObj,

                correct_answer:
                    finalCorrectAnswer,

                explanation:
                    qExplanation.trim(),
            })
            .eq(
                'id',
                questionId
            )


        // ==============================
        // SUCCESS
        // ==============================

        if (!error) {
            alert(
                'Soal berhasil diperbarui!'
            )

            router.push(
                `/admin/practice/${chapterId}`
            )

            router.refresh()

        }

        // ==============================
        // ERROR
        // ==============================

        else {
            console.error(
                'Update error:',
                error
            )

            alert(
                'Gagal memperbarui soal: ' +
                error.message
            )

            setSubmitting(false)
        }
    }


    // ==============================
    // LOADING
    // ==============================

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">

                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-blue-600 font-semibold">
                        Memuat data soal...
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                        ID Soal: {questionId}
                    </p>

                </div>

            </main>
        )
    }


    // ==============================
    // ERROR
    // ==============================

    if (errorMessage) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-red-100 text-center max-w-md w-full">

                    <div className="text-4xl mb-4">
                        ⚠️
                    </div>

                    <h2 className="text-lg font-extrabold text-gray-900 mb-2">
                        Data Tidak Ditemukan
                    </h2>

                    <p className="text-sm text-gray-500 mb-6">
                        {errorMessage}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            router.back()
                        }
                        className="px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold"
                    >
                        Kembali
                    </button>

                </div>

            </main>
        )
    }


    // ==============================
    // FORM EDIT
    // ==============================

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center">

            <div className="w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col gap-6">

                {/* ==============================
                    HEADER
                ============================== */}

                <div className="flex items-center justify-between gap-4">

                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900">
                            Edit Soal
                        </h1>

                        <p className="text-xs text-gray-400 mt-1">
                            ID: {questionId}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.back()
                        }
                        className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition"
                    >
                        Kembali
                    </button>

                </div>


                {/* ==============================
                    FORM
                ============================== */}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5"
                >

                    {/* ==============================
                        TIPE SOAL
                    ============================== */}

                    <div>

                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Tipe Soal
                        </label>

                        <select
                            disabled
                            value={qType}
                            className="w-full p-3 border border-gray-200 rounded-2xl text-sm font-medium bg-gray-100 text-gray-500 cursor-not-allowed"
                        >

                            <option value="multiple_choice">
                                Pilihan Ganda
                            </option>

                            <option value="complex_multiple_choice">
                                Pilihan Ganda Kompleks
                            </option>

                            <option value="true_false_matrix">
                                Matriks Benar / Salah
                            </option>

                        </select>

                        <p className="text-[11px] text-gray-400 mt-1">
                            Tipe soal tidak dapat diubah saat edit.
                        </p>

                    </div>


                    {/* ==============================
                        TEKS SOAL
                    ============================== */}

                    <div>

                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Teks Soal
                        </label>

                        <textarea
                            required
                            rows={5}
                            value={qText}
                            onChange={e =>
                                setQText(
                                    e.target.value
                                )
                            }
                            className="w-full p-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-600 resize-none"
                        />

                        {/* PREVIEW */}

                        {qText && (
                            <div className="mt-2 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-sm text-blue-900">

                                <span className="font-bold block mb-2">
                                    Pratinjau Soal:
                                </span>

                                <div className="whitespace-pre-wrap">
                                    {renderMathText(
                                        qText
                                    )}
                                </div>

                            </div>
                        )}

                    </div>


                    {/* ==============================
                        PILIHAN GANDA
                    ============================== */}

                    {(qType ===
                        'multiple_choice' ||
                        qType ===
                            'complex_multiple_choice') && (

                        <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">

                            <div className="flex items-center justify-between">

                                <span className="text-xs font-bold text-gray-700 uppercase">
                                    Opsi Jawaban
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        addMcOption
                                    }
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                                >
                                    + Tambah Opsi
                                </button>

                            </div>


                            {/* OPTIONS */}

                            {Object.entries(
                                optionsObj
                            ).map(
                                (
                                    [
                                        key,
                                        val,
                                    ]
                                ) => (

                                    <div
                                        key={key}
                                        className="flex items-center gap-3"
                                    >

                                        {/* KEY */}

                                        <span className="w-9 h-9 shrink-0 rounded-lg bg-white border flex items-center justify-center text-xs font-bold">
                                            {key}
                                        </span>


                                        {/* VALUE */}

                                        <input
                                            type="text"
                                            required
                                            value={
                                                val
                                            }
                                            onChange={e =>
                                                setOptionsObj(
                                                    prev => ({
                                                        ...prev,
                                                        [key]:
                                                            e
                                                                .target
                                                                .value,
                                                    })
                                                )
                                            }
                                            className="flex-1 min-w-0 p-2.5 bg-white border rounded-xl text-xs focus:outline-none focus:border-blue-500"
                                        />


                                        {/* SINGLE ANSWER */}

                                        {qType ===
                                            'multiple_choice' && (

                                            <label className="flex shrink-0 items-center gap-1 text-xs font-bold text-green-700 cursor-pointer bg-green-50 px-3 py-2 rounded-xl border border-green-100">

                                                <input
                                                    type="radio"
                                                    name="mc"
                                                    checked={
                                                        correctAnsMC ===
                                                        key
                                                    }
                                                    onChange={() =>
                                                        setCorrectAnsMC(
                                                            key
                                                        )
                                                    }
                                                />

                                                Kunci

                                            </label>
                                        )}


                                        {/* COMPLEX ANSWER */}

                                        {qType ===
                                            'complex_multiple_choice' && (

                                            <label className="flex shrink-0 items-center gap-1 text-xs font-bold text-purple-700 cursor-pointer bg-purple-50 px-3 py-2 rounded-xl border border-purple-100">

                                                <input
                                                    type="checkbox"
                                                    checked={correctAnsComplex.includes(
                                                        key
                                                    )}
                                                    onChange={() => {

                                                        if (
                                                            correctAnsComplex.includes(
                                                                key
                                                            )
                                                        ) {
                                                            setCorrectAnsComplex(
                                                                prev =>
                                                                    prev.filter(
                                                                        k =>
                                                                            k !==
                                                                            key
                                                                    )
                                                            )
                                                        }

                                                        else {
                                                            setCorrectAnsComplex(
                                                                prev => [
                                                                    ...prev,
                                                                    key,
                                                                ]
                                                            )
                                                        }

                                                    }}
                                                />

                                                Benar

                                            </label>
                                        )}


                                        {/* DELETE */}

                                        {Object.keys(
                                            optionsObj
                                        ).length >
                                            2 && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeMcOption(
                                                        key
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                                            >
                                                Hapus
                                            </button>
                                        )}

                                    </div>
                                )
                            )}

                        </div>
                    )}


                    {/* ==============================
                        MATRIX
                    ============================== */}

                    {qType ===
                        'true_false_matrix' && (

                        <div className="flex flex-col gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">

                            <div className="flex items-center justify-between">

                                <span className="text-xs font-bold text-blue-900 uppercase">
                                    Pernyataan Matriks
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        addMatrixStatement
                                    }
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                                >
                                    + Tambah Pernyataan
                                </button>

                            </div>


                            {Object.entries(
                                optionsObj
                            ).map(
                                (
                                    [
                                        stKey,
                                        stText,
                                    ]
                                ) => (

                                    <div
                                        key={stKey}
                                        className="flex gap-3 p-3 bg-white border rounded-xl items-center"
                                    >

                                        {/* STATEMENT */}

                                        <input
                                            type="text"
                                            required
                                            value={
                                                stText
                                            }
                                            onChange={e =>
                                                setOptionsObj(
                                                    prev => ({
                                                        ...prev,
                                                        [stKey]:
                                                            e
                                                                .target
                                                                .value,
                                                    })
                                                )
                                            }
                                            className="flex-1 p-2 bg-gray-50 border rounded-lg text-xs focus:outline-none focus:border-blue-500"
                                        />


                                        {/* TRUE / FALSE */}

                                        <select
                                            value={
                                                correctAnsMatrix[
                                                    stKey
                                                ] ||
                                                'Benar'
                                            }
                                            onChange={e =>
                                                setCorrectAnsMatrix(
                                                    prev => ({
                                                        ...prev,
                                                        [stKey]:
                                                            e
                                                                .target
                                                                .value,
                                                    })
                                                )
                                            }
                                            className="p-2 bg-gray-50 border rounded-lg text-xs font-bold"
                                        >

                                            <option value="Benar">
                                                Benar
                                            </option>

                                            <option value="Salah">
                                                Salah
                                            </option>

                                        </select>


                                        {/* DELETE */}

                                        {Object.keys(
                                            optionsObj
                                        ).length >
                                            1 && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeMatrixStatement(
                                                        stKey
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                                            >
                                                Hapus
                                            </button>
                                        )}

                                    </div>
                                )
                            )}

                        </div>
                    )}


                    {/* ==============================
                        PEMBAHASAN
                    ============================== */}

                    <div>

                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Pembahasan
                            <span className="font-normal text-gray-400">
                                {' '}
                                (Opsional)
                            </span>
                        </label>

                        <textarea
                            rows={5}
                            value={
                                qExplanation
                            }
                            onChange={e =>
                                setQExplanation(
                                    e.target.value
                                )
                            }
                            className="w-full p-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-600 resize-none"
                        />

                        {/* PREVIEW PEMBAHASAN */}

                        {qExplanation && (
                            <div className="mt-2 p-4 bg-green-50/50 border border-green-100 rounded-xl text-sm text-green-900">

                                <span className="font-bold block mb-2">
                                    Pratinjau Pembahasan:
                                </span>

                                <div className="whitespace-pre-wrap">
                                    {renderMathText(
                                        qExplanation
                                    )}
                                </div>

                            </div>
                        )}

                    </div>


                    {/* ==============================
                        ACTION
                    ============================== */}

                    <div className="flex gap-3 justify-end pt-2">

                        <button
                            type="button"
                            onClick={() =>
                                router.back()
                            }
                            disabled={
                                submitting
                            }
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold disabled:opacity-50"
                        >
                            Batal
                        </button>


                        <button
                            type="submit"
                            disabled={
                                submitting
                            }
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
                        >

                            {submitting
                                ? 'Menyimpan...'
                                : 'Simpan Perubahan'}

                        </button>

                    </div>

                </form>

            </div>

        </main>
    )
}
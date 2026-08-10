'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InlineMath } from 'react-katex'

type QuestionType =
    | 'multiple_choice'
    | 'complex_multiple_choice'
    | 'true_false_matrix'

type OptionsObject = Record<string, string>

type MatrixAnswer = Record<string, string>

export default function EditQuestionPage() {
    const router = useRouter()
    const params = useParams()

    /*
     * Route:
     *
     * /question/[questionId]/edit
     *
     * Maka params.questionId berisi UUID soal.
     */
    const questionId = params.questionid as string

    const supabase = createClient()

    // =====================================================
    // STATE
    // =====================================================

    const [chapterId, setChapterId] = useState<string>('')

    const [qText, setQText] = useState<string>('')

    const [qType, setQType] =
        useState<QuestionType>('multiple_choice')

    const [qExplanation, setQExplanation] =
        useState<string>('')

    const [optionsObj, setOptionsObj] =
        useState<OptionsObject>({})

    const [correctAnsMC, setCorrectAnsMC] =
        useState<string>('A')

    const [correctAnsComplex, setCorrectAnsComplex] =
        useState<string[]>([])

    const [correctAnsMatrix, setCorrectAnsMatrix] =
        useState<MatrixAnswer>({})

    const [loading, setLoading] =
        useState<boolean>(true)

    const [submitting, setSubmitting] =
        useState<boolean>(false)

    const [errorMessage, setErrorMessage] =
        useState<string>('')


    // =====================================================
    // FETCH DATA SOAL
    // =====================================================

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                setLoading(true)
                setErrorMessage('')

                console.log('================================')
                console.log('EDIT QUESTION')
                console.log('PARAMS:', params)
                console.log('QUESTION ID:', questionId)
                console.log('================================')

                // ---------------------------------------------
                // Pastikan questionId ada
                // ---------------------------------------------

                if (!questionId) {
                    console.error(
                        'QUESTION ID UNDEFINED'
                    )

                    setErrorMessage(
                        'Question ID tidak ditemukan dari URL.'
                    )

                    setLoading(false)
                    return
                }

                // ---------------------------------------------
                // Ambil data dari Supabase
                // ---------------------------------------------

                const {
                    data,
                    error,
                } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('id', questionId)
                    .maybeSingle()

                console.log('================================')
                console.log('HASIL QUERY')
                console.log('DATA:', data)
                console.log('ERROR:', error)
                console.log('================================')

                // ---------------------------------------------
                // Supabase error
                // ---------------------------------------------

                if (error) {
                    console.error(
                        'SUPABASE ERROR:',
                        error
                    )

                    setErrorMessage(
                        error.message ||
                        'Gagal mengambil data soal.'
                    )

                    setLoading(false)
                    return
                }

                // ---------------------------------------------
                // Data tidak ditemukan
                // ---------------------------------------------

                if (!data) {
                    console.error(
                        'DATA SOAL TIDAK DITEMUKAN'
                    )

                    setErrorMessage(
                        `Soal dengan ID ${questionId} tidak ditemukan.`
                    )

                    setLoading(false)
                    return
                }

                console.log(
                    'DATA SOAL BERHASIL DITEMUKAN:',
                    data
                )

                // =================================================
                // ISI DATA DASAR KE FORM
                // =================================================

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


                // =================================================
                // PARSE OPTIONS
                // =================================================
                //
                // Data kamu saat ini terlihat seperti:
                //
                // "options": "{\"A\":\"...\",\"B\":\"...\"}"
                //
                // Jadi harus JSON.parse terlebih dahulu.
                // =================================================

                let parsedOptions: OptionsObject = {}

                if (
                    typeof data.options === 'string'
                ) {
                    try {
                        parsedOptions =
                            JSON.parse(
                                data.options
                            )
                    } catch (error) {
                        console.error(
                            'Gagal parse options:',
                            error
                        )

                        parsedOptions = {}
                    }
                } else if (
                    data.options &&
                    typeof data.options === 'object'
                ) {
                    parsedOptions =
                        data.options as OptionsObject
                }

                setOptionsObj(
                    parsedOptions
                )


                // =================================================
                // PARSE CORRECT ANSWER
                // =================================================
                //
                // Data kamu:
                //
                // "correct_answer": "[\"A\", \"B\"]"
                //
                // Maka perlu JSON.parse.
                // =================================================

                let parsedCorrectAnswer: any =
                    data.correct_answer

                if (
                    typeof parsedCorrectAnswer ===
                    'string'
                ) {
                    try {
                        parsedCorrectAnswer =
                            JSON.parse(
                                parsedCorrectAnswer
                            )
                    } catch {
                        // Jika bukan JSON,
                        // biarkan sebagai string.
                    }
                }


                // =================================================
                // SET JAWABAN BERDASARKAN TIPE SOAL
                // =================================================

                if (
                    data.question_type ===
                    'multiple_choice'
                ) {
                    setCorrectAnsMC(
                        typeof parsedCorrectAnswer ===
                        'string'
                            ? parsedCorrectAnswer
                            : 'A'
                    )
                }

                else if (
                    data.question_type ===
                    'complex_multiple_choice'
                ) {
                    setCorrectAnsComplex(
                        Array.isArray(
                            parsedCorrectAnswer
                        )
                            ? parsedCorrectAnswer
                            : []
                    )
                }

                else if (
                    data.question_type ===
                    'true_false_matrix'
                ) {
                    setCorrectAnsMatrix(
                        parsedCorrectAnswer &&
                        typeof parsedCorrectAnswer ===
                        'object'
                            ? parsedCorrectAnswer
                            : {}
                    )
                }


                // =================================================
                // SELESAI
                // =================================================

                setLoading(false)

            } catch (error) {
                console.error(
                    'FETCH QUESTION ERROR:',
                    error
                )

                setErrorMessage(
                    'Terjadi kesalahan saat mengambil data soal.'
                )

                setLoading(false)
            }
        }

        fetchQuestion()

        // Hanya jalankan ulang ketika ID berubah.
        // Tidak memasukkan supabase karena createClient()
        // dibuat di dalam component.
    }, [questionId])


    // =====================================================
    // RENDER TEXT + LATEX
    // =====================================================

    const renderMathText = (
        text: string
    ) => {
        if (!text) return null

        const parts =
            text.split(/(\$.*?\$)/g)

        return (
            <span>
                {parts.map(
                    (
                        part,
                        index
                    ) => {
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
                                    math={mathContent}
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


    // =====================================================
    // TAMBAH OPSI
    // =====================================================

    const addMcOption = () => {
        const existingKeys =
            Object.keys(optionsObj)

        /*
         * Cari huruf berikutnya.
         *
         * A, B, C, D, E, dst.
         */

        let nextKey = 'A'

        for (
            let i = 0;
            i < 26;
            i++
        ) {
            const key =
                String.fromCharCode(
                    65 + i
                )

            if (
                !existingKeys.includes(
                    key
                )
            ) {
                nextKey = key
                break
            }
        }

        setOptionsObj(
            prev => ({
                ...prev,
                [nextKey]: '',
            })
        )
    }


    // =====================================================
    // HAPUS OPSI
    // =====================================================

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

        setOptionsObj(
            updated
        )


        // ---------------------------------------------
        // Jika jawaban MC yang dihapus
        // ---------------------------------------------

        if (
            correctAnsMC === key
        ) {
            const remainingKeys =
                Object.keys(
                    updated
                )

            setCorrectAnsMC(
                remainingKeys[0] || 'A'
            )
        }


        // ---------------------------------------------
        // Hapus dari jawaban kompleks
        // ---------------------------------------------

        setCorrectAnsComplex(
            prev =>
                prev.filter(
                    item =>
                        item !== key
                )
        )
    }


    // =====================================================
    // TAMBAH PERNYATAAN MATRIX
    // =====================================================

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


    // =====================================================
    // HAPUS PERNYATAAN MATRIX
    // =====================================================

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

        setOptionsObj(
            updated
        )


        const updatedAnswers = {
            ...correctAnsMatrix,
        }

        delete updatedAnswers[key]

        setCorrectAnsMatrix(
            updatedAnswers
        )
    }


    // =====================================================
    // HANDLE SUBMIT
    // =====================================================

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault()

        // ---------------------------------------------
        // Validasi ID
        // ---------------------------------------------

        if (!questionId) {
            alert(
                'Question ID tidak ditemukan.'
            )
            return
        }


        // ---------------------------------------------
        // Validasi teks soal
        // ---------------------------------------------

        if (!qText.trim()) {
            alert(
                'Teks soal tidak boleh kosong!'
            )
            return
        }


        // ---------------------------------------------
        // Validasi opsi
        // ---------------------------------------------

        if (
            Object.keys(optionsObj)
                .length === 0
        ) {
            alert(
                'Opsi jawaban tidak boleh kosong!'
            )
            return
        }


        // ---------------------------------------------
        // Tentukan correct_answer
        // ---------------------------------------------

        let finalCorrectAnswer: any = null

        if (
            qType ===
            'multiple_choice'
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


        console.log(
            '================================'
        )

        console.log(
            'UPDATE QUESTION'
        )

        console.log(
            'ID:',
            questionId
        )

        console.log(
            'OPTIONS:',
            optionsObj
        )

        console.log(
            'CORRECT ANSWER:',
            finalCorrectAnswer
        )

        console.log(
            '================================'
        )


        setSubmitting(true)


        // =================================================
        // UPDATE DATABASE
        // =================================================

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


        // =================================================
        // ERROR
        // =================================================

        if (error) {
            console.error(
                'UPDATE ERROR:',
                error
            )

            alert(
                `Gagal memperbarui soal:\n${error.message}`
            )

            setSubmitting(false)

            return
        }


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            'Soal berhasil diperbarui!'
        )


        /*
         * Kembali ke halaman chapter.
         */

        if (chapterId) {
            router.push(
                `/admin/practice/${chapterId}`
            )
        } else {
            router.back()
        }

        router.refresh()
    }


    // =====================================================
    // LOADING SCREEN
    // =====================================================

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">

                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-blue-600 font-semibold">
                        Memuat data soal...
                    </p>

                    <p className="text-xs text-gray-400 mt-2 break-all">
                        ID: {questionId || 'undefined'}
                    </p>

                </div>

            </main>
        )
    }


    // =====================================================
    // ERROR SCREEN
    // =====================================================

    if (errorMessage) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

                <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-sm border border-red-100">

                    <div className="text-center">

                        <div className="text-5xl mb-4">
                            ⚠️
                        </div>

                        <h1 className="text-xl font-extrabold text-gray-900">
                            Gagal Memuat Soal
                        </h1>

                        <p className="text-sm text-gray-500 mt-2">
                            {errorMessage}
                        </p>

                    </div>


                    {/* DEBUG */}

                    <div className="mt-6 p-4 bg-gray-900 rounded-2xl">

                        <p className="text-[11px] font-bold text-gray-400 uppercase">
                            Question ID
                        </p>

                        <p className="mt-1 text-xs text-green-400 break-all">
                            {questionId ||
                                'undefined'}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            router.back()
                        }
                        className="w-full mt-5 px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition"
                    >
                        Kembali
                    </button>

                </div>

            </main>
        )
    }


    // =====================================================
    // FORM EDIT
    // =====================================================

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center">

            <div className="w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex items-center justify-between gap-4 mb-6">

                    <div>

                        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">
                            Edit Soal
                        </h1>

                        <p className="text-xs text-gray-400 mt-1 break-all">
                            ID: {questionId}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            router.back()
                        }
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                    >
                        Kembali
                    </button>

                </div>


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5"
                >

                    {/* =================================================
                        TIPE SOAL
                    ================================================= */}

                    <div>

                        <label className="block text-xs font-bold text-gray-700 mb-2">
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
                            Tipe soal tidak diubah ketika melakukan edit.
                        </p>

                    </div>


                    {/* =================================================
                        TEKS SOAL
                    ================================================= */}

                    <div>

                        <label className="block text-xs font-bold text-gray-700 mb-2">
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
                                    Pratinjau:
                                </span>

                                <div className="whitespace-pre-wrap">
                                    {renderMathText(
                                        qText
                                    )}
                                </div>

                            </div>
                        )}

                    </div>


                    {/* =================================================
                        PILIHAN GANDA / KOMPLEKS
                    ================================================= */}

                    {(qType ===
                        'multiple_choice' ||
                        qType ===
                            'complex_multiple_choice') && (

                        <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">

                            {/* HEADER */}

                            <div className="flex items-center justify-between gap-3">

                                <span className="text-xs font-bold text-gray-700 uppercase">
                                    Opsi Jawaban
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        addMcOption
                                    }
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
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
                                        value,
                                    ]
                                ) => (

                                    <div
                                        key={key}
                                        className="flex items-center gap-3"
                                    >

                                        {/* LABEL */}

                                        <span className="w-9 h-9 shrink-0 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                                            {key}
                                        </span>


                                        {/* TEXT */}

                                        <input
                                            type="text"
                                            required
                                            value={
                                                value
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
                                            className="flex-1 min-w-0 p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                                        />


                                        {/* SINGLE CHOICE */}

                                        {qType ===
                                            'multiple_choice' && (

                                            <label className="flex shrink-0 items-center gap-1 text-xs font-bold text-green-700 cursor-pointer bg-green-50 px-3 py-2 rounded-xl border border-green-100">

                                                <input
                                                    type="radio"
                                                    name="mc-answer"
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


                                        {/* COMPLEX CHOICE */}

                                        {qType ===
                                            'complex_multiple_choice' && (

                                            <label className="flex shrink-0 items-center gap-1 text-xs font-bold text-purple-700 cursor-pointer bg-purple-50 px-3 py-2 rounded-xl border border-purple-100">

                                                <input
                                                    type="checkbox"
                                                    checked={correctAnsComplex.includes(
                                                        key
                                                    )}
                                                    onChange={() => {

                                                        setCorrectAnsComplex(
                                                            prev => {

                                                                if (
                                                                    prev.includes(
                                                                        key
                                                                    )
                                                                ) {
                                                                    return prev.filter(
                                                                        item =>
                                                                            item !==
                                                                            key
                                                                    )
                                                                }

                                                                return [
                                                                    ...prev,
                                                                    key,
                                                                ]
                                                            }
                                                        )

                                                    }}
                                                />

                                                Benar

                                            </label>
                                        )}


                                        {/* HAPUS */}

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
                                                className="shrink-0 text-red-500 hover:text-red-700 text-xs font-bold"
                                            >
                                                Hapus
                                            </button>
                                        )}

                                    </div>

                                )
                            )}

                        </div>
                    )}


                    {/* =================================================
                        MATRIX BENAR / SALAH
                    ================================================= */}

                    {qType ===
                        'true_false_matrix' && (

                        <div className="flex flex-col gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">

                            <div className="flex items-center justify-between gap-3">

                                <span className="text-xs font-bold text-blue-900 uppercase">
                                    Pernyataan Matriks
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        addMatrixStatement
                                    }
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
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
                                        className="flex gap-3 p-3 bg-white border border-gray-200 rounded-xl items-center"
                                    >

                                        {/* TEXT */}

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
                                            className="flex-1 min-w-0 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                                        />


                                        {/* BENAR / SALAH */}

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
                                            className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold"
                                        >

                                            <option value="Benar">
                                                Benar
                                            </option>

                                            <option value="Salah">
                                                Salah
                                            </option>

                                        </select>


                                        {/* HAPUS */}

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
                                                className="shrink-0 text-red-500 hover:text-red-700 text-xs font-bold"
                                            >
                                                Hapus
                                            </button>
                                        )}

                                    </div>

                                )
                            )}

                        </div>
                    )}


                    {/* =================================================
                        PEMBAHASAN
                    ================================================= */}

                    <div>

                        <label className="block text-xs font-bold text-gray-700 mb-2">
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


                    {/* =================================================
                        BUTTON
                    ================================================= */}

                    <div className="flex gap-3 justify-end pt-2">

                        <button
                            type="button"
                            disabled={
                                submitting
                            }
                            onClick={() =>
                                router.back()
                            }
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition disabled:opacity-50"
                        >
                            Batal
                        </button>


                        <button
                            type="submit"
                            disabled={
                                submitting
                            }
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
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
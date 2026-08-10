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
     * PENTING:
     *
     * Folder kamu:
     *
     * [questionid]
     *
     * Jadi harus:
     *
     * params.questionid
     *
     * BUKAN params.questionId
     */

    const questionid =
        params.questionid as string

    const supabase = createClient()


    // =====================================================
    // STATE
    // =====================================================

    const [chapterId, setChapterId] =
        useState<string>('')

    const [qText, setQText] =
        useState<string>('')

    const [qType, setQType] =
        useState<QuestionType>(
            'multiple_choice'
        )

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
    // DEBUG
    // =====================================================

    console.log(
        'PARAMS:',
        params
    )

    console.log(
        'QUESTION ID:',
        questionid
    )


    // =====================================================
    // FETCH QUESTION
    // =====================================================

    useEffect(() => {

        const fetchQuestion = async () => {

            try {

                setLoading(true)

                setErrorMessage('')


                console.log(
                    '===================================='
                )

                console.log(
                    'EDIT QUESTION'
                )

                console.log(
                    'PARAMS:',
                    params
                )

                console.log(
                    'QUESTION ID:',
                    questionid
                )

                console.log(
                    '===================================='
                )


                // =================================================
                // CEK QUESTION ID
                // =================================================

                if (!questionid) {

                    console.error(
                        'QUESTION ID UNDEFINED'
                    )

                    setErrorMessage(
                        'Question ID tidak ditemukan dari URL.'
                    )

                    setLoading(false)

                    return
                }


                // =================================================
                // QUERY SUPABASE
                // =================================================

                const {
                    data,
                    error
                } = await supabase
                    .from('questions')
                    .select('*')
                    .eq(
                        'id',
                        questionid
                    )
                    .maybeSingle()


                console.log(
                    'DATA:',
                    data
                )

                console.log(
                    'ERROR:',
                    error
                )


                // =================================================
                // SUPABASE ERROR
                // =================================================

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


                // =================================================
                // DATA TIDAK DITEMUKAN
                // =================================================

                if (!data) {

                    console.error(
                        'DATA TIDAK DITEMUKAN'
                    )

                    setErrorMessage(
                        'Data soal tidak ditemukan.'
                    )

                    setLoading(false)

                    return
                }


                // =================================================
                // DATA DITEMUKAN
                // =================================================

                console.log(
                    'DATA SOAL DITEMUKAN:',
                    data
                )


                // =================================================
                // DATA DASAR
                // =================================================

                setChapterId(
                    data.chapter_id || ''
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

                let parsedOptions: OptionsObject = {}


                if (
                    typeof data.options ===
                    'string'
                ) {

                    try {

                        parsedOptions =
                            JSON.parse(
                                data.options
                            )

                    } catch (error) {

                        console.error(
                            'OPTIONS JSON ERROR:',
                            error
                        )

                        parsedOptions = {}

                    }

                } else if (
                    data.options &&
                    typeof data.options ===
                    'object'
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

                        /*
                         * Jika bukan JSON,
                         * biarkan sebagai string.
                         */

                    }

                }


                // =================================================
                // SET CORRECT ANSWER
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


                if (
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


                if (
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

    }, [questionid])


    // =====================================================
    // RENDER LATEX
    // =====================================================

    const renderMathText = (
        text: string
    ) => {

        if (!text) {
            return null
        }


        const parts =
            text.split(
                /(\$.*?\$)/g
            )


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

                            return (
                                <InlineMath
                                    key={index}
                                    math={
                                        part.slice(
                                            1,
                                            -1
                                        )
                                    }
                                />
                            )

                        }


                        return (
                            <span
                                key={index}
                            >
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

    const addOption = () => {

        const existingKeys =
            Object.keys(
                optionsObj
            )


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
                [nextKey]: ''
            })
        )
    }


    // =====================================================
    // HAPUS OPSI
    // =====================================================

    const removeOption = (
        key: string
    ) => {

        const keys =
            Object.keys(
                optionsObj
            )


        if (
            keys.length <= 2
        ) {

            alert(
                'Minimal harus ada 2 opsi.'
            )

            return
        }


        const updated = {
            ...optionsObj
        }


        delete updated[key]


        setOptionsObj(
            updated
        )


        // ---------------------------------------------
        // Kalau jawaban MC yang dihapus
        // ---------------------------------------------

        if (
            correctAnsMC === key
        ) {

            const remaining =
                Object.keys(
                    updated
                )


            setCorrectAnsMC(
                remaining[0] || 'A'
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
    // TAMBAH MATRIX
    // =====================================================

    const addMatrixStatement = () => {

        const key =
            `stmt_${Date.now()}`


        setOptionsObj(
            prev => ({
                ...prev,
                [key]: ''
            })
        )


        setCorrectAnsMatrix(
            prev => ({
                ...prev,
                [key]: 'Benar'
            })
        )

    }


    // =====================================================
    // HAPUS MATRIX
    // =====================================================

    const removeMatrixStatement = (
        key: string
    ) => {

        const keys =
            Object.keys(
                optionsObj
            )


        if (
            keys.length <= 1
        ) {

            alert(
                'Minimal harus ada 1 pernyataan.'
            )

            return
        }


        const updated = {
            ...optionsObj
        }


        delete updated[key]


        setOptionsObj(
            updated
        )


        const updatedAnswers = {
            ...correctAnsMatrix
        }


        delete updatedAnswers[key]


        setCorrectAnsMatrix(
            updatedAnswers
        )

    }


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault()


        if (!questionid) {

            alert(
                'Question ID tidak ditemukan.'
            )

            return
        }


        if (!qText.trim()) {

            alert(
                'Teks soal tidak boleh kosong.'
            )

            return
        }


        if (
            Object.keys(
                optionsObj
            ).length === 0
        ) {

            alert(
                'Opsi jawaban tidak boleh kosong.'
            )

            return
        }


        // =================================================
        // TENTUKAN JAWABAN
        // =================================================

        let finalCorrectAnswer: any


        if (
            qType ===
            'multiple_choice'
        ) {

            finalCorrectAnswer =
                correctAnsMC

        } else if (
            qType ===
            'complex_multiple_choice'
        ) {

            finalCorrectAnswer =
                correctAnsComplex

        } else {

            finalCorrectAnswer =
                correctAnsMatrix

        }


        console.log(
            '===================================='
        )

        console.log(
            'UPDATE QUESTION'
        )

        console.log(
            'ID:',
            questionid
        )

        console.log(
            'DATA:',
            {
                question_text:
                    qText.trim(),

                question_type:
                    qType,

                options:
                    optionsObj,

                correct_answer:
                    finalCorrectAnswer,

                explanation:
                    qExplanation.trim()
            }
        )

        console.log(
            '===================================='
        )


        setSubmitting(true)


        // =================================================
        // UPDATE SUPABASE
        // =================================================

        const {
            error
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
                    qExplanation.trim()

            })
            .eq(
                'id',
                questionid
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


        router.back()

    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

                <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">

                    <div className="w-10 h-10 mx-auto mb-5 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />

                    <h2 className="text-lg font-extrabold text-gray-900">
                        Memuat Soal...
                    </h2>

                    <p className="text-xs text-gray-500 mt-2">
                        Question ID
                    </p>

                    <p className="text-xs text-blue-600 mt-1 break-all">
                        {questionid ||
                            'undefined'}
                    </p>

                </div>

            </main>
        )
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (errorMessage) {

        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

                <div className="w-full max-w-md bg-white rounded-3xl border border-red-100 shadow-sm p-8">

                    <div className="text-center">

                        <div className="text-5xl mb-5">
                            ⚠️
                        </div>

                        <h1 className="text-xl font-extrabold text-gray-900">
                            Gagal Memuat Soal
                        </h1>

                        <p className="text-sm text-gray-500 mt-2">
                            {errorMessage}
                        </p>

                    </div>


                    <div className="mt-6 p-4 bg-gray-900 rounded-2xl">

                        <p className="text-[10px] font-bold text-gray-400">
                            QUESTION ID
                        </p>

                        <p className="mt-1 text-xs text-green-400 break-all">
                            {questionid ||
                                'undefined'}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            router.back()
                        }
                        className="w-full mt-5 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition"
                    >
                        Kembali
                    </button>

                </div>

            </main>
        )
    }


    // =====================================================
    // FORM
    // =====================================================

    return (

        <main className="min-h-screen bg-gray-50 p-4 md:p-8">

            <div className="w-full max-w-3xl mx-auto">

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="flex items-start justify-between gap-4 mb-7">

                        <div>

                            <h1 className="text-2xl font-extrabold text-gray-900">
                                Edit Soal
                            </h1>

                            <p className="text-xs text-gray-400 mt-1 break-all">
                                ID: {questionid}
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


                    <form
                        onSubmit={
                            handleSubmit
                        }
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
                                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 text-sm"
                            >

                                <option value="multiple_choice">
                                    Pilihan Ganda
                                </option>

                                <option value="complex_multiple_choice">
                                    Pilihan Ganda Kompleks
                                </option>

                                <option value="true_false_matrix">
                                    Benar / Salah
                                </option>

                            </select>

                        </div>


                        {/* =================================================
                            TEKS SOAL
                        ================================================= */}

                        <div>

                            <label className="block text-xs font-bold text-gray-700 mb-2">
                                Teks Soal
                            </label>

                            <textarea
                                value={qText}
                                onChange={e =>
                                    setQText(
                                        e.target.value
                                    )
                                }
                                rows={5}
                                className="w-full p-3 border border-gray-300 rounded-xl resize-none bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan teks soal..."
                            />


                            {/* PREVIEW */}

                            {qText && (

                                <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-900">

                                    <p className="font-bold mb-2">
                                        Pratinjau:
                                    </p>

                                    <div className="whitespace-pre-wrap">
                                        {renderMathText(
                                            qText
                                        )}
                                    </div>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            PILIHAN GANDA
                        ================================================= */}

                        {(qType ===
                            'multiple_choice' ||
                            qType ===
                                'complex_multiple_choice') && (

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">


                                {/* HEADER */}

                                <div className="flex items-center justify-between gap-3 mb-4">

                                    <h2 className="text-xs font-bold text-gray-700 uppercase">
                                        Opsi Jawaban
                                    </h2>


                                    <button
                                        type="button"
                                        onClick={
                                            addOption
                                        }
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
                                    >
                                        + Tambah Opsi
                                    </button>

                                </div>


                                {/* OPTIONS */}

                                <div className="flex flex-col gap-3">

                                    {Object.entries(
                                        optionsObj
                                    ).map(
                                        (
                                            [
                                                key,
                                                value
                                            ]
                                        ) => (

                                            <div
                                                key={key}
                                                className="flex items-center gap-2"
                                            >


                                                {/* HURUF */}

                                                <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900">
                                                    {key}
                                                </div>


                                                {/* INPUT */}

                                                <input
                                                    type="text"
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
                                                                        .value
                                                            })
                                                        )
                                                    }
                                                    className="flex-1 min-w-0 p-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder={`Opsi ${key}`}
                                                />


                                                {/* JAWABAN MC */}

                                                {qType ===
                                                    'multiple_choice' && (

                                                    <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl text-xs font-bold text-purple-700 cursor-pointer">

                                                        <input
                                                            type="radio"
                                                            name="correct-answer"
                                                            checked={
                                                                correctAnsMC ===
                                                                key
                                                            }
                                                            onChange={() =>
                                                                setCorrectAnsMC(
                                                                    key
                                                                )
                                                            }
                                                            className="accent-purple-600"
                                                        />

                                                        Benar

                                                    </label>

                                                )}


                                                {/* JAWABAN COMPLEX */}

                                                {qType ===
                                                    'complex_multiple_choice' && (

                                                    <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl text-xs font-bold text-purple-700 cursor-pointer">

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
                                                                            key
                                                                        ]

                                                                    }
                                                                )

                                                            }}
                                                            className="accent-purple-600"
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
                                                            removeOption(
                                                                key
                                                            )
                                                        }
                                                        className="shrink-0 text-xs font-bold text-red-500 hover:text-red-700 transition"
                                                    >
                                                        Hapus
                                                    </button>

                                                )}

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            MATRIX
                        ================================================= */}

                        {qType ===
                            'true_false_matrix' && (

                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">

                                <div className="flex items-center justify-between mb-4">

                                    <h2 className="text-xs font-bold text-blue-900 uppercase">
                                        Pernyataan
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={
                                            addMatrixStatement
                                        }
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                                    >
                                        + Tambah
                                    </button>

                                </div>


                                <div className="flex flex-col gap-3">

                                    {Object.entries(
                                        optionsObj
                                    ).map(
                                        (
                                            [
                                                key,
                                                value
                                            ]
                                        ) => (

                                            <div
                                                key={key}
                                                className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200"
                                            >

                                                <input
                                                    type="text"
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
                                                                        .value
                                                            })
                                                        )
                                                    }
                                                    className="flex-1 min-w-0 p-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Pernyataan..."
                                                />


                                                <select
                                                    value={
                                                        correctAnsMatrix[
                                                            key
                                                        ] ||
                                                        'Benar'
                                                    }
                                                    onChange={e =>
                                                        setCorrectAnsMatrix(
                                                            prev => ({
                                                                ...prev,
                                                                [key]:
                                                                    e
                                                                        .target
                                                                        .value
                                                            })
                                                        )
                                                    }
                                                    className="p-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 text-sm"
                                                >

                                                    <option value="Benar">
                                                        Benar
                                                    </option>

                                                    <option value="Salah">
                                                        Salah
                                                    </option>

                                                </select>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeMatrixStatement(
                                                            key
                                                        )
                                                    }
                                                    className="text-xs font-bold text-red-500 hover:text-red-700"
                                                >
                                                    Hapus
                                                </button>

                                            </div>

                                        )
                                    )}

                                </div>

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
                                value={
                                    qExplanation
                                }
                                onChange={e =>
                                    setQExplanation(
                                        e.target.value
                                    )
                                }
                                rows={6}
                                className="w-full p-3 border border-gray-300 rounded-xl resize-none bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan pembahasan..."
                            />

                        </div>


                        {/* =================================================
                            BUTTON
                        ================================================= */}

                        <div className="flex justify-end gap-3 pt-2">

                            <button
                                type="button"
                                onClick={() =>
                                    router.back()
                                }
                                disabled={
                                    submitting
                                }
                                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition disabled:opacity-50"
                            >
                                Batal
                            </button>


                            <button
                                type="submit"
                                disabled={
                                    submitting
                                }
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
                            >

                                {submitting
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </main>
    )
}
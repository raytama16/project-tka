'use client'

import React, { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import functionPlot from 'function-plot'
import 'katex/dist/katex.min.css'

// Inisialisasi awal Mermaid di sisi client
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
  })
}

// Komponen helper khusus untuk merender blok Mermaid
function MermaidBlock({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      mermaid.run({
        nodes: [containerRef.current],
      }).catch((err) => console.error('Mermaid parsing error:', err))
    }
  }, [chart])

  return (
    <div ref={containerRef} className="mermaid flex justify-center my-4 overflow-x-auto">
      {chart}
    </div>
  )
}

// Komponen helper khusus untuk merender Grafik Fungsi
function FunctionPlotBlock({ fn }: { fn: string }) {
  const rootEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (rootEl.current) {
      try {
        functionPlot({
          target: rootEl.current,
          width: 500,
          height: 300,
          grid: true,
          data: [
            {
              fn: fn.trim(),
              color: 'rgb(37, 99, 235)',
            },
          ],
        })
      } catch (err) {
        console.error('Function plot error:', err)
      }
    }
  }, [fn])

  return (
    <div className="flex justify-center my-4 overflow-x-auto">
      <div ref={rootEl} className="border-2 border-gray-300 rounded-lg bg-white shadow-sm p-2" />
    </div>
  )
}

// Koleksi Komponen SVG Lingkaran Venn Asli
function VennSvgRenderer({ type }: { type: string }) {
  switch (type.trim().toLowerCase()) {
    case 'berpotongan':
      return (
        <div className="flex justify-center my-4">
          <svg width="300" height="180" viewBox="0 0 300 180" className="border-2 border-gray-300 rounded-lg bg-white shadow-sm">
            <text x="15" y="25" className="text-sm font-bold fill-gray-800">U</text>
            <circle cx="110" cy="90" r="55" className="fill-blue-400 fill-opacity-30 stroke-blue-600 stroke-2" />
            <text x="80" y="95" className="text-sm font-bold fill-blue-900">A</text>
            <circle cx="190" cy="90" r="55" className="fill-red-400 fill-opacity-30 stroke-red-600 stroke-2" />
            <text x="210" y="95" className="text-sm font-bold fill-red-900">B</text>
            <text x="135" y="95" className="text-xs font-semibold fill-gray-700">A ∩ B</text>
          </svg>
        </div>
      )
    case 'saling-lepas':
      return (
        <div className="flex justify-center my-4">
          <svg width="300" height="180" viewBox="0 0 300 180" className="border-2 border-gray-300 rounded-lg bg-white shadow-sm">
            <text x="15" y="25" className="text-sm font-bold fill-gray-800">U</text>
            <circle cx="95" cy="90" r="50" className="fill-blue-400 fill-opacity-30 stroke-blue-600 stroke-2" />
            <text x="85" y="95" className="text-sm font-bold fill-blue-900">A</text>
            <circle cx="205" cy="90" r="50" className="fill-red-400 fill-opacity-30 stroke-red-600 stroke-2" />
            <text x="195" y="95" className="text-sm font-bold fill-red-900">B</text>
          </svg>
        </div>
      )
    case 'himpunan-bagian':
      return (
        <div className="flex justify-center my-4">
          <svg width="300" height="180" viewBox="0 0 300 180" className="border-2 border-gray-300 rounded-lg bg-white shadow-sm">
            <text x="15" y="25" className="text-sm font-bold fill-gray-800">U</text>
            <circle cx="150" cy="90" r="70" className="fill-red-400 fill-opacity-20 stroke-red-600 stroke-2" />
            <text x="200" y="55" className="text-sm font-bold fill-red-900">B</text>
            <circle cx="135" cy="95" r="40" className="fill-blue-400 fill-opacity-40 stroke-blue-600 stroke-2" />
            <text x="125" y="100" className="text-sm font-bold fill-blue-900">A</text>
          </svg>
        </div>
      )
    case 'himpunan-sama':
      return (
        <div className="flex justify-center my-4">
          <svg width="300" height="180" viewBox="0 0 300 180" className="border-2 border-gray-300 rounded-lg bg-white shadow-sm">
            <text x="15" y="25" className="text-sm font-bold fill-gray-800">U</text>
            <circle cx="150" cy="90" r="55" className="fill-purple-400 fill-opacity-30 stroke-purple-600 stroke-2" />
            <text x="135" y="95" className="text-sm font-bold fill-purple-900">A = B</text>
          </svg>
        </div>
      )
    case 'tiga-himpunan':
      return (
        <div className="flex justify-center my-4">
          <svg width="320" height="200" viewBox="0 0 320 200" className="border-2 border-gray-300 rounded-lg bg-white shadow-sm">
            <text x="15" y="25" className="text-sm font-bold fill-gray-800">U</text>
            <circle cx="120" cy="85" r="55" className="fill-blue-400 fill-opacity-20 stroke-blue-600 stroke-2" />
            <text x="90" y="65" className="text-sm font-bold fill-blue-900">A</text>
            <circle cx="200" cy="85" r="55" className="fill-red-400 fill-opacity-20 stroke-red-600 stroke-2" />
            <text x="220" y="65" className="text-sm font-bold fill-red-900">B</text>
            <circle cx="160" cy="130" r="55" className="fill-green-400 fill-opacity-20 stroke-green-600 stroke-2" />
            <text x="155" y="170" className="text-sm font-bold fill-green-900">C</text>
          </svg>
        </div>
      )
    default:
      return null
  }
}

export default function MathText({ content, inline = false }: { content: string; inline?: boolean }) {
  if (!content) return null

  // FRONTEND AUTO-SANITIZER: Membersihkan teks rusak, \n mentah, dan LaTeX error secara otomatis
  const processedContent = String(content)
    // 1. Ubah teks literal \n dari database menjadi baris baru asli
    .replace(/\\n/g, '\n')
    // 2. Otomatis memperbaiki keyword LaTeX yang backslash-nya hilang dari database
    .replace(/xmid1/g, '$x \\mid 1$')
    .replace(/xle10/g, '$x \\le 10$')
    .replace(/xtext/g, '$\\text')
    // 3. Membersihkan escape backslash berlebih yang bikin opsi jadi \{ \{ 
    .replace(/\\\\\{/g, '{')
    .replace(/\\\\\}/g, '}')

  return (
    <div className={`prose prose-slate max-w-none whitespace-pre-line ${inline ? 'inline-block [&>p]:m-0' : 'leading-relaxed'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-2 text-gray-900" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-gray-800" {...props} />,
          p: ({ node, ...props }) => <p className={inline ? 'm-0 inline' : 'mb-2 text-gray-700 leading-relaxed'} {...props} />,
          
          // Mematikan styling list bawaan yang sering bikin jarak renggang
          ul: ({ node, ...props }) => <ul className="my-2 space-y-1 text-gray-700" {...props} />,
          ol: ({ node, ...props }) => <ol className="my-2 space-y-1 text-gray-700" {...props} />,
          li: ({ node, ...props }) => <li className="text-gray-700 my-0 [&>p]:my-0" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
          
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300 text-left text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
          th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-900" {...props} />,
          td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />,

          code: ({ node, inline, className, children, ...props }: any) => {
            const codeString = String(children).replace(/\n$/, '')
            const mermaidMatch = /language-mermaid/.exec(className || '')
            const vennMatch = /language-venn/.exec(className || '')
            const functionPlotMatch = /language-function-plot/.exec(className || '')

            if (!inline && vennMatch) {
              return <VennSvgRenderer type={codeString} />
            }

            if (!inline && mermaidMatch) {
              return <MermaidBlock chart={codeString} />
            }

            if (!inline && functionPlotMatch) {
              return <FunctionPlotBlock fn={codeString} />
            }

            return inline ? (
              <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm leading-tight">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            )
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
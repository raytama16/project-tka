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
              color: 'rgb(41, 103, 238)',
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

// FRONTEND AUTO-SANITIZER: Membersihkan teks rusak & anomali $$ secara total
  const processedContent = String(content)
    // .replace(/\\n/g, '\n')
    // Membersihkan secara paksa semua anomali teks yang nempel ke $$ atau \subseteq yang rusak
    .replace(/([a-zA-Z0-9_]+)\$\$([A-Za-z\\])/g, '$1 $$ $2')
    .replace(/ot\\subseteq/g, 'A \\subseteq')
    // Mengubah $$ yang nyasar di tengah kalimat menjadi $ tunggal agar aman dibaca parser
    .replace(/\$\$([^$]+?)\$\$/g, (match, p1) => {
      if (!p1.includes('\n')) {
        return `$${p1.trim()}$`
      }
      return match
    })
    .replace(/xmid1/g, '$x \\mid 1$')
    .replace(/xle10/g, '$x \\le 10$')
    .replace(/xtext/g, '$\\text')
    .replace(/\\\\\{/g, '{')
    .replace(/\\\\\}/g, '}')

  return (
    // <div className={`prose prose-slate max-w-none text-slate-800 ${inline ? 'inline-block [&>p]:m-0' : 'my-1'}`}>
    <div className={`prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 ${inline ? 'inline-block [&>p]:m-0' : 'my-1'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900" {...props} />,
          // h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-2 text-gray-900" {...props} />,
          // h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-gray-800" {...props} />,
          // p: ({ node, ...props }) => <p className={inline ? 'm-0 inline' : 'mb-3 text-gray-700 leading-relaxed'} {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-2 text-gray-900 dark:text-gray-100" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-gray-800 dark:text-gray-200" {...props} />,
          p: ({ node, ...props }) => <p className={inline ? 'm-0 inline' : 'mb-3 text-gray-700 dark:text-gray-300 leading-relaxed'} {...props} />,
          // Memberi jarak aman antar list
          // Memastikan list menggunakan bullet disc (titik bundar) yang jelas
          // ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2 space-y-1.5 text-gray-700" {...props} />,
          // ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2 space-y-1.5 text-gray-700" {...props} />,
          // li: ({ node, ...props }) => <li className="text-gray-700 pl-1 my-0 leading-relaxed [&>p]:my-0" {...props} />,
          // strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
          
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2 space-y-1.5 text-gray-700 dark:text-gray-300" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2 space-y-1.5 text-gray-700 dark:text-gray-300" {...props} />,
          li: ({ node, ...props }) => <li className="text-gray-700 dark:text-gray-300 pl-1 my-0 leading-relaxed [&>p]:my-0" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />,

          // table: ({ node, ...props }) => (
          //   <div className="overflow-x-auto my-4">
          //     <table className="min-w-full border-collapse border border-gray-300 text-left text-sm" {...props} />
          //   </div>
          // ),
          // thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
          // th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-900" {...props} />,
          // td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />,

          table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700 text-left text-sm" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
            th: ({ node, ...props }) => <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold text-gray-900 dark:text-gray-100" {...props} />,
            td: ({ node, ...props }) => <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300" {...props} />,

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

            // return inline ? (
            //   <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono" {...props}>
            //     {children}
            //   </code>
            //  ) 
            //  : 
            //  (
            //   <pre className="bg-gray-100 text-gray-900 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm leading-tight">
            //     <code className={className} {...props}>
            //       {children}
            //     </code>
            //   </pre>
            // )
            return inline ? (
              <code className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) 
            : 
            (
              <pre className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm leading-tight">
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
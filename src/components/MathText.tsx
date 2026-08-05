'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import 'katex/dist/katex.min.css'

export default function MathText({ content, inline = false }: { content: string; inline?: boolean }) {
  if (!content) return null

  return (
    <div className={`prose prose-slate max-w-none ${inline ? 'inline-block [&>p]:m-0' : 'leading-relaxed'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-2 text-gray-900" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-gray-800" {...props} />,
          p: ({ node, ...props }) => <p className={inline ? 'm-0 inline' : 'mb-4 text-gray-700'} {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-700" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-gray-700" {...props} />,
          li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
          
          // Styling custom untuk tabel agar rapi
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300 text-left text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
          th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-900" {...props} />,
          td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />,

          // Styling custom untuk blok kode / diagram ASCII agar rata (monospace)
          pre: ({ node, ...props }) => (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm leading-tight" {...props} />
          ),
          code: ({ node, inline, ...props }: any) => 
            inline ? (
              <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="font-mono text-sm" {...props} />
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

// Custom lightweight and safe Markdown renderer without complex insecure dependencies
export const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) {
    return <div className="text-slate-500 italic text-sm">No content provided.</div>;
  }

  // Preprocess text into blocks
  const parseMarkdownBlocks = (text) => {
    const lines = text.split('\n');
    const blocks = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer = [];
    let listBuffer = [];
    let listType = null; // 'ul' | 'ol'
    let tableBuffer = [];

    const flushCode = () => {
      if (inCodeBlock) {
        blocks.push({
          type: 'code',
          language: codeLanguage,
          content: codeBuffer.join('\n'),
        });
        inCodeBlock = false;
        codeLanguage = '';
        codeBuffer = [];
      }
    };

    const flushList = () => {
      if (listBuffer.length > 0) {
        blocks.push({
          type: listType,
          items: [...listBuffer],
        });
        listBuffer = [];
        listType = null;
      }
    };

    const flushTable = () => {
      if (tableBuffer.length > 0) {
        blocks.push({
          type: 'table',
          rows: [...tableBuffer],
        });
        tableBuffer = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code fences
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          flushCode();
        } else {
          flushList();
          flushTable();
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim();
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList();
        // Skip separator row (|---|---|)
        if (/^\|(\s*[-:]+\s*\|)+$/.test(line.trim())) {
          continue;
        }
        const cells = line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        tableBuffer.push(cells);
        continue;
      } else if (tableBuffer.length > 0) {
        flushTable();
      }

      // Unordered list
      const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
      if (ulMatch) {
        flushTable();
        if (listType && listType !== 'ul') flushList();
        listType = 'ul';
        listBuffer.push(ulMatch[2]);
        continue;
      }

      // Ordered list
      const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
      if (olMatch) {
        flushTable();
        if (listType && listType !== 'ol') flushList();
        listType = 'ol';
        listBuffer.push(olMatch[2]);
        continue;
      }

      // If we are exiting a list
      if (listBuffer.length > 0) {
        flushList();
      }

      // Headers
      if (line.startsWith('# ')) {
        blocks.push({ type: 'h1', text: line.slice(2).trim() });
        continue;
      }
      if (line.startsWith('## ')) {
        blocks.push({ type: 'h2', text: line.slice(3).trim() });
        continue;
      }
      if (line.startsWith('### ')) {
        blocks.push({ type: 'h3', text: line.slice(4).trim() });
        continue;
      }
      if (line.startsWith('#### ')) {
        blocks.push({ type: 'h4', text: line.slice(5).trim() });
        continue;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        blocks.push({ type: 'quote', text: line.slice(2).trim() });
        continue;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        blocks.push({ type: 'hr' });
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        continue;
      }

      // Regular paragraph
      blocks.push({ type: 'p', text: line });
    }

    flushCode();
    flushList();
    flushTable();

    return blocks;
  };

  // Inline formatting parser (bold, italic, inline code, links)
  const renderInlineFormatted = (text) => {
    if (!text) return null;

    // Tokens regex: `code`, **bold**, *italic*, [link](url)
    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Inline code: `...`
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/s);
      // Link: [...](...)
      const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)(.*)$/s);
      // Bold: **...**
      const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*(.*)$/s);
      // Italic: *...*
      const italicMatch = remaining.match(/^(.*?)\*([^*]+)\*(.*)$/s);

      // Find which comes first
      const matches = [
        { type: 'code', m: codeMatch, index: codeMatch ? codeMatch[1].length : Infinity },
        { type: 'link', m: linkMatch, index: linkMatch ? linkMatch[1].length : Infinity },
        { type: 'bold', m: boldMatch, index: boldMatch ? boldMatch[1].length : Infinity },
        { type: 'italic', m: italicMatch, index: italicMatch ? italicMatch[1].length : Infinity },
      ].filter((item) => item.index !== Infinity);

      if (matches.length === 0) {
        parts.push(<React.Fragment key={keyIdx++}>{remaining}</React.Fragment>);
        break;
      }

      matches.sort((a, b) => a.index - b.index);
      const first = matches[0];

      if (first.type === 'code') {
        const [, prefix, codeText, rest] = first.m;
        if (prefix) parts.push(<React.Fragment key={keyIdx++}>{prefix}</React.Fragment>);
        parts.push(
          <code key={keyIdx++} className="bg-[#181d28] text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono border border-[#273042]">
            {codeText}
          </code>
        );
        remaining = rest;
      } else if (first.type === 'link') {
        const [, prefix, label, url, rest] = first.m;
        if (prefix) parts.push(<React.Fragment key={keyIdx++}>{prefix}</React.Fragment>);
        parts.push(
          <a
            key={keyIdx++}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            {label}
          </a>
        );
        remaining = rest;
      } else if (first.type === 'bold') {
        const [, prefix, boldText, rest] = first.m;
        if (prefix) parts.push(<React.Fragment key={keyIdx++}>{prefix}</React.Fragment>);
        parts.push(<strong key={keyIdx++} className="font-semibold text-slate-100">{boldText}</strong>);
        remaining = rest;
      } else if (first.type === 'italic') {
        const [, prefix, italicText, rest] = first.m;
        if (prefix) parts.push(<React.Fragment key={keyIdx++}>{prefix}</React.Fragment>);
        parts.push(<em key={keyIdx++} className="italic text-slate-200">{italicText}</em>);
        remaining = rest;
      }
    }

    return parts;
  };

  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`markdown-body space-y-3 font-sans ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1 key={idx} className="text-xl sm:text-2xl font-bold text-slate-100 border-b border-[#232936] pb-2 mt-4">
                {renderInlineFormatted(block.text)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={idx} className="text-lg sm:text-xl font-semibold text-slate-100 border-b border-[#1d232e] pb-1.5 mt-4">
                {renderInlineFormatted(block.text)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={idx} className="text-base font-semibold text-slate-200 mt-3">
                {renderInlineFormatted(block.text)}
              </h3>
            );
          case 'h4':
            return (
              <h4 key={idx} className="text-sm font-semibold text-slate-300 mt-2">
                {renderInlineFormatted(block.text)}
              </h4>
            );
          case 'p':
            return (
              <p key={idx} className="text-sm leading-relaxed text-slate-300">
                {renderInlineFormatted(block.text)}
              </p>
            );
          case 'quote':
            return (
              <blockquote key={idx} className="border-l-2 border-indigo-500 pl-3.5 py-1 text-slate-400 text-sm bg-indigo-950/10 rounded-r">
                {renderInlineFormatted(block.text)}
              </blockquote>
            );
          case 'hr':
            return <hr key={idx} className="border-t border-[#232936] my-4" />;
          case 'ul':
            return (
              <ul key={idx} className="list-disc list-outside pl-5 space-y-1 text-sm text-slate-300">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx}>{renderInlineFormatted(item)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={idx} className="list-decimal list-outside pl-5 space-y-1 text-sm text-slate-300">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx}>{renderInlineFormatted(item)}</li>
                ))}
              </ol>
            );
          case 'code':
            return (
              <CodeBlockComponent key={idx} language={block.language} code={block.content} />
            );
          case 'table':
            return (
              <div key={idx} className="overflow-x-auto my-3 border border-[#232936] rounded-md">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#151a24] border-b border-[#232936] text-slate-200">
                      {block.rows[0]?.map((cell, cIdx) => (
                        <th key={cIdx} className="p-2.5 font-medium">
                          {renderInlineFormatted(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2430]">
                    {block.rows.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#151922]/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-slate-300">
                            {renderInlineFormatted(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

const CodeBlockComponent = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-[#232a39] bg-[#0f1218] my-3">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#141822] border-b border-[#1f2532] text-[11px] text-slate-400 font-mono">
        <span>{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-slate-200 transition-colors p-0.5 rounded"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

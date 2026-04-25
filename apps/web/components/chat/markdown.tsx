'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@/components/theme-provider';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';

interface Props {
  content: string;
}

export function Markdown({ content }: Props) {
  const { resolved } = useTheme();
  return (
    <div className={`prose-message ${resolved}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children }) {
            return <CodeBlock>{children}</CodeBlock>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const el = document.createElement('div');
    el.innerHTML = (children as { props?: { children?: string } })?.props?.children
      ? String((children as { props: { children: string } }).props.children)
      : '';
    const text = el.innerText;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="relative group">
      <pre>{children}</pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 end-2 p-1.5 rounded bg-background/80 border opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="העתק קוד"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

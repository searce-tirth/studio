"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

type MarkdownProps = {
  content: string;
  className?: string;
};

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={cn('space-y-4', className)}
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-bold" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-bold" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-1" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-1" {...props} />,
        a: ({node, ...props}) => <a className="underline hover:no-underline" {...props} />,
        code: ({node, inline, className, children, ...props}) => {
          return !inline ? (
            <pre className="bg-muted p-2 rounded-md my-2 overflow-x-auto">
              <code className={cn(className, "font-code text-sm text-foreground")} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code className={cn(className, "bg-muted px-1.5 py-1 rounded-sm font-code text-sm")} {...props}>
              {children}
            </code>
          )
        },
        p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

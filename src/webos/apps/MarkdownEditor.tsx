import { useState } from "react";
import { marked } from "marked";

export function MarkdownEditor() {
  const [md, setMd] = useState(`# Welcome to Markdown\n\n## Features\n- **Bold** and *italic*\n- [Links](https://lovable.dev)\n- \`inline code\`\n\n\`\`\`js\nconsole.log("hello");\n\`\`\`\n\n> Blockquote\n\n1. Numbered\n2. List`);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-full bg-background">
      <textarea value={md} onChange={(e) => setMd(e.target.value)} className="p-4 mono text-sm bg-card resize-none outline-none border-r" />
      <div className="p-4 overflow-auto prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: marked.parse(md) as string }} />
    </div>
  );
}

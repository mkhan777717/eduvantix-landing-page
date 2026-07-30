import { marked } from "marked";

function getYtId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  return m ? m[1] : null;
}

marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    // 1. Image & Video Embeds
    image(token) {
      const { href, title, text } = token;
      if (!href) return "";
      if (text?.toLowerCase() === "video" || href.includes("youtube.com") || href.includes("youtu.be")) {
        const id = getYtId(href);
        if (id) {
          return `<div class="my-4 aspect-video rounded-xl overflow-hidden border border-[var(--border-primary)] shadow-lg"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe></div>`;
        }
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-[var(--text-accent)] underline font-semibold">${href}</a>`;
      }

      let imageSrc = href;
      // Strip legacy hardcoded localhost:XXXX origin from old saved database content
      imageSrc = imageSrc.replace(/^https?:\/\/localhost:\d+/, "");

      // Resolve relative /uploads/ paths using API_BASE env var or window origin
      if (imageSrc.startsWith("/uploads/")) {
        const apiBase = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL)
          ? process.env.NEXT_PUBLIC_API_BASE_URL
          : (typeof window !== "undefined" && window.location.hostname !== "localhost" ? "" : "http://localhost:5001");
        imageSrc = `${apiBase}${imageSrc}`;
      }

      const trimmedText = (text || "").trim();
      const isFilename = trimmedText && (
        trimmedText.toLowerCase().startsWith("screenshot") ||
        trimmedText.toLowerCase().startsWith("image") ||
        trimmedText.toLowerCase() === "blob" ||
        /\.(png|jpe?g|webp|gif|svg)$/i.test(trimmedText)
      );
      const captionHtml = (trimmedText && !isFilename)
        ? `<p class="text-[11px] text-[var(--text-muted)] mt-1.5 font-medium">${trimmedText}</p>`
        : "";
      return `<div class="my-4 text-center"><img src="${imageSrc}" alt="${trimmedText}" title="${title || ''}" class="max-w-full h-auto rounded-xl border border-[var(--border-primary)] shadow-md inline-block">${captionHtml}</div>`;
    },

    // 2. Links
    link(token) {
      const { href, title } = token;
      const text = this.parser.parseInline(token.tokens || []);
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title || ''}" class="text-[var(--text-accent)] hover:underline font-semibold">${text}</a>`;
    },

    // 3. Tables
    table(token) {
      let headerHtml = "";
      if (token.header) {
        token.header.forEach(cell => {
          const content = this.parser.parseInline(cell.tokens || []);
          headerHtml += `<th class="px-4 py-2.5 font-bold text-[var(--text-primary)]">${content}</th>`;
        });
      }
      let bodyHtml = "";
      if (token.rows) {
        token.rows.forEach(row => {
          bodyHtml += "<tr>";
          row.forEach(cell => {
            const content = this.parser.parseInline(cell.tokens || []);
            bodyHtml += `<td class="px-4 py-2.5 text-[var(--text-secondary)]">${content}</td>`;
          });
          bodyHtml += "</tr>";
        });
      }
      return `<div class="my-4 overflow-x-auto rounded-xl border border-[var(--border-primary)] shadow-xs"><table class="w-full text-xs text-left border-collapse"><thead class="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]"><tr>${headerHtml}</tr></thead><tbody class="divide-y divide-[var(--border-primary)]">${bodyHtml}</tbody></table></div>`;
    },

    // 4. Blockquotes
    blockquote(token) {
      const content = this.parser.parse(token.tokens || []);
      return `<blockquote class="my-4 border-l-4 border-[var(--border-accent)] bg-[var(--accent-glow)]/30 px-4 py-2.5 rounded-r-xl text-xs italic leading-relaxed text-[var(--text-secondary)]">${content}</blockquote>`;
    },

    // 5. Code blocks & inline code
    code(token) {
      const { text, lang } = token;
      const escaped = (text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre class="bg-[var(--bg-code)] border border-[var(--border-primary)] rounded-xl p-4 overflow-x-auto my-4 text-xs font-mono leading-relaxed" style="color:var(--text-primary)"><code class="${lang ? "language-" + lang : ""}">${escaped}</code></pre>`;
    },
    codespan(token) {
      const text = token.text || "";
      return `<code class="px-1.5 py-0.5 rounded-md text-[var(--text-accent)] bg-[var(--accent-glow)] text-xs font-mono">${text}</code>`;
    },

    // 6. Horizontal Rules
    hr() {
      return `<hr class="my-6 border-t border-[var(--border-primary)]" />`;
    },

    // 7. Headings
    heading(token) {
      const depth = token.depth;
      const text = this.parser.parseInline(token.tokens || []);
      const sizes = {
        1: "text-2xl font-bold mt-6 mb-4",
        2: "text-lg font-bold mt-8 mb-3",
        3: "text-base font-bold mt-6 mb-2",
        4: "text-sm font-bold mt-4 mb-2",
        5: "text-xs font-bold mt-3 mb-1",
        6: "text-xs font-bold uppercase tracking-wider mt-3 mb-1"
      };
      const cls = sizes[depth] || "text-base font-bold mt-4 mb-2";
      return `<h${depth} class="${cls}" style="color:var(--text-primary)">${text}</h${depth}>`;
    },

    // 8. Lists
    list(token) {
      const ordered = token.ordered;
      const start = token.start;
      const tag = ordered ? "ol" : "ul";
      const cls = ordered ? "list-decimal pl-5 my-3 space-y-1 text-xs" : "list-disc pl-5 my-3 space-y-1 text-xs";
      const startAttr = ordered && start !== 1 ? ` start="${start}"` : "";
      let body = "";
      if (token.items) {
        token.items.forEach(item => {
          body += `<li class="leading-relaxed">${this.parser.parse(item.tokens || [])}</li>`;
        });
      }
      return `<${tag}${startAttr} class="${cls}" style="color:var(--text-secondary)">${body}</${tag}>`;
    },
  }
});

export function renderMarkdown(text) {
  if (!text) return "";
  try {
    return marked.parse(text);
  } catch (err) {
    console.error("Markdown parse error:", err);
    return text;
  }
}

export { getYtId };

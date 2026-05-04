import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

const ArticleCard = ({ article }) => {
  const [viewMode, setViewMode] = useState("preview"); // preview | raw

  if (!article) return null;

  const copyArticle = () => {
    const fullArticle = [
      `# ${article.headline}`,
      "",
      `> ${article.tldr}`,
      "",
      ...article.sections.map((s) => `## ${s.heading}\n\n${s.content}`),
      "",
      "## Key Takeaways",
      ...article.keyTakeaways.map((t) => `- ${t}`),
    ].join("\n");

    navigator.clipboard.writeText(fullArticle);
    toast.success("Article copied as Markdown!");
  };

  const copyHTML = () => {
    // Simple markdown to HTML (basic)
    const html = `
      <article>
        <h1>${article.headline}</h1>
        <blockquote>${article.tldr}</blockquote>
        ${article.sections.map((s) => `<h2>${s.heading}</h2><div>${s.content}</div>`).join("")}
        <h2>Key Takeaways</h2>
        <ul>${article.keyTakeaways.map((t) => `<li>${t}</li>`).join("")}</ul>
      </article>
    `;
    navigator.clipboard.writeText(html);
    toast.success("Article copied as HTML!");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("preview")}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === "preview" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            Preview
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === "raw" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            Markdown
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyArticle}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
          >
            📋 Copy MD
          </button>
          <button
            onClick={copyHTML}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
          >
            🌐 Copy HTML
          </button>
        </div>
      </div>

      {/* Meta Info */}
      <div className="mb-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Meta Description:</span>
            <p className="text-gray-300 mt-1">{article.metaDescription}</p>
          </div>
          <div>
            <span className="text-gray-500">Tags:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {article.suggestedTags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-xl">
        {viewMode === "preview" ? (
          <article className="prose prose-invert prose-purple max-w-none">
            <h1 className="text-3xl font-bold text-white mb-4">
              {article.headline}
            </h1>

            <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 mb-6">
              {article.tldr}
            </blockquote>

            {article.sections?.map((section, i) => (
              <div key={i} className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">
                  {section.heading}
                </h2>
                <div className="text-gray-300 leading-relaxed">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            <div className="mt-8 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">
                📌 Key Takeaways
              </h3>
              <ul className="space-y-2">
                {article.keyTakeaways?.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className="text-purple-400">✓</span>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ) : (
          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono overflow-x-auto">
            {`# ${article.headline}

> ${article.tldr}

${article.sections?.map((s) => `## ${s.heading}\n\n${s.content}`).join("\n\n")}

## Key Takeaways
${article.keyTakeaways?.map((t) => `- ${t}`).join("\n")}`}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ArticleCard;

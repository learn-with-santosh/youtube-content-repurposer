import React from "react";
import toast from "react-hot-toast";

const NewsletterCard = ({ newsletter }) => {
  if (!newsletter) return null;

  const copyNewsletter = () => {
    const text = [
      `Subject: ${newsletter.subjectLines?.[0]}`,
      "",
      newsletter.greeting,
      "",
      ...newsletter.sections.map(
        (s) =>
          `## ${s.heading}\n\n${s.content}${s.callout ? `\n\n> ${s.callout}` : ""}`,
      ),
      "",
      "## Action Items",
      ...newsletter.actionItems.map((a) => `- ${a}`),
      "",
      newsletter.closing,
      newsletter.ps ? `\nP.S. ${newsletter.ps}` : "",
    ].join("\n");

    navigator.clipboard.writeText(text);
    toast.success("Newsletter copied!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Newsletter Draft</h3>
        <button
          onClick={copyNewsletter}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
        >
          📋 Copy Newsletter
        </button>
      </div>

      {/* Subject Lines */}
      <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
        <h4 className="text-sm font-medium text-gray-400 mb-3">
          📧 Subject Line Options
        </h4>
        {newsletter.subjectLines?.map((subject, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
          >
            <p className="text-gray-200">{subject}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(subject);
                toast.success("Subject copied!");
              }}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Copy
            </button>
          </div>
        ))}
        {newsletter.previewText && (
          <p className="text-xs text-gray-500 mt-2">
            Preview: {newsletter.previewText}
          </p>
        )}
      </div>

      {/* Email Preview */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl overflow-hidden shadow-xl">
        {/* Email header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">
            {newsletter.subjectLines?.[0]}
          </h2>
        </div>

        {/* Email body */}
        <div className="p-8">
          <p className="text-gray-700 mb-6 leading-relaxed">
            {newsletter.greeting}
          </p>

          {newsletter.sections?.map((section, i) => (
            <div key={i} className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {section.heading}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
              {section.callout && (
                <div className="mt-4 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                  <p className="text-purple-800 italic">{section.callout}</p>
                </div>
              )}
            </div>
          ))}

          {/* Action Items */}
          <div className="my-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              ✅ Action Items
            </h3>
            <ul className="space-y-2">
              {newsletter.actionItems?.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span>☐</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-gray-600 leading-relaxed">{newsletter.closing}</p>

          {newsletter.ps && (
            <p className="mt-6 text-sm text-gray-500 italic">
              P.S. {newsletter.ps}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterCard;

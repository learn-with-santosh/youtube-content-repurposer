import React from "react";
import toast from "react-hot-toast";

const InfographicCard = ({ infographic, image }) => {
  if (!infographic) return null;

  const downloadImage = () => {
    if (image) {
      const link = document.createElement("a");
      link.href = `data:${image.mimeType};base64,${image.image}`;
      link.download = "infographic.png";
      link.click();
      toast.success("Infographic downloaded!");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          {infographic.title}
        </h3>
        {image && (
          <button
            onClick={downloadImage}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
          >
            ⬇️ Download Image
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Preview */}
        {image && (
          <div className="flex justify-center">
            <img
              src={`data:${image.mimeType};base64,${image.image}`}
              alt="Infographic"
              className="max-w-full rounded-xl shadow-2xl"
              style={{ maxHeight: "700px" }}
            />
          </div>
        )}

        {/* Content Structure */}
        <div className="space-y-4">
          <p className="text-gray-400">{infographic.subtitle}</p>

          {infographic.sections?.map((section, i) => (
            <div
              key={i}
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{section.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">
                      {section.heading}
                    </h4>
                    {section.highlight && (
                      <span className="text-purple-400 font-bold">
                        {section.highlight}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {section.content}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">
                    {section.type}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Color Scheme */}
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <h4 className="text-sm font-medium text-gray-400 mb-3">
              Color Scheme
            </h4>
            <div className="flex gap-3">
              {Object.entries(infographic.colorScheme || {}).map(
                ([name, color]) => (
                  <div key={name} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg border border-gray-600"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <span className="text-xs text-gray-500 block">
                        {name}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {color}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfographicCard;

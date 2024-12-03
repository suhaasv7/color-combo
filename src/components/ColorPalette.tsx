import React, { useState, useEffect } from "react";
import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";
import mixPlugin from "colord/plugins/mix";
import namer from "color-namer";

extend([namesPlugin, mixPlugin]);

interface Color {
  hex: string;
  id: string;
  name: string;
}

interface ColorSuggestion {
  name: string;
  hex: string;
}

const generateSuggestionsFromName = (input: string): ColorSuggestion[] => {
  try {
    const allColors: ColorSuggestion[] = [];
    const searchTerm = input.toLowerCase();

    const colorResults = namer("#FFFFFF");
    colorResults.ntc
      .filter(
        (color) =>
          color.name.toLowerCase().includes(searchTerm) &&
          color.hex &&
          color.hex.startsWith("#")
      )
      .forEach((color) => {
        allColors.push({
          name: color.name,
          hex: color.hex.toUpperCase(),
        });
      });

    if (colord(input).isValid()) {
      const exactColor = colord(input).toHex();
      const exactColorName = namer(exactColor).ntc[0].name;
      allColors.unshift({
        name: exactColorName,
        hex: exactColor,
      });
    }

    return Array.from(
      new Map(allColors.map((color) => [color.hex, color])).values()
    ).slice(0, 30);
  } catch {
    return [];
  }
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const ColorPalette: React.FC = () => {
  const [colors, setColors] = useState<Color[]>([
    { hex: "#845EC2", id: "1", name: namer("#845EC2").ntc[0].name },
    { hex: "#D65DB1", id: "2", name: namer("#D65DB1").ntc[0].name },
  ]);
  const [input, setInput] = useState<string>("");
  const [suggestions, setSuggestions] = useState<ColorSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  useEffect(() => {
    if (input.length > 1) {
      let matchedColors: ColorSuggestion[] = [];

      if (input.startsWith("#")) {
        if (colord(input).isValid()) {
          matchedColors = generateSuggestionsFromName(input);
        }
      } else {
        matchedColors = generateSuggestionsFromName(input);
      }

      setSuggestions(matchedColors);
      setShowSuggestions(matchedColors.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  const addColor = (hex: string): void => {
    setColors([
      ...colors,
      {
        hex,
        id: Date.now().toString(),
        name: namer(hex).ntc[0].name,
      },
    ]);
    setInput("");
    setShowSuggestions(false);
  };

  const removeColor = (id: string): void => {
    setColors(colors.filter((color) => color.id !== id));
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const saveEditing = () => {
    if (editingId) {
      setColors(
        colors.map((color) =>
          color.id === editingId ? { ...color, name: editingName } : color
        )
      );
      setEditingId(null);
      setEditingName("");
    }
  };

  const downloadPalette = (): void => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 20;
    const colorWidth = 120;
    const colorHeight = 120;
    const cornerRadius = 8;
    const textHeight = 40; // Extra height for color name

    canvas.width = colors.length * (colorWidth + padding) + padding;
    canvas.height = colorHeight + padding * 2 + textHeight;

    // White background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    colors.forEach((color, index) => {
      const x = padding + index * (colorWidth + padding);
      const y = padding;

      // Draw rounded rectangle
      ctx.fillStyle = color.hex;
      drawRoundedRect(ctx, x, y, colorWidth, colorHeight, cornerRadius);
      ctx.fill();

      // Draw hex code
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText(color.hex, x + 5, y + colorHeight + 15);

      // Draw color name
      ctx.font = "10px Arial";
      ctx.fillText(color.name, x + 5, y + colorHeight + 30);
    });

    const link = document.createElement("a");
    link.download = "color-palette.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="mx-auto space-y-6 max-w-7xl">
        <button
          onClick={downloadPalette}
          className="flex items-center justify-center w-full gap-2 px-6 py-3 text-gray-700 transition-all duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md"
        >
          <span>↓</span>
          <span>Download Palette</span>
        </button>

        <div className="relative space-y-2 sm:space-y-0">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Enter color name or hex (e.g., yellow, #FF0000)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {input && (
                <button
                  onClick={() => setInput("")}
                  className="absolute flex items-center justify-center w-8 h-8 -translate-y-1/2 rounded-full right-3 top-1/2 hover:bg-gray-100"
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={() =>
                suggestions.length > 0 && addColor(suggestions[0].hex)
              }
              className="w-full px-6 py-3 transition-all duration-200 bg-white border border-gray-200 shadow-sm sm:w-auto rounded-xl hover:shadow-md"
            >
              + Add Color
            </button>
          </div>

          {showSuggestions && (
            <div className="absolute left-0 right-0 z-10 p-3 mt-1 bg-white border border-gray-200 shadow-lg rounded-xl">
              <div className="overflow-x-auto">
                <div className="flex gap-3 pb-2 min-w-max">
                  {suggestions.map((color, index) => (
                    <div
                      key={`${color.hex}-${index}`}
                      className="w-24 transition-transform cursor-pointer hover:scale-105"
                      onClick={() => addColor(color.hex)}
                    >
                      <div
                        className="h-24 border border-gray-100 shadow-sm rounded-xl"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="mt-2 text-center">
                        <p className="font-mono text-xs text-gray-600">
                          {color.hex}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {color.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {colors.map((color) => (
            <div key={color.id} className="relative">
              <div
                className="h-24 shadow-sm sm:h-32 rounded-xl group"
                style={{ backgroundColor: color.hex }}
              >
                <button
                  onClick={() => removeColor(color.id)}
                  className="absolute flex items-center justify-center w-8 h-8 transition-opacity bg-white rounded-full shadow-sm opacity-100 sm:opacity-0 top-2 right-2 group-hover:opacity-100 hover:bg-gray-50"
                >
                  ×
                </button>
              </div>
              <div className="mt-2 text-center">
                <p className="font-mono text-sm text-gray-600">{color.hex}</p>
                {editingId === color.id ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-xs w-full px-1 py-0.5 border rounded"
                      onBlur={saveEditing}
                      onKeyPress={(e) => e.key === "Enter" && saveEditing()}
                      autoFocus
                    />
                  </div>
                ) : (
                  <p
                    className="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => startEditing(color.id, color.name)}
                  >
                    {color.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;

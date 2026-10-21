"use client";

import { useHelpDrawer, HELP_CONTENT } from "@/stores/helpDrawer";
import { X, HelpCircle } from "lucide-react";
import { Button } from "./button";

export function HelpDrawer() {
  const { isOpen, content, closeHelp } = useHelpDrawer();

  if (!isOpen || !content) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeHelp}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {content.title}
            </h2>
          </div>
          <button
            onClick={closeHelp}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close help drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">{content.description}</p>

          <div className="space-y-6">
            {content.sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {section.heading}
                </h3>
                <p className="text-sm text-gray-600">{section.content}</p>
              </div>
            ))}
          </div>

          {content.tips && content.tips.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Tips</h3>
              <ul className="space-y-2">
                {content.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-indigo-600 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function HelpButton({ page, label = "Help" }: { page: string; label?: string }) {
  const { openHelp } = useHelpDrawer();

  const handleClick = () => {
    const content = HELP_CONTENT[page];
    if (content) {
      openHelp(page, content);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="gap-1"
      aria-label={`Open ${label}`}
    >
      <HelpCircle className="w-4 h-4" />
      {label}
    </Button>
  );
}

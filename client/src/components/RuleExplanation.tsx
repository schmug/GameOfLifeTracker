import React from "react";

export default function RuleExplanation() {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-grid p-4">
      <h2 className="text-lg font-semibold mb-2">Game Rules</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border border-grid rounded-md p-3">
          <h3 className="font-medium text-primary mb-1">Birth</h3>
          <p className="text-sm text-gray-600">A dead cell with exactly 3 live neighbors becomes alive.</p>
        </div>
        <div className="border border-grid rounded-md p-3">
          <h3 className="font-medium text-secondary mb-1">Survival</h3>
          <p className="text-sm text-gray-600">A live cell with 2 or 3 live neighbors continues to live.</p>
        </div>
        <div className="border border-grid rounded-md p-3">
          <h3 className="font-medium text-gray-500 mb-1">Death</h3>
          <p className="text-sm text-gray-600">A live cell with fewer than 2 or more than 3 live neighbors dies.</p>
        </div>
      </div>
    </div>
  );
}

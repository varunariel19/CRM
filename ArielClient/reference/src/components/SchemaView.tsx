/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Copy, Check, Download, Info } from 'lucide-react';
import { POSTGRES_SCHEMA_SQL, RELATIONSHIPS_DOCUMENTATION } from '../schemaDefinition';

export default function SchemaView() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(POSTGRES_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([POSTGRES_SCHEMA_SQL], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'arielcrm_schema.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Banner */}
      <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3 mb-2">
          <Database className="w-8 h-8 text-blue-400" id="schema-db-icon" />
          <h2 className="text-2xl font-bold tracking-tight text-white">Phase 1: PostgreSQL Schema Blueprint</h2>
        </div>
        <p className="text-slate-300 max-w-3xl text-sm leading-relaxed font-medium">
          ArielCRM uses a highly optimized relational database schema designed for maximum referential integrity, performance, and analytical efficiency. The blueprint DDL below outlines the tables, foreign keys, constraints, and optimization indexes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Relationship Documentation */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              Structural Relationships
            </h3>
            <div className="space-y-4 text-xs">
              {RELATIONSHIPS_DOCUMENTATION.map((rel, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-semibold text-blue-600 uppercase">{rel.from}</span>
                    <span className="text-slate-400 font-medium">➔</span>
                    <span className="font-mono font-semibold text-indigo-600 uppercase">{rel.to}</span>
                  </div>
                  <div className="text-slate-500 font-medium mb-1">Type: {rel.type}</div>
                  <p className="text-slate-600 leading-normal">{rel.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">🚀 Production Ready Setup</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              These DDL statements can be loaded directly into any PostgreSQL cloud host or local docker container to kickstart the system. In-memory data mappings in our web controller align 100% with these tables.
            </p>
          </div>
        </div>

        {/* Right Side: Schema Source Code Code Block */}
        <div className="lg:col-span-2 flex flex-col bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-xs font-mono text-slate-400 ml-2">arielcrm_schema.sql</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                id="copy-sql-btn"
                className="flex items-center space-x-1 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition duration-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                id="download-sql-btn"
                className="flex items-center space-x-1 px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-md transition duration-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download DDL</span>
              </button>
            </div>
          </div>
          <div className="p-4 overflow-y-auto max-h-[500px]">
            <pre className="text-xs font-mono text-emerald-400 whitespace-pre leading-relaxed select-all">
              {POSTGRES_SCHEMA_SQL}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

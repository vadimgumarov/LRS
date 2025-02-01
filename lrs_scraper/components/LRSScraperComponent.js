// components/LRSScraperComponent.js
import React, { useState } from 'react';

export default function LRSScraperComponent() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('');

  const startScraping = async () => {
    setIsRunning(true);
    setStatus('Starting scraper...');
    
    try {
      const response = await fetch('/api/scrape');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Export to CSV with new structure
        const csvContent = [
          ['Role', 'Committee', 'Name', 'Email'],
          ...result.data.map(person => [
            person.role || '',
            person.committee || '',
            person.name || '',
            person.email || ''
          ])
        ]
        .map(row => row.join(','))
        .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `lrs_members_and_staff_${timestamp}.csv`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();

        setStatus('Completed successfully!');
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">LRS Member Data Collector</h1>
        <button 
          onClick={startScraping} 
          disabled={isRunning}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isRunning ? 'Running...' : 'Start Collection'}
        </button>
        <div className="mt-4 text-sm">
          Status: {status}
        </div>
      </div>
    </div>
  );
}
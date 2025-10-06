
import React, { useState } from 'react';
import type { LabelData, Product } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ResultsTableProps {
  data: LabelData[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const convertToCSV = () => {
    const headers = [
      'Tracking Number',
      'Order ID',
      'Recipient Name',
      'Recipient Address',
      'Courier',
      'Platform',
      'Products (Name | Qty | SKU)',
    ];

    const rows = data.map(item => {
      const productString = item.products
        .map(p => `${p.name} | ${p.quantity} | ${p.sku || ''}`)
        .join('; ');
      
      const rowData = [
        item.trackingNumber,
        item.orderId,
        item.recipientName,
        item.recipientAddress,
        item.courier,
        item.platform,
        productString,
      ];
      
      return rowData.map(value => {
        const strValue = String(value || '').replace(/"/g, '""');
        return `"${strValue}"`;
      }).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const handleCopy = () => {
    const csvData = convertToCSV();
    navigator.clipboard.writeText(csvData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (data.length === 0) {
    return null;
  }

  const renderProducts = (products: Product[]) => {
    return (
      <ul className="list-disc list-inside">
        {products.map((p, index) => (
          <li key={index}>
            {p.name} (Qty: {p.quantity})
            {p.sku && <span className="block text-xs text-gray-500">SKU: {p.sku}</span>}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-full mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Extracted Data</h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
        >
          {copied ? (
            <>
              <CheckIcon className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardIcon className="w-5 h-5" />
              Copy as CSV
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full min-w-max text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-800 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3">Tracking #</th>
              <th scope="col" className="px-6 py-3">Order ID</th>
              <th scope="col" className="px-6 py-3">Recipient</th>
              <th scope="col" className="px-6 py-3">Address</th>
              <th scope="col" className="px-6 py-3">Courier</th>
              <th scope="col" className="px-6 py-3">Platform</th>
              <th scope="col" className="px-6 py-3">Products</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.trackingNumber}</td>
                <td className="px-6 py-4">{item.orderId}</td>
                <td className="px-6 py-4">{item.recipientName}</td>
                <td className="px-6 py-4">{item.recipientAddress}</td>
                <td className="px-6 py-4">{item.courier}</td>
                <td className="px-6 py-4">{item.platform}</td>
                <td className="px-6 py-4">{renderProducts(item.products)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

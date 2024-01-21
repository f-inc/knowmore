"use client";
import React, { useState, ChangeEvent, useEffect } from 'react';
import { ModalComponent } from './Modal';
import Papa from 'papaparse';
const CsvDownload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blurData, setBlurData] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBlurData(true)
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setSelectedFile(file || null);
    setCsvData(null);
    setError(null);

    if (file) {
      setLoading(true);
      // Read the contents of the CSV file
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setLoading(false);
          if (results.errors.length > 0) {
            setError('Error parsing the CSV file. Please make sure it is valid.');
          } else {
            setCsvData(results.data as string[][]);

          }
        },
        error: (error) => {
          setLoading(false);
          setError('Error parsing the CSV file. Please try again.');
          console.error(error.message);
        }
      });
    }
  };

  useEffect(() => {
    console.log(csvData);
  }, [csvData]);
  console.log(csvData);
  return (
    <section  >
      
      <div className="container py-6 px-2 mx-auto max-w-screen-xl lg:py-12 lg:px-4">
        <div className="  mx-auto font-bold max-w-screen-sm text-center lg:mb-8 mb-4">
          <h2 className='text-2xl text-[#000000] md:text-3xl lg:text-4xl font-extrabold font-plus-jakarta-sans'>
            Turn website leads into
            <br />
            <span className="text-blue-600 dark:text-blue-500 font-plus-jakarta-sans">
              paid customers
            </span> fast
          </h2>
        </div>
        <div className='flex flex-col justify-center items-center'>
          <span className='text-[#000000] pl-5 text-base lg:text-lg font-plus-jakarta-sans'>
            Our AI bot scrapes every B2B lead you pull from your website so that <br />
          </span>
          <span className=' text-[#000000] text-base lg:text-lg font-plus-jakarta-sans'>
            you know exactly who your potential customers are. Stop leaving money on the table.
          </span>
          {!csvData && (
            <div className='mt-5'>
              <label
                htmlFor="fileInput"
                className="relative inline-block cursor-pointer border justify-center items-center border-b-8 w-[552px] h-[206px] border-[#1371FF] bg-[#D0E3FF] text-[#72AAFF] rounded-[20px] shadow-md"
              >
                {loading ? (
                  <span className="font-plus-jakarta-sans text-lg">Loading...</span>
                ) : selectedFile ? (
                  <>
                    <div className='flex flex-col py-10 justify-center items-center font-plus-jakarta-sans'>
                      <span className="text-hidden">Selected file: {selectedFile.name}</span>

                    </div>
                  </>
                ) : (
                  <>
                    <div className='flex flex-col py-10 justify-center items-center font-plus-jakarta-sans'>
                      <span className="text-2xl">+</span>
                      <span className="text-description font-[700px] text-hidden font-plus-jakarta-sans">Drag and drop emails</span>
                    </div>
                  </>
                )}
                <input
                  id="fileInput"
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}

          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
        {csvData && (
          <div className="mt-5 flex flex-col justify-center items-center px-5 rounded-full">
            <table className="border-collapse border w-full rounded-full border-slate-500">
              <thead className="rounded-md text-white">
                <tr className='text-[#000000]'>
                  {Object.keys(csvData[0]).map((header, index) => (
                    <th key={index} className="border border-slate-600 ...">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[#000000]  font-plus-jakarta-sans">
                {csvData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <td key={cellIndex} className="  border border-slate-700  text-center rounded">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className=" absolute  inset-0 bg-blur"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)', // Adjust the opacity if needed
                backdropFilter: !blurData ? 'blur(8px)' : 'blur(0px)',
              }}
            >
              {!blurData && (
                <span
                  onClick={() => openModal()}
                  className=" cursor-pointer text-[#0047FF] font-bold flex px-4 py-2 rounded absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  Subscribe <p className='text-black px-2'> to continue</p>
                </span>
              )}
            </div>
          </div>
        )}
        <ModalComponent isOpen={isModalOpen} closeModal={closeModal} />

      </div>
    </section>
  );
}

export default CsvDownload;

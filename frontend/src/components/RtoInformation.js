import React, { useEffect, useState } from "react";
import { fetchState, fetchDistrict } from "../api/rtoApi";
import useFetch from "../hooks/useFetch";
import jsPDF from "jspdf";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { toast } from "react-toastify";
import { PDFDocument } from "pdf-lib";
const RtoInformation = () => {
  const [selectedState, setSelectedState] = useState("");
  const [districts, setDistricts] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtErrors, setDistrictErrors] = useState(null);
  const {
    data: states,
    error: statesError,
    loading: statesLoading,
  } = useFetch(fetchState);

  const handleCopy = async (result) => {
    try {
      if (result) {
        await navigator.clipboard.writeText(result);
        toast.success("RTO code copied successfully!"); // Success toast
      }
    } catch (err) {
      console.log(`Error in copyingt text ${err.message}`);
      toast.error(`Error copying text: ${err.message}`);
    }
  };

  console.log(`States are ${states}`);

  console.log(`selectedState ${selectedState}`);
  // const {
  //   data: districts,
  //   error: districtErrors,
  //   loading: districtLoading,
  // } = useFetch(() => (selectedState ? fetchDistrict(selectedState) : null));
  console.log(`These are districts ${districts}`);
  const hadleStateChange = (e) => {
    setSelectedState(e.target.value);

    // if (state) {
    //   const {
    //     data: districts,
    //     error: districtErrors,
    //     loading: districtLoading,
    //   } = useFetch(() => (selectedState ? fetchDistrict(selectedState) : null));
    // }
  };

  useEffect(() => {
    if (selectedState) {
      const fetchDistrictList = async () => {
        setDistrictLoading(true);
        setDistrictErrors(null);
        try {
          const data = await fetchDistrict(selectedState);
          console.log(`This is data${data}`);
          setDistricts(data);
        } catch (error) {
          setDistrictErrors(error);
        } finally {
          setDistrictLoading(false);
        }
      };
      fetchDistrictList();
    }
  }, [selectedState]);

  // To download the PDF

  const downloadPdf = () => {
    // Increase width while maintaining default A4 height
    const doc = new jsPDF({
      unit: "mm", // Use millimeters for units
      format: [300, 210], // Custom page size with increased width (300mm x 210mm)
    });

    doc.setFontSize(12); // Set font size for entries
    const margin = 20; // Margin from the edges
    const lineHeight = 10; // Height of each line (distance between entries)
    const maxYPosition = doc.internal.pageSize.height - margin; // Max Y position before adding a new page
    let yPosition = margin + 10; // Starting Y position for the first entry

    // Title on the first page
    doc.text(`Districts in ${selectedState}`, margin, yPosition);
    yPosition += lineHeight; // Add a little space after the title

    // Loop through the districts and add them to the PDF
    districts.forEach((district, index) => {
      const { Place, RTOCode } = district;

      // Check if we need to add a new page (if Y position exceeds max Y)
      if (yPosition + lineHeight > maxYPosition) {
        doc.addPage(); // Add a new page
        yPosition = margin + 10; // Reset Y position for the new page
        doc.text(`Districts in ${selectedState}`, margin, yPosition); // Add title again
        yPosition += lineHeight; // Add a little space after the title
      }

      // Prepare text to avoid overflow (checking width)
      const districtText = `${index + 1}. ${Place} - RTO Code: ${RTOCode}`;
      const textWidth =
        (doc.getStringUnitWidth(districtText) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;

      // If the text exceeds the page width, wrap the text
      if (textWidth > doc.internal.pageSize.width - 2 * margin) {
        const wrappedText = doc.splitTextToSize(
          districtText,
          doc.internal.pageSize.width - 2 * margin
        );
        wrappedText.forEach((line) => {
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
      } else {
        doc.text(districtText, margin, yPosition);
        yPosition += lineHeight;
      }
    });

    // Save the PDF
    doc.save(`${selectedState}_districts.pdf`);
  };

  // Encrypted/ Protected password
  // const downloadProtectedPdf = async () => {
  //   // Step 1: Create a new PDF document
  //   const pdfDoc = await PDFDocument.create();

  //   // Step 2: Add a page to the document (A4 size)
  //   const page = pdfDoc.addPage([300, 210]); // Custom page size with increased width (300mm x 210mm)
  //   const { width, height } = page.getSize();

  //   // Step 3: Set up the font
  //   const font = await pdfDoc.embedFont(PDFDocument.Font.Helvetica);
  //   const margin = 20; // Margin from the edges
  //   const lineHeight = 10; // Height of each line (distance between entries)
  //   const maxYPosition = height - margin; // Max Y position before adding a new page
  //   let yPosition = margin + 10; // Starting Y position for the first entry

  //   // Title on the first page
  //   page.drawText(`Districts in ${selectedState}`, {
  //     x: margin,
  //     y: yPosition,
  //     font,
  //     size: 16,
  //   });
  //   yPosition += lineHeight + 5; // Add space after the title

  //   // Step 4: Loop through the districts and add them to the PDF
  //   for (let i = 0; i < districts.length; i++) {
  //     const { Place, RTOCode } = districts[i];
  //     const districtText = `${i + 1}. ${Place} - RTO Code: ${RTOCode}`;

  //     // Check if we need to add a new page (if Y position exceeds max Y)
  //     if (yPosition + lineHeight > maxYPosition) {
  //       page = pdfDoc.addPage([300, 210]); // Add a new page
  //       yPosition = margin + 10; // Reset Y position for the new page
  //       page.drawText(`Districts in ${selectedState}`, {
  //         x: margin,
  //         y: yPosition,
  //         font,
  //         size: 16,
  //       }); // Add title again
  //       yPosition += lineHeight + 5; // Add space after the title
  //     }

  //     // Prepare text to avoid overflow (checking width)
  //     const textWidth =
  //       (page.getTextWidth(districtText) *
  //         font.widthOfTextAtSize(districtText, 12)) /
  //       1000;

  //     // If the text exceeds the page width, wrap the text
  //     if (textWidth > width - 2 * margin) {
  //       const wrappedText = page.splitTextToSize(
  //         districtText,
  //         width - 2 * margin
  //       );
  //       wrappedText.forEach((line) => {
  //         page.drawText(line, { x: margin, y: yPosition, font, size: 12 });
  //         yPosition += lineHeight;
  //       });
  //     } else {
  //       page.drawText(districtText, {
  //         x: margin,
  //         y: yPosition,
  //         font,
  //         size: 12,
  //       });
  //       yPosition += lineHeight;
  //     }
  //   }

  //   // Step 5: Encrypt the PDF with password protection
  //   const userPassword = "user123"; // Set your desired user password
  //   //const ownerPassword = "ownerpassword"; // Set your owner password (can be the same or different)

  //   // Encrypt the PDF
  //   pdfDoc.encrypt({
  //     userPassword: userPassword,
  //     //ownerPassword: ownerPassword,
  //     permissions: {
  //       printing: "highResolution", // Allow high-resolution printing
  //       copying: true, // Allow content copying
  //       modifying: false, // Prevent modification of the document
  //     },
  //   });

  //   // Step 6: Save and download the PDF
  //   const pdfBytes = await pdfDoc.save();
  //   const blob = new Blob([pdfBytes], { type: "application/pdf" });

  //   // Create a link and trigger download
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = "districts-list.pdf";
  //   link.click();
  // };

  //  Currently not working
  // const downloadProtectedPdf = async () => {
  //   //setIsGenerating(true);

  //   try {
  //     // Step 1: Create a new PDF document with pdf-lib
  //     const pdfDoc = await PDFDocument.create();

  //     // Step 2: Add a page to the PDF (A4 size)
  //     const page = pdfDoc.addPage([300, 210]); // Custom page size (in mm)
  //     const { width, height } = page.getSize();

  //     // Step 3: Set up the font and other properties
  //     //const font = await pdfDoc.embedFont(PDFDocument.Font.Helvetica);
  //     //const font = await pdfDoc.embedFont(PDFDocument.StandardFonts.Helvetica); // Correct way to embed Helvetica font
  //     const font = await pdfDoc.embedStandardFont("Helvetica");

  //     const margin = 20; // Margin from the edges
  //     const lineHeight = 10; // Height of each line
  //     const maxYPosition = height - margin; // Max Y position before adding a new page
  //     let yPosition = margin + 10; // Starting Y position

  //     // Step 4: Add Title on the first page
  //     page.drawText(`Districts in ${selectedState}`, {
  //       x: margin,
  //       y: yPosition,
  //       font,
  //       size: 16,
  //     });
  //     yPosition += lineHeight + 5; // Add some space after the title

  //     // Step 5: Loop through the districts and add them to the PDF
  //     districts.forEach((district, index) => {
  //       const { Place, RTOCode } = district;
  //       const districtText = `${index + 1}. ${Place} - RTO Code: ${RTOCode}`;

  //       // Check if we need to add a new page (if Y position exceeds max Y)
  //       if (yPosition + lineHeight > maxYPosition) {
  //         page.drawText(`Districts in ${selectedState}`, {
  //           x: margin,
  //           y: yPosition,
  //           font,
  //           size: 16,
  //         });
  //         yPosition += lineHeight + 5; // Add space for the new page
  //       }

  //       // Add district information to the page
  //       page.drawText(districtText, {
  //         x: margin,
  //         y: yPosition,
  //         font,
  //         size: 12,
  //       });
  //       yPosition += lineHeight; // Increase Y position for next line
  //     });

  //     // Step 6: Encrypt the PDF with a user password
  //     const userPassword = "user123"; // Set your desired user password
  //     pdfDoc.encrypt({
  //       userPassword,
  //       permissions: {
  //         printing: "highResolution", // Allow high-resolution printing
  //         copying: true, // Allow content copying
  //         modifying: false, // Prevent modification of the document
  //       },
  //     });

  //     // Step 7: Save the encrypted PDF to bytes
  //     const encryptedPdfBytes = await pdfDoc.save();

  //     // Step 8: Trigger the download of the encrypted PDF
  //     const blob = new Blob([encryptedPdfBytes], { type: "application/pdf" });
  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = "districts-list-protected.pdf";
  //     link.click();
  //   } catch (error) {
  //     console.error("Error generating or encrypting PDF:", error);
  //   }
  // };

  if (statesLoading) {
    return <div className="text-blue-500 text-xl">Loading States...</div>;
  }

  if (statesError) {
    return (
      <div className="text-red-500 text-xl">
        Error fetching states: {statesError}
      </div>
    );
  }

  console.log(`These are district set in variable ${districts}`);

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-center text-grey-800 mb-8">
        RTO Information
      </h1>

      <div className="mb-8">
        <label htmlFor="state" className="block text-xl text-gray-700 mb-3">
          Selected State :
        </label>
        <select
          id="state"
          name="state"
          className="w-full px-4 py-3 text-lg bg-gray-100 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
          onChange={hadleStateChange}
        >
          <option value="">Select a State</option>
          {states.map((stateObj, index) => {
            console.log(`This is stateObj ${stateObj}`);
            console.log(stateObj);
            const stateCode = Object.keys(stateObj)[0];
            const stateName = stateObj[stateCode];
            console.log(stateName);
            return (
              <option key={index} value={stateName}>
                {stateCode}
              </option>
            );
          })}
        </select>
      </div>
      <div>
        <h2 className="text-2xl text-gray-800 mb-6">
          {selectedState
            ? `Districts in ${selectedState}`
            : "Select a State to see districts"}
        </h2>
        {districtLoading && (
          <div className="flex justify-center items-center">
            <div className="w-12 h-12 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            <span className="ml-4 text-xl text-blue-500">Loading...</span>
          </div>
        )}
        {districtErrors && (
          <div className="text-red-500 text-xl">
            Error fetching districts: {districtErrors.message}
          </div>
        )}
        {districts.length > 0 && (
          <ul>
            {districts.map((district, index) => {
              //  Object.keys(district).forEach((key) => {
              //    console.log(`${key}: ${district[key]}`);
              //  });
              const { Place, RTOCode, DistrictName } = district;
              console.log(`${Place},${RTOCode}`);
              const districtText = `${Place} - RTO Code: ${RTOCode}`;

              return (
                <li key={index}>
                  <li
                    key={index}
                    className="bg-gray-50 p-4 mb-3 rounded-lg shadow-sm hover:bg-blue-50 transition-all"
                  >
                    <p className="text-lg text-gray-700">{Place}</p>
                    <p className="text-lg text-gray-600">RTO Code: {RTOCode}</p>
                    <button
                      className="text-blue-500 ml-4"
                      onClick={() => handleCopy(districtText)}
                      title="Copy to Clipboard"
                    >
                      {/* <i className="fas fa-clipboard-list"></i>
                      <i className="fas fa-clipboard-check"></i> */}
                      <i className="fas fa-link"></i>
                      {/* <i className="fas fa-clipboard-list"></i>
                      <i className="fas fa-clipboard-check"></i>
                      <i className="fas fa-link"></i> */}
                      {/* Copy */}
                    </button>
                  </li>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {districts.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={downloadPdf}
            className="mt-8 py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            Download PDF
          </button>
          {/* <button
            onClick={downloadProtectedPdf}
            className="py-2 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
          >
            Download Protected PDF
          </button> */}
        </div>
      )}
    </div>
  );
};

export default RtoInformation;

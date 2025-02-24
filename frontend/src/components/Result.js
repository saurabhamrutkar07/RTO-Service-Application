import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import React Toastify CSS

const Result = ({ result }) => {
  console.log(`This is prop ${result}`);
  //const [copied, setCopied] = useState(false);
  const textToCopy =
    typeof result === "string" ? result : JSON.stringify(result);
  const isItString = typeof result === "string" ? true : false;
  console.log("is it string : ", isItString);
  console.log("This is text to copy", textToCopy);
  const handleCopy = async (result) => {
    try {
      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
        toast.success("RTO code copied successfully!"); // Success toast
      }
    } catch (err) {
      console.log(`Error in copyingt text ${err.message}`);
      toast.error(`Error copying text: ${err.message}`);
    }
  };
  return (
    <div className="mt-4 text-green-500 font-medium text-center">
      {result && <p>Generated RTO code : {result}</p>}
      {result && (
        <button
          onClick={handleCopy}
          className="mt-2 px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-700"
        >
          Copy RTO Code
        </button>
      )}

      <ToastContainer />
    </div>
  );
};

export default Result;

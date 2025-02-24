import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const Header = () => {
  return (
    <header className="bg-blue-700 text-white py-6">
      <h1 className="text-3xl font-bold text-center">RTO App</h1>
      <nav className="mt-4">
        <ul className="flex justify-center space-x-6">
          <li>
            <Link to="/" className="text-lg hover:underline">
              RTO Form
            </Link>
          </li>
          <li>
            <Link to="/rto-information" className="text-lg hover:underline">
              RTO Information
            </Link>
          </li>
          <li>
            <Link to="/rto-code-lookup" className="text-lg hover:underline">
              RTO Code Lookup
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

import "./App.css";
import Header from "./components/Header";
import RtoCodeLookup from "./components/RtoCodeLookup";
import RtoForm from "./components/RtoForm";
import RtoInformation from "./components/RtoInformation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS here
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import from react-router-dom v7

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    // <div className="App">
    //   <Header />
    //   <RtoForm />
    //   <RtoInformation />
    //   <RtoCodeLookup />
    //   <ToastContainer />
    // </div>
    <Router>
      <div className="App">
        <Header />
        <Routes>
          {" "}
          {/* Use Routes instead of Switch in v7 */}
          <Route path="/" element={<RtoForm />} /> {/* Default route */}
          <Route path="/rto-information" element={<RtoInformation />} />
          <Route path="/rto-code-lookup" element={<RtoCodeLookup />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;

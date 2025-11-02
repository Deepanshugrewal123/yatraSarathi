import { useEffect, useState } from "react";
import "./App.css";
import Hero from "./components/Hero";
import Navbar from "./components/navbar";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Impact from "./components/Impact";
import Footer from "./components/Footer";
import DestinationCard from "./components/Destination";
import HiddenGems from "./components/HiddenGems";

function App() {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(Date.now());

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div key={key}>
      <Navbar />
      <div id="home">
        <Hero />
      </div>
      <div id="destination">
        <DestinationCard />
      </div>
      <div id="hiddengems">
        <HiddenGems />
      </div>
      <div id="features">
        <Features />
      </div>
      <div id="howitworks">
        <HowItWorks />
      </div>
      <div id="impact">
        <Impact />
      </div>
      <Footer />
    </div>
  );
}

export default App;

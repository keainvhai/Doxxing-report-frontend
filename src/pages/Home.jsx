import Search from "../pages/Search";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to the Doxxing Report Database</h1>
        <p>Report and track doxxing incidents anonymously.</p>
      </div>

      <div className="search-section">
        <Search hideTitle={true} />
      </div>
    </div>
  );
};

export default Home;

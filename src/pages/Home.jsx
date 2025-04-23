import "../styles/Home.css";
import Search from "./Search";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to the Doxxing Report Database</h1>
        <p>Report and track doxxing incidents anonymously.</p>
      </div>

      <div className="search-section">
        {/* ✅ 不改变 URL，不跳转，只渲染数据 */}
        <Search hideTitle={true} />
      </div>
    </div>
  );
};

export default Home;

import SearchWithResults from "../components/SearchWithResults";
import "../styles/Search.css";

const Search = () => {
  return (
    <>
      <h2>🔍 Discover Incidents</h2>
      <SearchWithResults syncURL={true} hideTitle={false} />
    </>
  );
};

export default Search;

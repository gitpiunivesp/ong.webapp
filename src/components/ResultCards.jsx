import React from "react";
import "../css/SearchComponent.css";

const ResultCards = ({
  searchResults,
  searchTerm,
  isSearching,
  onCardClick,
}) => {
  if (searchResults.length === 0) {
    return (
      <div className="no-results">
        {searchTerm && !isSearching ? "Nenhum resultado encontrado" : ""}
      </div>
    );
  }

  return (
    <div className="results-cards-container">
      <div className="results-cards">
        {searchResults.map((result) => (
          <div
            className="result-card"
            key={result.id}
            onClick={() => onCardClick(result)}
          >
            <div className="card-header">
              <h3>{result.title}</h3>
            </div>
            <div className="card-body">
              <p className="card-subtitle">{result.subtitle}</p>
              <p className="card-details">{result.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultCards;

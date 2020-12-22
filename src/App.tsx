import { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "./Components/Button";
import Card from "./Components/Card";
import { GlobalStyles } from "./global.styles";
import { AppProvider, Autocomplete } from "@shopify/polaris";
import Link from "./Components/Link";
import enTranslations from "@shopify/polaris/locales/en.json";
import SearchMajor from "./assets/SearchMajor.svg";
import { getMoviesByTitle } from "./services/movies.service";
import { sampleMovies } from "./testing/samplemovies";
import { Movie } from "./util/interfaces";
import MovieComponent from "./Components/Movie";

const AppContainer = styled.div`
  display: flex;
  height: 100%;
`;

const ContentContainer = styled.div`
  display: flex;
  padding: 2rem 1rem;
  flex-direction: column;
  max-width: 1080px;

  @media (min-width: 769px) {
    width: 70%;
    margin: auto;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
`;

const SelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  justify-content: flex-start;
`;

const CardsContainer = styled.div`
  display: flex;
  padding: 1rem 0;
  flex-direction: row;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;

  & button {
    margin-left: auto;
    margin-top: 1rem;
    margin-right: 0;
  }

  @media (max-width: 768px) {
    width: 100%;
  }

  @media (min-width: 769px) {
    min-width: 480px;
    margin-right: 2rem;
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const NominationsContainer = styled.div`
  position: sticky;
  top: 1rem;
  height: min-content;
`;

const SearchIcon = styled.img`
  height: 24px;
  width: 24px;
  vertical-align: middle;
`;

const ActionsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 1rem 0;
  justify-content: flex-end;

  & > button:not(:first-child) {
    margin-left: 1.5rem;
  }
`;

const emptyList: Movie[] = [];

const formatMovies = (list: any[]): Movie[] =>
  list.map((movie) => ({
    poster: movie.Poster,
    title: movie.Title,
    type: movie.Type,
    year: movie.Year,
    imdbId: movie.imdbID,
  }));

// movie links https://www.imdb.com/title/{id}/

const movieInstructions = (
  <label className="detail">
    click on a movie title to learn more about it
  </label>
);

const App = () => {
  const [nominations, setNominations] = useState(emptyList);
  const [searchResults, setSearchResults] = useState(emptyList);
  const [searchQuery, setSearchQuery] = useState("");

  const handleNomination = (targetMovie: Movie) => {
    if (nominations.length === 5) {
      return;
    }

    let newNominations = [...nominations];

    if (isNominated(targetMovie.imdbId)) {
      newNominations.splice(
        nominations.findIndex((movie) => movie.imdbId === targetMovie.imdbId),
        1
      );
    } else {
      newNominations.push(targetMovie);
    }

    setNominations(newNominations);
  };

  const isNominated = (id: string) =>
    nominations.some((movie) => movie.imdbId === id);

  const completeSearch = async () => {
    const results: any = await getMoviesByTitle(searchQuery);
    const movieResults = results.Search;
    if (results) {
      const formattedList = formatMovies(movieResults);
      setSearchResults(formattedList);
    }
  };

  return (
    <AppProvider i18n={enTranslations}>
      <AppContainer>
        <GlobalStyles />
        <ContentContainer>
          <HeaderContainer>
            <h1>Hi there!</h1>
            <p>
              It’s that time of the year to choose your{" "}
              <Link href="https://docs.google.com/document/d/1AZO0BZwn1Aogj4f3PDNe1mhq8pKsXZxtrG--EIbP_-w/edit#">
                Shoppies
              </Link>{" "}
              nominations 🍿
            </p>
          </HeaderContainer>
          <SelectionContainer>
            <label>
              Select your <b>top 5</b> movies of the year using the search bar
              below
            </label>
            <CardsContainer>
              <SearchContainer>
                <Card>
                  <Autocomplete.TextField
                    onChange={(e) => setSearchQuery(e)}
                    label="Movie title"
                    value={searchQuery}
                    prefix={<SearchIcon src={SearchMajor} />}
                    placeholder="Star Wars: Rogue One"
                  />
                  <Button
                    aria-label="clear nominations"
                    onClick={() => completeSearch()}
                  >
                    search
                  </Button>
                </Card>
                <Card>
                  <label>
                    <b>Search results will appear here</b>
                  </label>
                  {searchResults.length > 0 && (
                    <ListContainer>
                      {movieInstructions}
                      {searchResults.map((movie, index) => (
                        <MovieComponent
                          key={index}
                          action={isNominated(movie.imdbId) ? "remove" : "add"}
                          onClick={() => handleNomination(movie)}
                          movie={movie}
                        ></MovieComponent>
                      ))}
                    </ListContainer>
                  )}
                </Card>
              </SearchContainer>
              <NominationsContainer>
                <Card>
                  <label>
                    <b>Your nominations are empty</b>
                  </label>
                  {nominations.length > 0 && (
                    <ListContainer>
                      {movieInstructions}
                      {nominations.map((movie, index) => (
                        <MovieComponent
                          key={index}
                          action="remove"
                          onClick={() => handleNomination(movie)}
                          movie={movie}
                        ></MovieComponent>
                      ))}
                    </ListContainer>
                  )}
                </Card>
              </NominationsContainer>
            </CardsContainer>
          </SelectionContainer>
          <ActionsContainer>
            <Button
              aria-label="clear nominations"
              secondary
              onClick={() => setNominations([])}
            >
              clear
            </Button>
            <Button aria-label="save nominations" onClick={() => {}}>
              save
            </Button>
          </ActionsContainer>
        </ContentContainer>
      </AppContainer>
    </AppProvider>
  );
};

export default App;

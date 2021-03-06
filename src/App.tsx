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
import { ListAction, Movie } from "./util/interfaces";
import MovieComponent from "./Components/Movie";
import Banner from "./Components/Banner";
import { formatMovies } from "./util/functions";
// Mock Data
// import { sampleMovies } from "./mock/samplemovies";

const NOMINATION_KEY = "SHOPPIES_LOCAL_NOMINATIONS";
const MAX_NOMINATIONS = 5;
const emptyList: Movie[] = [];

const AppContainer = styled.div`
  display: flex;
  height: 100%;
`;

const ContentContainer = styled.div`
  position: relative;
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
  flex-direction: row;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;

  & button {
    margin-left: auto;
    margin-right: 0;
  }

  @media (max-width: 768px) {
    width: 100%;
  }

  @media (min-width: 769px) {
    min-width: 480px;
    margin-right: 2rem;
    width: calc(60% - 2rem);
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
  width: 40%;

  @media (max-width: 768px) {
    width: 100%;
  }
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
  align-items: center;

  & > button:not(:first-child) {
    margin-left: 1.5rem;
  }
`;

const MovieInstructions = () => (
  <label className="detail">
    click on a movie title to learn more about it
  </label>
);

const App = () => {
  const [nominations, setNominations] = useState(emptyList);
  const [searchResults, setSearchResults] = useState(emptyList);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [complete, setComplete] = useState(false);
  const [bannerText, setBannerText] = useState("");

  useEffect(() => {
    const savedNominations = getSavedNominations();
    if (savedNominations) {
      setNominations(JSON.parse(savedNominations));
    }
  }, []);

  useEffect(() => {
    if (bannerText) {
      setTimeout(() => {
        setBannerText("");
      }, 2200);
    }
  }, [bannerText]);

  useEffect(() => {
    setComplete(nominations.length === MAX_NOMINATIONS);
    if (nominations.length === MAX_NOMINATIONS) {
      setBannerText(`You've selected all your nominations!`);
    }
  }, [nominations]);

  const getSavedNominations = () => {
    return localStorage.getItem(NOMINATION_KEY);
  };

  const saveNominations = () => {
    localStorage.setItem(NOMINATION_KEY, JSON.stringify(nominations));
    setBannerText(`Nominations saved! 🎉`);
  };

  const resetNominations = () => {
    setNominations(emptyList);
    setBannerText(`Nominations have been reset`);
  };

  window.addEventListener("beforeunload", () => {
    saveNominations();
  });

  const handleNomination = (targetMovie: Movie) => {
    let newNominations = [...nominations];

    if (isNominated(targetMovie.imdbId)) {
      newNominations.splice(
        nominations.findIndex((movie) => movie.imdbId === targetMovie.imdbId),
        1
      );
    } else {
      if (nominations.length === MAX_NOMINATIONS) {
        setBannerText(`You've selected all your nominations!`);
        return;
      }
      newNominations.push(targetMovie);
    }

    setNominations(newNominations);
  };

  const isNominated = (id: string) =>
    nominations.some((movie) => movie.imdbId === id);

  const clearSearch = () => {
    setSearchResults(emptyList);
    setActiveSearchQuery("");
  };

  const completeSearch = async () => {
    if (searchQuery === "") {
      clearSearch();
      return;
    }

    const results: any = await getMoviesByTitle(searchQuery);
    const movieResults = results.Search;
    if (movieResults) {
      const formattedList = formatMovies(movieResults);
      setSearchResults(formattedList);
      setActiveSearchQuery(searchQuery);
    } else {
      setBannerText("No movies related to that title were found!");
      clearSearch();
    }
  };

  interface MovieListProps {
    movies: Movie[];
    activeDisabled?: boolean;
    action: ListAction;
  }
  const MovieList = ({
    movies,
    activeDisabled = false,
    action,
  }: MovieListProps) => (
    <div>
      {movies.map((movie, index) => (
        <MovieComponent
          key={index}
          action={action}
          onClick={() => handleNomination(movie)}
          movie={movie}
          disabled={activeDisabled && isNominated(movie.imdbId)}
        ></MovieComponent>
      ))}
    </div>
  );

  return (
    <AppProvider i18n={enTranslations}>
      <AppContainer>
        <GlobalStyles />
        <ContentContainer>
          {bannerText && (
            <Banner type="alert">
              <label>
                <b>{bannerText}</b>
              </label>
            </Banner>
          )}
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
              Select your <b>top {MAX_NOMINATIONS}</b> movies of the year using the search bar
              below, use the <b>save</b> button to save your choices!
            </label>
            <label className="detail">
              All nominations will be saved when leaving this site.
            </label>
            <CardsContainer>
              <SearchContainer>
                <Card>
                  <Autocomplete.TextField
                    onChange={(e) => setSearchQuery(e)}
                    label="Movie title"
                    value={searchQuery}
                    prefix={<SearchIcon alt="search icon" src={SearchMajor} />}
                    placeholder="Star Wars: Rogue One"
                    type="search"
                  />
                  <ActionsContainer>
                    <Link onClick={() => setSearchResults([])}>clear</Link>
                    <Button
                      aria-label="clear nominations"
                      onClick={() => completeSearch()}
                      id="search-button"
                    >
                      search
                    </Button>
                  </ActionsContainer>
                </Card>
                <Card>
                  <label>
                    <b>
                      Search results{" "}
                      {activeSearchQuery
                        ? `for "${activeSearchQuery}"`
                        : "will appear here"}
                    </b>
                  </label>
                  {activeSearchQuery && (
                    <ListContainer id="search-results">
                      <MovieInstructions />
                      <MovieList
                        movies={searchResults}
                        action="ADD"
                        activeDisabled
                      />
                    </ListContainer>
                  )}
                </Card>
              </SearchContainer>
              <NominationsContainer>
                <Card>
                  <label>
                    <b>
                      Your nominations
                      {nominations.length > 0 ? "" : " are empty!"}
                    </b>
                  </label>
                  {nominations.length > 0 && (
                    <ListContainer>
                      <MovieInstructions />
                      <MovieList movies={nominations} action="REMOVE" />
                    </ListContainer>
                  )}
                </Card>
              </NominationsContainer>
            </CardsContainer>
          </SelectionContainer>
          {complete && (
            <Banner type="success">
              <label>
                <b>You’ve selected all your nominations!</b>
              </label>
            </Banner>
          )}
          <ActionsContainer>
            <Button
              aria-label="reset nominations"
              secondary
              onClick={() => resetNominations()}
              id="reset-button"
            >
              reset
            </Button>
            <Button
              aria-label="save nominations"
              onClick={() => saveNominations()}
              id="save-button"
            >
              save
            </Button>
          </ActionsContainer>
        </ContentContainer>
      </AppContainer>
    </AppProvider>
  );
};

export default App;

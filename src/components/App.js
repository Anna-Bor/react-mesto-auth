import { useEffect, useState } from "react";
import Header from "./Header";
import Main from "./Main";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import {
  localStorageKey,
  popupOptions,
  tooltipOptions,
} from "../utils/constants";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { api } from "../utils/api";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AddPlacePopup from "./AddPlacePopup";
import Register from "./Register";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import InfoTooltip from "./InfoTooltip";

function App() {
  const navigate = useNavigate();
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(undefined);
  const [isTooltipPopupOpen, setIsTooltipPopupOpen] = useState(false);
  const [tooltipStatus, setTooltipStatus] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const isOpen =
    tooltipStatus ||
    isEditProfilePopupOpen ||
    isAddPlacePopupOpen ||
    isEditAvatarPopupOpen ||
    selectedCard;

  function closeAllPopups(event) {
    if (
      !event ||
      event?.target.classList.contains(popupOptions.shared.openedPopupClass) ||
      event?.target.classList.contains(popupOptions.shared.closeElementClass)
    ) {
      isTooltipPopupOpen && setIsTooltipPopupOpen(false);
      isEditProfilePopupOpen && setIsEditProfilePopupOpen(false);
      isAddPlacePopupOpen && setIsAddPlacePopupOpen(false);
      isEditAvatarPopupOpen && setIsEditAvatarPopupOpen(false);
      selectedCard && setSelectedCard(undefined);
    }
  }

  function handleCardLike(card) {
    (card.likes.some((i) => i._id === currentUser._id)
      ? api.deleteLike(card._id)
      : api.putLike(card._id)
    )
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((reason) => console.log(reason));
  }

  function handleCardDelete(card) {
    setIsLoading(true);
    api
      .deleteCard(card._id)
      .then(() => {
        setCards((state) => state.filter((x) => x !== card));
      })
      .catch((reason) => console.log(reason))
      .finally(() => setIsLoading(false));
  }

  function handleUpdateUser({ name, description }) {
    setIsLoading(true);
    api
      .patchAuthor(name, description)
      .then((newAuthor) => {
        setCurrentUser(newAuthor);
        closeAllPopups();
      })
      .catch((reason) => console.log(reason))
      .finally(() => setIsLoading(false));
  }

  function handleUpdateAvatar({ avatar }) {
    setIsLoading(true);
    api
      .patchAvatar(avatar)
      .then((newAuthor) => {
        setCurrentUser(newAuthor);
        closeAllPopups();
      })
      .catch((reason) => console.log(reason))
      .finally(() => setIsLoading(false));
  }

  function handleAddPlace({ link, name }) {
    setIsLoading(true);
    api
      .postCard(link, name)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((reason) => console.log(reason))
      .finally(() => setIsLoading(false));
  }

  function register({ email, password }) {
    setIsLoading(true);
    api
      .register(email, password)
      .then(() => {
        setTooltipStatus(tooltipOptions.statuses.success);
        setIsTooltipPopupOpen(true);
      })
      .catch((reason) => {
        console.log(reason);
        setTooltipStatus(tooltipOptions.statuses.fail);
        setIsTooltipPopupOpen(true);
      })
      .finally(() => setIsLoading(false));
  }

  function login({ email, password }) {
    setIsLoading(true);
    api
      .login(email, password, () => setCurrentUserEmail(email))
      .then((response) => {
        window.localStorage.setItem(localStorageKey, response.token);
        setIsLoggedIn(true);
        navigate("/", { replace: true });
      })
      .catch((reason) => console.log(reason))
      .finally(() => setIsLoading(false));
  }

  function logout() {
    window.localStorage.removeItem(localStorageKey);
    setCurrentUserEmail("");
    setIsLoggedIn(false);
  }

  useEffect(() => {
    const token = window.localStorage.getItem(localStorageKey);

    Promise.all([
      token ? api.getAuthUser(token) : Promise.resolve(),
      api.getAuthor(),
      api.getInitialCards(),
    ])
      .then(([authUser, user, cards]) => {
        if (authUser && authUser.data) {
          setCurrentUserEmail(authUser.data.email);
          setIsLoggedIn(true);
          navigate("/", { replace: true });
        }
        setCurrentUser(user);
        setCards(cards);
      })
      .catch((reason) => console.log(reason));
  }, []);

  useEffect(() => {
    function closeByEscape(event) {
      event.key === "Escape" && closeAllPopups();
    }

    isOpen && document.addEventListener("keydown", closeByEscape);

    return () => document.removeEventListener("keydown", closeByEscape);
  }, [isOpen]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Header email={currentUserEmail} onLogout={logout} />
      <main className="content">
        <Routes>
          <Route
            path="/signup"
            element={<Register onSubmit={register} isLoading={isLoading} />}
          />
          <Route
            path="/signin"
            element={<Login onSubmit={login} isLoading={isLoading} />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                element={Main}
                onEditAvatar={() => setIsEditAvatarPopupOpen(true)}
                onEditProfile={() => setIsEditProfilePopupOpen(true)}
                onAddPlace={() => setIsAddPlacePopupOpen(true)}
                cards={cards}
                setSelectedCard={setSelectedCard}
                onCardLike={handleCardLike}
                onDeleteCard={handleCardDelete}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <InfoTooltip
        isOpen={isTooltipPopupOpen}
        onClose={closeAllPopups}
        status={tooltipStatus}
      />
      <ImagePopup card={selectedCard} onClose={closeAllPopups} />
      <EditProfilePopup
        isOpen={isEditProfilePopupOpen}
        isLoading={isLoading}
        onClose={closeAllPopups}
        onUpdateUser={handleUpdateUser}
      />
      <AddPlacePopup
        isOpen={isAddPlacePopupOpen}
        isLoading={isLoading}
        onClose={closeAllPopups}
        onAddPlace={handleAddPlace}
      ></AddPlacePopup>
      <EditAvatarPopup
        isOpen={isEditAvatarPopupOpen}
        isLoading={isLoading}
        onClose={closeAllPopups}
        onUpdateAvatar={handleUpdateAvatar}
      />
    </CurrentUserContext.Provider>
  );
}

export default App;

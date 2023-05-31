import { credentials, urls } from "./constants";
import { createPromise } from "./utils";

class Api {
  constructor(
    { baseUrl, baseHeaders },
    {
      cardsUrl,
      authorUrl,
      authorAvatarUrl,
      cardUrl,
      likeUrl,
      authUrl,
      registerUrl,
      loginUrl,
      userUrl,
    },
    authHeaders,
    promiseGenerator
  ) {
    this._baseUrl = baseUrl;
    this._baseHeaders = baseHeaders;
    this._cardsUrl = cardsUrl;
    this._authorUrl = authorUrl;
    this._authorAvatarUrl = authorAvatarUrl;
    this._cardUrl = cardUrl;
    this._likeUrl = likeUrl;
    this._promiseGenerator = promiseGenerator;
    this._authUrl = authUrl;
    this._registerUrl = registerUrl;
    this._loginUrl = loginUrl;
    this._userUrl = userUrl;
    this._authHeaders = authHeaders;
  }

  getInitialCards() {
    return this._promiseGenerator(
      this._baseUrl + this._cardsUrl,
      this._baseHeaders
    );
  }

  getAuthor() {
    return this._promiseGenerator(
      this._baseUrl + this._authorUrl,
      this._baseHeaders
    );
  }

  patchAuthor(name, description) {
    return this._promiseGenerator(
      this._baseUrl + this._authorUrl,
      this._baseHeaders,
      "PATCH",
      { name: name, about: description }
    );
  }

  postCard(link, name) {
    return this._promiseGenerator(
      this._baseUrl + this._cardsUrl,
      this._baseHeaders,
      "POST",
      { name: name, link: link }
    );
  }

  deleteCard(cardId) {
    return this._promiseGenerator(
      this._baseUrl + this._cardUrl.template.replace(this._cardUrl.key, cardId),
      this._baseHeaders,
      "DELETE"
    ).then(() => cardId);
  }

  putLike(cardId) {
    return this._promiseGenerator(
      this._baseUrl + this._likeUrl.template.replace(this._likeUrl.key, cardId),
      this._baseHeaders,
      "PUT"
    );
  }

  deleteLike(cardId) {
    return this._promiseGenerator(
      this._baseUrl + this._likeUrl.template.replace(this._likeUrl.key, cardId),
      this._baseHeaders,
      "DELETE"
    );
  }

  patchAvatar(url) {
    return this._promiseGenerator(
      this._baseUrl + this._authorAvatarUrl,
      this._baseHeaders,
      "PATCH",
      { avatar: url }
    );
  }

  register(email, password) {
    return this._promiseGenerator(
      this._authUrl + this._registerUrl,
      this._baseHeaders,
      "POST",
      {
        email: email,
        password: password,
      }
    );
  }

  login(email, password) {
    return this._promiseGenerator(
      this._authUrl + this._loginUrl,
      this._baseHeaders,
      "POST",
      {
        email: email,
        password: password,
      }
    );
  }

  getAuthUser(token) {
    return this._promiseGenerator(this._authUrl + this._userUrl, {
      ...this._authHeaders,
      Authorization: `Bearer ${token}`,
    });
  }
}

export const api = new Api(
  {
    baseUrl: `${urls.baseUrl}/${credentials.group}/`,
    baseHeaders: {
      authorization: credentials.token,
      "Content-Type": "application/json",
    },
  },
  urls,
  {
    "Content-Type": "application/json",
  },
  createPromise
);

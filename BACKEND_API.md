# Midzoe Backend API — Intégration Frontend

> **Base URL:** `https://midzobackend.vercel.app/api`
> **Content-Type:** `application/json`
> **Auth:** `Authorization: Bearer <token>` pour les routes protégées

---

## Flux complet d'inscription

```
1. POST /auth/register              → { success: true }
2. POST /auth/verify-email          → { success: true, token, user }  ← login auto ici
   POST /auth/resend-verification   (optionnel, si l'utilisateur n'a pas reçu le code)
```

---

## Étape 1 — Inscription

### POST `/auth/register`

```js
const res = await fetch("https://midzobackend.vercel.app/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: email.split("@")[0].replace(/[^a-z0-9]/gi, "_"), // auto-généré
    email: "john@example.com",
    password: "secret123",
    first_name: "John",    // optionnel
    last_name: "Doe",      // optionnel
    phone: "+33612345678"  // optionnel
  })
});

const data = await res.json();
// Succès : { success: true }
// → afficher l'écran de saisie du code
```

> ⚠️ **Aucun token n'est retourné ici.** Le compte est créé mais l'utilisateur n'est pas encore authentifié.

**Gestion des erreurs**

```js
if (!data.success) {
  if (data.error.includes("email")) {
    showError("Un compte avec cet email existe déjà.");
  } else {
    showError("Erreur lors de l'inscription.");
  }
}
```

| `error`                   | HTTP | Message à afficher                                   |
|--------------------------|------|------------------------------------------------------|
| `"email already exists"` | 400  | Un compte avec cet email existe déjà.                |
| `"username already exists"` | 400 | Ce nom d'utilisateur est déjà pris.                 |
| `"email is required"`    | 400  | L'email est requis.                                  |
| `"password is required"` | 400  | Le mot de passe est requis.                          |
| `"password too short"`   | 400  | Le mot de passe doit contenir au moins 6 caractères. |
| `"invalid email format"` | 400  | Format d'email invalide.                             |
| `"internal server error"` | 500 | Erreur serveur, réessayer.                           |

---

## Étape 2 — Vérification du code

### POST `/auth/verify-email`

```js
const res = await fetch("https://midzobackend.vercel.app/api/auth/verify-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "john@example.com",
    code: "482931"  // saisi par l'utilisateur (6 chiffres)
  })
});

const data = await res.json();
// Succès : { success: true, token, user }

if (data.success) {
  localStorage.setItem("midzo_token", data.token);
  localStorage.setItem("midzo_user", JSON.stringify(data.user));
  // → rediriger vers le dashboard
}
```

**Structure de `user` retourné**

```json
{
  "id": 42,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+33612345678"
}
```

**Gestion des erreurs**

| `error`              | HTTP | Message à afficher                        |
|---------------------|------|-------------------------------------------|
| `"invalid code"`    | 400  | Code incorrect.                           |
| `"code expired"`    | 400  | Code expiré. Demandez-en un nouveau.      |
| `"user not found"`  | 404  | Email non reconnu.                        |
| `"already verified"` | 400 | Email déjà vérifié, connectez-vous.       |

---

## Renvoi du code (optionnel)

### POST `/auth/resend-verification`

```js
const res = await fetch("https://midzobackend.vercel.app/api/auth/resend-verification", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "john@example.com" })
});

const data = await res.json();
// Succès : { success: true }
```

**Gestion des erreurs**

| `error`               | HTTP | Comportement frontend                       |
|----------------------|------|---------------------------------------------|
| `"too many requests"` | 429 | Désactiver le bouton 60 secondes (cooldown) |
| `"already verified"`  | 400 | Rediriger vers la connexion                 |
| `"user not found"`    | 404 | Email introuvable                           |

---

## Connexion

### POST `/auth/login`

> **Actuellement :** le frontend envoie `username` (ancienne route compatible). À migrer vers `identifier` (email ou username) quand le backend sera prêt.

```js
const res = await fetch("https://midzobackend.vercel.app/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "john_doe",   // temporaire — à remplacer par identifier (email ou username)
    password: "secret123"
  })
});

const data = await res.json();
// Succès : { success: true, token, user }
```

**Gestion des erreurs**

| `error`                 | HTTP | Cas                                           |
|------------------------|------|-----------------------------------------------|
| `"invalid credentials"` | 401 | Mauvais identifiants                          |
| `"email not verified"`  | 403 | Compte créé mais email pas encore vérifié     |
| `"username is required"` | 400 | Champ manquant                               |
| `"password is required"` | 400 | Champ manquant                               |

---

## Requêtes authentifiées

Pour toutes les routes protégées (`/auth/profile`, etc.) :

```js
const token = localStorage.getItem("midzo_token");

fetch("https://midzobackend.vercel.app/api/auth/profile", {
  headers: { "Authorization": `Bearer ${token}` }
});
```

### GET `/auth/profile` — Récupérer le profil

**Réponse :** `{ success: true, user: { id, username, email, first_name, last_name, phone } }`

### PUT `/auth/profile` — Mettre à jour le profil

```js
fetch("https://midzobackend.vercel.app/api/auth/profile", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    first_name: "John",  // tous les champs sont optionnels
    last_name: "Doe",
    email: "new@example.com",
    phone: "+33612345678"
  })
});
```

**Réponse :** `{ success: true, user: { ... } }`

---

## Notes d'implémentation backend

### Code de vérification
- Générer un code **numérique à 6 chiffres** aléatoire : `Math.floor(100000 + Math.random() * 900000)`
- Stocker le code haché (bcrypt ou SHA-256) avec un **timestamp de création**
- **Expiry : 15 minutes**
- Après vérification réussie : marquer `email_verified = true` et supprimer le code
- Envoyer via email transactionnel (SendGrid, Resend, Nodemailer…)
- Sujet suggéré : *"Votre code de vérification Midzoe : 482931"*

### Token JWT
- Signé avec `process.env.JWT_SECRET`
- **Expiry recommandé : 7 jours**
- Clés localStorage utilisées par le frontend : `midzo_token` et `midzo_user`

### CORS
Autoriser les origines :
- `http://localhost:5173` (serveur de dev Vite)
- Domaine de production (à mettre à jour)

---

## Points clés à retenir

| # | Point |
|---|-------|
| 1 | Le `username` est **auto-généré** côté frontend depuis l'email — aucun champ visible pour l'utilisateur |
| 2 | **Pas de token au step 1** (register) — le token arrive uniquement après vérification email |
| 3 | Les codes expirent en **15 minutes** |
| 4 | Cooldown de **60 secondes** entre deux renvois de code |
| 5 | Toutes les erreurs suivent le format `{ success: false, error: "..." }` |
| 6 | Clés localStorage : `midzo_token` et `midzo_user` |

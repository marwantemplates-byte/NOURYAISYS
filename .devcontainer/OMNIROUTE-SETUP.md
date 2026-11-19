# OmniRoute dans Codespaces (NOURYS)

Teste: `npm install omniroute` puis la commande `omniroute` demarre bien sur le port 20128
(tableau de bord: http://localhost:20128, API: http://localhost:20128/v1).

1. Ouvrir ce depot dans un Codespace (branche `omniroute-setup`). Installation automatique (1-3 min).
2. Dans le terminal:

   export INITIAL_PASSWORD="CHOISIS-UN-MOT-DE-PASSE-LONG"
   omniroute

   (le serveur ecoute sur 127.0.0.1 et exige une cle API: reglages deja dans devcontainer.json)
3. Onglet PORTS -> ouvrir le port 20128 (garder la visibilite *Private*).
4. Dans la console: connecter un fournisseur (cle API / OAuth) puis creer une cle OmniRoute.
5. Claude Code via OmniRoute (a tester; /v1/messages repond):

   export ANTHROPIC_BASE_URL="http://localhost:20128"
   export ANTHROPIC_AUTH_TOKEN="LA-CLE-OMNIROUTE"
   export ANTHROPIC_MODEL="auto"
   claude

   Si ca echoue, utiliser un outil OpenAI-compatible avec http://localhost:20128/v1 (voir README OmniRoute, "Compatible CLIs").

Ne jamais commiter de cle API dans ce depot (il est public).

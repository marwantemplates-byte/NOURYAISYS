# OmniRoute dans Codespaces (NOURYS)

1. Ouvrir ce depot dans un Codespace (branche `omniroute-setup`).
   Le conteneur installe automatiquement `omniroute` et `claude-code` (patienter 1-3 min).
2. Dans le terminal, choisir un mot de passe admin (ne jamais laisser CHANGEME) puis lancer:

   export INITIAL_PASSWORD="CHOISIS-UN-MOT-DE-PASSE-LONG"
   omniroute

   (si la commande est differente: `omniroute --help` ou voir le README officiel
   https://github.com/diegosouzapw/OmniRoute)
3. Le port 20128 est transfere: ouvrir l'onglet PORTS, puis le lien du port 20128 pour la console.
   Ne jamais rendre ce port public.
4. Dans la console: connecter un fournisseur (cle API ou OAuth), creer une cle OmniRoute.
5. Les outils en terminal utilisent `http://localhost:20128/v1` avec la cle OmniRoute et le modele `auto`.
   Voir la section "Compatible CLIs" du README pour la config exacte de chaque outil.

Ne jamais commiter de cle API dans ce depot (il est public).

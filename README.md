# FinexAI — Guide de déploiement

## Structure du projet
```
finexai/
├── index.html        ← L'application complète (front-end)
├── api/
│   └── analyze.js    ← Serverless function (appel API Anthropic)
├── vercel.json       ← Config Vercel
└── package.json
```

## Déploiement sur Vercel (10 minutes)

### Étape 1 — Créer un compte Vercel
→ https://vercel.com/signup (gratuit, connecte-toi avec GitHub)

### Étape 2 — Mettre le projet sur GitHub
1. Crée un nouveau repo sur https://github.com/new (ex: `finexai`)
2. Upload les 4 fichiers : `index.html`, `api/analyze.js`, `vercel.json`, `package.json`
   - Attention : `analyze.js` doit être dans un dossier `api/`

### Étape 3 — Déployer sur Vercel
1. Va sur https://vercel.com/new
2. Importe ton repo GitHub `finexai`
3. Clique "Deploy" sans rien changer

### Étape 4 — Ajouter ta clé API Anthropic (CRUCIAL)
1. Dans Vercel → ton projet → **Settings** → **Environment Variables**
2. Ajoute :
   - **Name** : `ANTHROPIC_API_KEY`
   - **Value** : ta clé API (commence par `sk-ant-...`)
   - Tu récupères ta clé sur : https://console.anthropic.com/settings/keys
3. Clique **Save**, puis **Deployments** → **Redeploy**

### Étape 5 — Ton site est en ligne !
Vercel te donne une URL type : `https://finexai-ton-nom.vercel.app`
C'est ce lien que tu envoies dans tes mails de candidature.

## Utilisation dans tes mails

> *"J'ai développé un outil d'analyse de documents financiers par IA — je l'ai pensé notamment pour [contrats d'assurance / rapports ESG / term sheets]. Démo live : https://finexai-ton-nom.vercel.app"*

Adapte la phrase selon la startup ciblée.

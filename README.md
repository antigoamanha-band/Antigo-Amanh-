# Antigo Amanhã — site oficial

Protótipo do site público + hub privado da banda, no formato "Studio/Admin".

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000 para o site público e http://localhost:3000/admin para o painel (ainda sem login real).

## Estrutura

- `app/` — páginas do site público (Início, Sobre, Discografia, Clipes, Notícias, Contato) e `app/admin` (hub privado, protótipo).
- `components/` — Header e Footer compartilhados.
- `lib/data.ts` — dados de exemplo (trocar por dados reais / banco de dados).

## Próximos passos

1. Trocar os dados de exemplo em `lib/data.ts` pelos dados reais da banda.
2. Conectar um banco de dados (ex.: Supabase) para Músicas, Ideias, Publicações, Agenda e Arquivos.
3. Implementar login real dos integrantes (ex.: Supabase Auth) protegendo `/admin`.
4. Publicar (ex.: Vercel) e apontar o domínio da banda.

## Enviar para o GitHub

```bash
git init
git add .
git commit -m "scaffold inicial do site"
git branch -M main
git remote add origin https://github.com/antigoamanha-band/Antigo-Amanh-.git
git push -u origin main
```

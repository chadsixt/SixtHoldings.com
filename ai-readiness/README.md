# AI Readiness Analyzer

A static browser-based AI readiness assessment for Sixt Holdings.

## Deploy on GitHub Pages

Place this entire folder in the repository that serves `sixtholdings.com`:

```text
repository-root/
├── index.html
├── ...
└── ai-readiness/
    ├── index.html
    ├── app.js
    └── style.css
```

Commit and push the files. Once GitHub Pages publishes the update, the tool should be available at:

`https://sixtholdings.com/ai-readiness/`

## Notes

- No API key is required.
- No backend is required.
- User-entered text stays in the browser.
- The current version is a rules-based natural-language scoring model intended as a demonstration and conversation starter.

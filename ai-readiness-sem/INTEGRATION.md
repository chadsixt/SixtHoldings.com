# Sixt Holdings AI Readiness Semantic Upgrade

## What this is

This upgrade replaces a primarily keyword-based assessment with a hybrid semantic assessment.

The browser loads the small `mixedbread-ai/mxbai-embed-xsmall-v1` embedding model through Transformers.js. The user's description is converted into embedding vectors. Those vectors are compared with maturity and immaturity reference statements for each readiness dimension.

The final score is currently:

* 65% semantic similarity
* 35% transparent keyword and rules scoring

The rules component gives the assessment stability and explainability. The semantic component lets it recognize equivalent concepts even when the user does not use the exact keywords in the rules.

## Integration

Copy these four files into your existing GitHub Pages folder:

```text
ai-readiness/
├── index.html
├── app.js
├── semantic-model.js
└── style.css
```

If you already have the older AI Readiness Analyzer, replace its `index.html`, `app.js`, and `style.css`, then add `semantic-model.js`.

Your URL remains:

```text
https://sixtholdings.com/ai-readiness/
```

## Git commands

From your repository root:

```bash
git status
git add ai-readiness/
git commit -m "Add semantic AI readiness scoring"
git push
```

## Important change to index.html

The JavaScript is now an ES module:

```html
<script type="module" src="app.js"></script>
```

Do not change it back to a normal script tag because `app.js` imports `semantic-model.js`.

## First-run behavior

The first analysis downloads the Transformers.js runtime and the embedding model. This makes the first analysis slower than later runs. Browser caching should make subsequent use faster.

The assessment text is processed by the model in the browser. There is no OpenAI API key and no application backend.

## How the semantic score works

Each dimension has four example statements representing stronger maturity and four representing weaker maturity.

For each submitted sentence:

1. Create an embedding vector.
2. Compare it with mature prototype vectors.
3. Compare it with immature prototype vectors.
4. Calculate the difference between those similarities.
5. Convert the difference into a dimension score.
6. Blend it with the rules score.

This is a prototype classifier built on a pretrained embedding model. It is not yet a model trained specifically on CIMM data.

## Recommended next step

Create a calibration dataset of 20 to 50 sample organizational descriptions with expert-assigned scores for the five dimensions. Then tune the maturity statements, score conversion, and semantic/rules weighting against those expert assessments.

That is the point where this moves from a semantic demonstration toward a defensible domain-specific maturity assessment.

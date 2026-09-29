# Layer & Form — 3D print studio catalog

A responsive, single-page portfolio/catalog with warm ivory and sage colors, a matching dark theme, category filters, search, product detail dialogs, and contact links. No cart, payments, backend, or build step.

## Preview

Open `index.html` directly in your browser, or use your editor’s Live Server extension. To serve it locally with Python:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`. The site also works on GitHub Pages: publish the repository root through your repository’s **Settings → Pages**.

## Make it your own

**Start with `products.js`.** All six products are editable examples, and “Layer & Form” is a placeholder studio name. The included SVG illustrations are original vector concept art, not photos of real products. Replace the example descriptions and technical details with your actual offerings before sharing the catalog.

### Add your contacts

At the top of `products.js`, fill in these fields:

```js
email: 'you@example.com',
instagram: 'https://www.instagram.com/yourname/',
tiktok: 'https://www.tiktok.com/@yourname',
```

Only populated contacts appear. Leave any unused field empty (`''`). Social URLs must start with `https://`. Email opens the visitor’s email app; social links open in a new tab. There are no invented live contact accounts in the demo.

### Add a product

Copy an object inside the `products` array, add a comma between entries, and edit its fields:

```js
{
  id: 'my-new-lamp',
  name: 'My new lamp',
  category: 'Lamps',
  label: 'A short sentence for the card.',
  image: 'images/my-new-lamp.webp',
  alt: 'A cream-colored lamp with a pleated shade on a wooden desk',
  badge: 'MAKE IT PERSONAL', // Use '' for no badge
  description: 'A longer description displayed when someone opens this item.',
  details: ['Available colors: cream, sage', 'Your actual dimensions', 'Personalization options']
},
```

Products appear in array order. Delete an object to remove it. New category names automatically create filter buttons. Search covers the name, category, short label, and description. Use double quotes for strings containing apostrophes, or escape them as `\'`.

### Add or replace images

1. Put your photo in the `images/` folder. Use lowercase names with hyphens, e.g. `sage-lamp.webp`.
2. Set the product’s `image` field to `images/sage-lamp.webp`.
3. Write a useful `alt` description for people using screen readers.

WebP or JPG around **1200 × 960 pixels** works well. Try to keep files under 300 KB. Cards crop to a 5:4 frame, so leave breathing room around the product. PNG and SVG also work. Paths and filename capitalization must match exactly on hosting.

The large hero illustration is `images/studio.svg`. To replace it, change the hero `<img>` in `index.html`, including `src` and `alt`. Its display frame is close to square. The editable illustrations can be regenerated with `python images/generate.py`; this overwrites only the seven supplied SVG files.

### Change branding, text, and colors

- **`index.html`**: studio name/logo, page title, search-engine description, introduction, studio story, custom service section, and footer. Search for `Layer & Form` and `layer` to find the demo branding.
- **`styles.css`**: edit variables in `:root` for the light palette and `:root[data-theme=dark]` for the dark palette. The theme initially follows the visitor’s device and remembers their manual choice when browser storage is available.
- **`products.js`**: products, categories, images, and contacts.
- **`app.js`**: filtering, product dialogs, theme behavior, and contact rendering. Ordinary catalog updates don’t require editing it.

The fonts load from Google Fonts with local sans-serif fallbacks. For a fully offline setup, remove the first `@import` in `styles.css`, or self-host your preferred fonts.

### Add a section or a separate page

For a service or short story, add a section to `index.html` before `</main>`:

```html
<section id="process" class="about wrap">
  <div><p class="eyebrow">HOW IT WORKS</p><h2>From idea to object.</h2></div>
  <div><p>Explain your design and printing process here.</p></div>
</section>
```

Link to it using `<a href="#process">The process</a>`. For a separate blog or project page, copy `index.html` to `my-project.html` in the same folder, replace its main content, give it a unique title and description, and change home-section links to `index.html#collection`, `index.html#about`, etc. Keep the catalog elements if keeping `app.js`; for a standalone article, remove both script tags (`products.js` and `app.js`) and the theme button, or implement its theme toggle separately. Reuse `styles.css` and the small theme initialization script in the head. Add a link to your page from `index.html`.

## Accessibility and behavior

The catalog includes visible focus indicators, image descriptions, live result counts, reduced-motion support, native modal dialogs (Escape closes; focus returns to the product), and touch-friendly controls. Search and filters work together. Product/contact actions never place an order.

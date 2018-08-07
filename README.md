**This library is experimental**

To get a super fast first paint of your HTML pages, google recommends that you insert all CSS required to display your above the fold content directly in your page's head. So then loadding your full stylesheets can be moved after content. See https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery

To generate this critical CSS you can use tools like [penthouse](https://github.com/pocketjoso/penthouse) but as this is spinning a headless chrome under the hood, it shouldn't be used to generate the CSS on the fly. The problem is that calculating above the fold content is complicated and can't be accurate because you don't actually know your clien's browser size. Also, if the user scrolls the page while your full CSS is loading, he may see unstyled content.

`initial-css-builder` simply takes HTML and CSS strings and returns only the CSS used. Because it's not only above the fold CSS, I call it "initial CSS" rather than "critical CSS". Also it's lighting fast so you can safely use it to generate initial CSS on the fly for each request. It usually takes under 5ms!

## Setup

```
npm i initial-css-builder
```

## Usage

```js
import initialCssBuilder from 'initial-css-builder';

// appCss: string containing all your app's CSS.
// If you have multiple steelsheets, simply join them together

// Declare getInitialCss as a global variable so CSS parsing is done only once
const getInitialCss = initialCssBuilder(appCss);

// For each request, you can now generate your initial CSS
// Usually takes less than 5ms!
const initialCSS = getInitialCss(contentHtml);

// then you should inject `initialCSS` in a `<style>` tag in your `head`
```

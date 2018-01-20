/* tslint:disable max-line-length */
import getInitialCSSBuilder from ".";

describe("initialCssBuilder", () => {
  let getInitialCss: Function;

  beforeAll(() => {
    getInitialCss = getInitialCSSBuilder(`
      @font-face {
        font-family:Walsheim;
        font-weight:100;
        src:url(/dist/GT-Walsheim-Ultra-Light-43199cd6.woff) format("woff")
      }
      .class_1 {
        background: #000;
      }
      @media screen and (max-width:550px) {
        .class_1 {
          background: #fff;
        }
      }
      .class_2 {
        bacground: blue;
      }
      @media screen and (max-width:550px) {
        .class_2 {
          background:red;
        }
      }
      
      @keyframes test {
        from {background-color: red;}
        to {background-color: yellow;}
      }
      .class_3 {
        animation-name: test;
        animation-duration: 4s;
      }
    `);
  });

  it("should extract classnames & associated @rules", () => {
    const initialCSS = getInitialCss(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>title</title>
        </head>
        <body>
          <p>Paragraph with no class</p>
          <h1 class="class_1">H1 with class class_1</h1>
        </body>
      </html>
    `);

    expect(initialCSS).toContain(".class_1");
    expect(initialCSS).not.toContain(".class_2");
    expect(initialCSS).not.toContain(".class_3");
    expect(initialCSS).not.toContain(
      "@media screen and (max-width:550px){.class_2{background:#fff;}}"
    );

    expect(initialCSS).toContain("@font-face{font-family:Walsheim");
    expect(initialCSS).toContain(
      "@media screen and (max-width:550px){.class_1{background:#fff;}}"
    );
    expect(initialCSS).toContain(
      "@keyframes test{from{background-color:red;}to{background-color:yellow;}}"
    );
  });

  it("should extract animations keyframes", () => {
    const initialCSS = getInitialCss(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>title</title>
        </head>
        <body>
          <p>Paragraph with no class</p>
          <h1 class="class_3">H1 with class class_1</h1>
        </body>
      </html>
    `);

    expect(initialCSS).toContain(".class_3");
    expect(initialCSS).not.toContain(".class_1");
    expect(initialCSS).not.toContain(".class_2");
    expect(initialCSS).not.toContain(
      "@media screen and (max-width:550px){.class_1{background:#fff;}}"
    );
    expect(initialCSS).not.toContain(
      "@media screen and (max-width:550px){.class_2{background:#fff;}}"
    );

    expect(initialCSS).toContain("@font-face{font-family:Walsheim");
    expect(initialCSS).toContain(
      "@keyframes test{from{background-color:red;}to{background-color:yellow;}}"
    );
  });
});

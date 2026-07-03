import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { splitHtmlIntoGridItems } from "./split-html-grid-items";

describe("splitHtmlIntoGridItems", () => {
  it("splits html by glue grid item hr delimiters", () => {
    const html =
      "<strong>1. Select a plan</strong><br />Select a fitting plan." +
      '<hr data-glue-grid-item="" />' +
      "<strong>2. Sign up</strong><br />Create an account." +
      '<hr data-glue-grid-item="" />' +
      "<strong>3. Get Access</strong><br />Once approved." +
      '<hr data-glue-grid-item="" />' +
      "<strong>4. Complete Portfolio</strong><br />Enter your details.";

    const items = splitHtmlIntoGridItems(html, "auto");

    assert.equal(items.length, 4);
    assert.match(items[0], /Select a plan/);
    assert.match(items[1], /Sign up/);
    assert.match(items[2], /Get Access/);
    assert.match(items[3], /Complete Portfolio/);
  });

  it("falls back to double line break split for legacy cms html", () => {
    const html =
      "<strong>1. Select a plan</strong><br />Select a fitting plan.<br /><br />" +
      "<strong>2. Sign up</strong><br />Create an account to begin your application.<br /><br />" +
      "<strong>3. Get Access</strong><br />Once your application has been approved, you will gain access to your personal dashboard.<br /><br />" +
      "<strong>4. Complete Portfolio</strong><br />Enter your details, images and other information to appear on the GLUE website.";

    const items = splitHtmlIntoGridItems(html, "auto");

    assert.equal(items.length, 4);
    assert.match(items[0], /Select a plan/);
    assert.match(items[1], /Sign up/);
    assert.match(items[2], /Get Access/);
    assert.match(items[3], /Complete Portfolio/);
  });

  it("falls back to paragraph split when no delimiters exist", () => {
    const html =
      "<p>First paragraph</p><p>Second paragraph</p><p>Third paragraph</p>";

    const items = splitHtmlIntoGridItems(html, "auto");

    assert.equal(items.length, 3);
    assert.match(items[0], /First paragraph/);
    assert.match(items[1], /Second paragraph/);
    assert.match(items[2], /Third paragraph/);
  });

  it("returns a single block when no split markers are found", () => {
    const html = "<strong>Title</strong><br />Single block of content.";

    const items = splitHtmlIntoGridItems(html, "auto");

    assert.equal(items.length, 1);
    assert.equal(items[0], html);
  });

  it("tolerates hr delimiter variants", () => {
    const html =
      "Item one<hr data-glue-grid-item />Item two<hr data-glue-grid-item='' />Item three";

    const items = splitHtmlIntoGridItems(html, "delimiter");

    assert.equal(items.length, 3);
    assert.match(items[0], /Item one/);
    assert.match(items[1], /Item two/);
    assert.match(items[2], /Item three/);
  });

  it("returns an empty array for empty html", () => {
    assert.deepEqual(splitHtmlIntoGridItems(""), []);
    assert.deepEqual(splitHtmlIntoGridItems("   "), []);
  });
});

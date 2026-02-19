# `oro:test`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:test'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:test
oro:test/context
oro:test/dom-helpers
oro:test/fast-deep-equal
oro:test/harness
oro:test/index
```

### TypeScript declarations

<details>
<summary><code>oro:test</code></summary>

```ts
declare module 'oro:test' {
  export * from 'oro:test/index'
  export default test
  import test from 'oro:test/index'
}
```

</details>

<details>
<summary><code>oro:test/context</code></summary>

```ts
declare module 'oro:test/context' {
  export default function _default(GLOBAL_TEST_RUNNER: any): void
}
```

</details>

<details>
<summary><code>oro:test/dom-helpers</code></summary>

```ts
declare module 'oro:test/dom-helpers' {
  /**
   * Converts querySelector string to an HTMLElement or validates an existing HTMLElement.
   *
   * @export
   * @param {string|Element} selector - A CSS selector string, or an instance of HTMLElement, or Element.
   * @returns {Element} The HTMLElement, Element, or Window that corresponds to the selector.
   * @throws {Error} Throws an error if the `selector` is not a string that resolves to an HTMLElement or not an instance of HTMLElement, Element, or Window.
   *
   */
  export function toElement(selector: string | Element): Element
  /**
   * Waits for an element to appear in the DOM and resolves the promise when it does.
   *
   * @export
   * @param {Object} args - Configuration arguments.
   * @param {string} [args.selector] - The CSS selector to look for.
   * @param {boolean} [args.visible=true] - Whether the element should be visible.
   * @param {number} [args.timeout=defaultTimeout] - Time in milliseconds to wait before rejecting the promise.
   * @param {() => HTMLElement | Element | null | undefined} [lambda] - An optional function that returns the element. Used if the `selector` is not provided.
   * @returns {Promise<Element|HTMLElement|void>} - A promise that resolves to the found element.
   *
   * @throws {Error} - Throws an error if neither `lambda` nor `selector` is provided.
   * @throws {Error} - Throws an error if the element is not found within the timeout.
   *
   * @example
   * ```js
   * waitFor({ selector: '#my-element', visible: true, timeout: 5000 })
   *   .then(el => console.log('Element found:', el))
   *   .catch(err => console.log('Element not found:', err));
   * ```
   */
  export function waitFor(
    args: {
      selector?: string
      visible?: boolean
      timeout?: number
    },
    lambda?: () => HTMLElement | Element | null | undefined
  ): Promise<Element | HTMLElement | void>
  /**
   * Waits for an element's text content to match a given string or regular expression.
   *
   * @export
   * @param {Object} args - Configuration arguments.
   * @param {Element} args.element - The root element from which to begin searching.
   * @param {string} [args.text] - The text to search for within elements.
   * @param {RegExp} [args.regex] - A regular expression to match against element text content.
   * @param {boolean} [args.multipleTags=false] - Whether to look for text across multiple sibling elements.
   * @param {number} [args.timeout=defaultTimeout] - Time in milliseconds to wait before rejecting the promise.
   * @returns {Promise<Element|HTMLElement|void>} - A promise that resolves to the found element or null.
   *
   * @example
   * ```js
   * waitForText({ element: document.body, text: 'Hello', timeout: 5000 })
   *   .then(el => console.log('Element found:', el))
   *   .catch(err => console.log('Element not found:', err));
   * ```
   */
  export function waitForText(args: {
    element: Element
    text?: string
    regex?: RegExp
    multipleTags?: boolean
    timeout?: number
  }): Promise<Element | HTMLElement | void>
  /**
   * @export
   * @param {Object} args - Arguments
   * @param {string | Event} args.event - The event to dispatch.
   * @param {HTMLElement | Element | window} [args.element=window] - The element to dispatch the event on.
   * @returns {void}
   *
   * @throws {Error} Throws an error if the `event` is not a string that can be converted to a CustomEvent or not an instance of Event.
   */
  export function event(args: {
    event: string | Event
    element?: HTMLElement | Element | (Window & typeof globalThis)
  }): void
  /**
   * @export
   * Copy pasted from https://raw.githubusercontent.com/testing-library/jest-dom/master/src/to-be-visible.js
   * @param {Element | HTMLElement} element
   * @param {Element | HTMLElement} [previousElement]
   * @returns {boolean}
   */
  export function isElementVisible(
    element: Element | HTMLElement,
    previousElement?: Element | HTMLElement
  ): boolean
}
```

</details>

<details>
<summary><code>oro:test/fast-deep-equal</code></summary>

```ts
declare module 'oro:test/fast-deep-equal' {
  export default function equal(a: any, b: any): boolean
}
```

</details>

<details>
<summary><code>oro:test/harness</code></summary>

```ts
declare module 'oro:test/harness' {
  /**
   * @typedef {import('./index').Test} Test
   * @typedef {(t: Test) => Promise<void> | void} TestCase
   * @typedef {{
   *    bootstrap(): Promise<void>
   *    close(): Promise<void>
   * }} Harness
   */
  /**
   * @template {Harness} T
   * @typedef {{
   *    (
   *      name: string,
   *      cb?: (harness: T, test: Test) => (void | Promise<void>)
   *    ): void;
   *    (
   *      name: string,
   *      opts: object,
   *      cb: (harness: T, test: Test) => (void | Promise<void>)
   *    ): void;
   *    only(
   *      name: string,
   *      cb?: (harness: T, test: Test) => (void | Promise<void>)
   *    ): void;
   *    only(
   *      name: string,
   *      opts: object,
   *      cb: (harness: T, test: Test) => (void | Promise<void>)
   *    ): void;
   *    skip(
   *      name: string,
   *      cb?: (harness: T, test: Test) => (void | Promise<void>)
   *    ): void;
   *    skip(
   *      name: string,
   *      opts: object,
   *      cb: (harness: T, test: Test) => (void | Promise<void>)
   *    ): void;
   * }} TapeTestFn
   */
  /**
   * @template {Harness} T
   * @param {import('./index.js')} tapzero
   * @param {new (options: object) => T} harnessClass
   * @returns {TapeTestFn<T>}
   */
  export function wrapHarness<T extends Harness>(
    tapzero: typeof import('oro:test/index'),
    harnessClass: new (options: object) => T
  ): TapeTestFn<T>
  export default exports
  /**
   * @template {Harness} T
   */
  export class TapeHarness<T extends Harness> {
    /**
     * @param {import('./index.js')} tapzero
     * @param {new (options: object) => T} harnessClass
     */
    constructor(
      tapzero: typeof import('oro:test/index'),
      harnessClass: new (options: object) => T
    )
    /** @type {import('./index.js')} */
    tapzero: typeof import('oro:test/index')
    /** @type {new (options: object) => T} */
    harnessClass: new (options: object) => T
    /**
     * @param {string} testName
     * @param {object} [options]
     * @param {(harness: T, test: Test) => (void | Promise<void>)} [fn]
     * @returns {void}
     */
    test(
      testName: string,
      options?: object,
      fn?: (harness: T, test: Test) => void | Promise<void>
    ): void
    /**
     * @param {string} testName
     * @param {object} [options]
     * @param {(harness: T, test: Test) => (void | Promise<void>)} [fn]
     * @returns {void}
     */
    only(
      testName: string,
      options?: object,
      fn?: (harness: T, test: Test) => void | Promise<void>
    ): void
    /**
     * @param {string} testName
     * @param {object} [options]
     * @param {(harness: T, test: Test) => (void | Promise<void>)} [fn]
     * @returns {void}
     */
    skip(
      testName: string,
      options?: object,
      fn?: (harness: T, test: Test) => void | Promise<void>
    ): void
    /**
     * @param {(str: string, fn?: TestCase) => void} tapzeroFn
     * @param {string} testName
     * @param {object} [options]
     * @param {(harness: T, test: Test) => (void | Promise<void>)} [fn]
     * @returns {void}
     */
    _test(
      tapzeroFn: (str: string, fn?: TestCase) => void,
      testName: string,
      options?: object,
      fn?: (harness: T, test: Test) => void | Promise<void>
    ): void
    /**
     * @param {Test} assert
     * @param {object} options
     * @param {(harness: T, test: Test) => (void | Promise<void>)} fn
     * @returns {Promise<void>}
     */
    _onAssert(
      assert: Test,
      options: object,
      fn: (harness: T, test: Test) => void | Promise<void>
    ): Promise<void>
  }
  export type Test = import('oro:test/index').Test
  export type TestCase = (t: Test) => Promise<void> | void
  export type Harness = {
    bootstrap(): Promise<void>
    close(): Promise<void>
  }
  export type TapeTestFn<T extends Harness> = {
    (name: string, cb?: (harness: T, test: Test) => void | Promise<void>): void
    (
      name: string,
      opts: object,
      cb: (harness: T, test: Test) => void | Promise<void>
    ): void
    only(
      name: string,
      cb?: (harness: T, test: Test) => void | Promise<void>
    ): void
    only(
      name: string,
      opts: object,
      cb: (harness: T, test: Test) => void | Promise<void>
    ): void
    skip(
      name: string,
      cb?: (harness: T, test: Test) => void | Promise<void>
    ): void
    skip(
      name: string,
      opts: object,
      cb: (harness: T, test: Test) => void | Promise<void>
    ): void
  }
  import * as exports from 'oro:test/harness'
}
```

</details>

<details>
<summary><code>oro:test/index</code></summary>

```ts
declare module 'oro:test/index' {
  /**
   * @returns {number} - The default timeout for tests in milliseconds.
   */
  export function getDefaultTestRunnerTimeout(): number
  /**
   * @param {string} name
   * @param {TestFn} [fn]
   * @returns {void}
   */
  export function only(name: string, fn?: TestFn): void
  /**
   * @param {string} _name
   * @param {TestFn} [_fn]
   * @returns {void}
   */
  export function skip(_name: string, _fn?: TestFn): void
  /**
   * @param {boolean} strict
   * @returns {void}
   */
  export function setStrict(strict: boolean): void
  /**
   * @typedef {{
   *    (name: string, fn?: TestFn): void
   *    only(name: string, fn?: TestFn): void
   *    skip(name: string, fn?: TestFn): void
   * }} testWithProperties
   * @ignore
   */
  /**
   * @type {testWithProperties}
   * @param {string} name
   * @param {TestFn} [fn]
   * @returns {void}
   */
  export function test(name: string, fn?: TestFn): void
  export namespace test {
    export { only }
    export { skip }
    export function linux(name: any, fn: any): void
    export function windows(name: any, fn: any): void
    export function win32(name: any, fn: any): void
    export function unix(name: any, fn: any): void
    export function macosx(name: any, fn: any): void
    export function macos(name: any, fn: any): void
    export function mac(name: any, fn: any): void
    export function darwin(name: any, fn: any): void
    export function iphone(name: any, fn: any): void
    export namespace iphone {
      function simulator(name: any, fn: any): void
    }
    export function ios(name: any, fn: any): void
    export namespace ios {
      function simulator(name: any, fn: any): void
    }
    export function android(name: any, fn: any): void
    export namespace android {
      function emulator(name: any, fn: any): void
    }
    export function desktop(name: any, fn: any): void
    export function mobile(name: any, fn: any): void
  }
  /**
   * @typedef {(t: Test) => (void | Promise<void>)} TestFn
   */
  /**
   * @class
   */
  export class Test {
    /**
     * @constructor
     * @param {string} name
     * @param {TestFn} fn
     * @param {TestRunner} runner
     */
    constructor(name: string, fn: TestFn, runner: TestRunner)
    /**
     * @type {string}
     * @ignore
     */
    name: string
    /**
     * @type {null|number}
     * @ignore
     */
    _planned: null | number
    /**
     * @type {null|number}
     * @ignore
     */
    _actual: null | number
    /**
     * @type {TestFn}
     * @ignore
     */
    fn: TestFn
    /**
     * @type {TestRunner}
     * @ignore
     */
    runner: TestRunner
    /**
     * @type{{ pass: number, fail: number }}
     * @ignore
     */
    _result: {
      pass: number
      fail: number
    }
    /**
     * @type {boolean}
     * @ignore
     */
    done: boolean
    /**
     * @type {boolean}
     * @ignore
     */
    strict: boolean
    /**
     * @param {string} msg
     * @returns {void}
     */
    comment(msg: string): void
    /**
     * Plan the number of assertions.
     *
     * @param {number} n
     * @returns {void}
     */
    plan(n: number): void
    /**
     * @template T
     * @param {T} actual
     * @param {T} expected
     * @param {string} [msg]
     * @returns {void}
     */
    deepEqual<T>(actual: T, expected: T, msg?: string): void
    /**
     * @template T
     * @param {T} actual
     * @param {T} expected
     * @param {string} [msg]
     * @returns {void}
     */
    notDeepEqual<T>(actual: T, expected: T, msg?: string): void
    /**
     * @template T
     * @param {T} actual
     * @param {T} expected
     * @param {string} [msg]
     * @returns {void}
     */
    equal<T>(actual: T, expected: T, msg?: string): void
    /**
     * @param {unknown} actual
     * @param {unknown} expected
     * @param {string} [msg]
     * @returns {void}
     */
    notEqual(actual: unknown, expected: unknown, msg?: string): void
    /**
     * @param {string} [msg]
     * @returns {void}
     */
    fail(msg?: string): void
    /**
     * @param {unknown} actual
     * @param {string} [msg]
     * @returns {void}
     */
    ok(actual: unknown, msg?: string): void
    /**
     * @param {string} [msg]
     * @returns {void}
     */
    pass(msg?: string): void
    /**
     * @param {Error | null | undefined} err
     * @param {string} [msg]
     * @returns {void}
     */
    ifError(err: Error | null | undefined, msg?: string): void
    /**
     * @param {Function} fn
     * @param {RegExp | any} [expected]
     * @param {string} [message]
     * @returns {void}
     */
    throws(fn: Function, expected?: RegExp | any, message?: string): void
    /**
     * Sleep for ms with an optional msg
     *
     * @param {number} ms
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * await t.sleep(100)
     * ```
     */
    sleep(ms: number, msg?: string): Promise<void>
    /**
     * Request animation frame with an optional msg. Falls back to a 0ms setTimeout when
     * tests are run headlessly.
     *
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * await t.requestAnimationFrame()
     * ```
     */
    requestAnimationFrame(msg?: string): Promise<void>
    /**
     * Dispatch the `click` method on an element specified by selector.
     *
     * @param {string|HTMLElement|Element} selector - A CSS selector string, or an instance of HTMLElement, or Element.
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * await t.click('.class button', 'Click a button')
     * ```
     */
    click(selector: string | HTMLElement | Element, msg?: string): Promise<void>
    /**
     * Dispatch the click window.MouseEvent on an element specified by selector.
     *
     * @param {string|HTMLElement|Element} selector - A CSS selector string, or an instance of HTMLElement, or Element.
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * await t.eventClick('.class button', 'Click a button with an event')
     * ```
     */
    eventClick(
      selector: string | HTMLElement | Element,
      msg?: string
    ): Promise<void>
    /**
     *  Dispatch an event on the target.
     *
     * @param {string | Event} event - The event name or Event instance to dispatch.
     * @param {string|HTMLElement|Element} target - A CSS selector string, or an instance of HTMLElement, or Element to dispatch the event on.
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * await t.dispatchEvent('my-event', '#my-div', 'Fire the my-event event')
     * ```
     */
    dispatchEvent(
      event: string | Event,
      target: string | HTMLElement | Element,
      msg?: string
    ): Promise<void>
    /**
     *  Call the focus method on element specified by selector.
     *
     * @param {string|HTMLElement|Element} selector - A CSS selector string, or an instance of HTMLElement, or Element.
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * await t.focus('#my-div')
     * ```
     */
    focus(selector: string | HTMLElement | Element, msg?: string): Promise<void>
    /**
     *  Call the blur method on element specified by selector.
     *
     * @param {string|HTMLElement|Element} selector - A CSS selector string, or an instance of HTMLElement, or Element.
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * await t.blur('#my-div')
     * ```
     */
    blur(selector: string | HTMLElement | Element, msg?: string): Promise<void>
    /**
     * Consecutively set the str value of the element specified by selector to simulate typing.
     *
     * @param {string|HTMLElement|Element} selector - A CSS selector string, or an instance of HTMLElement, or Element.
     * @param {string} str - The string to type into the :focus element.
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * await t.typeValue('#my-div', 'Hello World', 'Type "Hello World" into #my-div')
     * ```
     */
    type(
      selector: string | HTMLElement | Element,
      str: string,
      msg?: string
    ): Promise<void>
    /**
     * appendChild an element el to a parent selector element.
     *
     * @param {string|HTMLElement|Element} parentSelector - A CSS selector string, or an instance of HTMLElement, or Element to appendChild on.
     * @param {HTMLElement|Element} el - A element to append to the parent element.
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * const myElement = createElement('div')
     * await t.appendChild('#parent-selector', myElement, 'Append myElement into #parent-selector')
     * ```
     */
    appendChild(
      parentSelector: string | HTMLElement | Element,
      el: HTMLElement | Element,
      msg?: string
    ): Promise<void>
    /**
     * Remove an element from the DOM.
     *
     * @param {string|HTMLElement|Element} selector - A CSS selector string, or an instance of HTMLElement, or Element to remove from the DOM.
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * await t.removeElement('#dom-selector', 'Remove #dom-selector')
     * ```
     */
    removeElement(
      selector: string | HTMLElement | Element,
      msg?: string
    ): Promise<void>
    /**
     * Test if an element is visible
     *
     * @param {string|HTMLElement|Element} selector - A CSS selector string, or an instance of HTMLElement, or Element to test visibility on.
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * await t.elementVisible('#dom-selector','Element is visible')
     * ```
     */
    elementVisible(
      selector: string | HTMLElement | Element,
      msg?: string
    ): Promise<void>
    /**
     * Test if an element is invisible
     *
     * @param {string|HTMLElement|Element} selector - A CSS selector string, or an instance of HTMLElement, or Element to test visibility on.
     * @param {string} [msg]
     * @returns {Promise<void>}
     *
     * @example
     * ```js
     * await t.elementInvisible('#dom-selector','Element is invisible')
     * ```
     */
    elementInvisible(
      selector: string | HTMLElement | Element,
      msg?: string
    ): Promise<void>
    /**
     * Test if an element is invisible
     *
     * @param {string|(() => HTMLElement|Element|null|undefined)} querySelectorOrFn - A query string or a function that returns an element.
     * @param {Object} [opts]
     * @param {boolean} [opts.visible] - The element needs to be visible.
     * @param {number} [opts.timeout] - The maximum amount of time to wait.
     * @param {string} [msg]
     * @returns {Promise<HTMLElement|Element|void>}
     *
     * @example
     * ```js
     * await t.waitFor('#dom-selector', { visible: true },'#dom-selector is on the page and visible')
     * ```
     */
    waitFor(
      querySelectorOrFn:
        | string
        | (() => HTMLElement | Element | null | undefined),
      opts?: {
        visible?: boolean
        timeout?: number
      },
      msg?: string
    ): Promise<HTMLElement | Element | void>
    /**
     * @typedef {Object} WaitForTextOpts
     * @property {string} [text] - The text to wait for
     * @property {number} [timeout]
     * @property {Boolean} [multipleTags]
     * @property {RegExp} [regex] The regex to wait for
     */
    /**
     * Test if an element is invisible
     *
     * @param {string|HTMLElement|Element} selector - A CSS selector string, or an instance of HTMLElement, or Element.
     * @param {WaitForTextOpts | string | RegExp} [opts]
     * @param {string} [msg]
     * @returns {Promise<HTMLElement|Element|void>}
     *
     * @example
     * ```js
     * await t.waitForText('#dom-selector', 'Text to wait for')
     * ```
     *
     * @example
     * ```js
     * await t.waitForText('#dom-selector', /hello/i)
     * ```
     *
     * @example
     * ```js
     * await t.waitForText('#dom-selector', {
     *   text: 'Text to wait for',
     *   multipleTags: true
     * })
     * ```
     */
    waitForText(
      selector: string | HTMLElement | Element,
      opts?:
        | {
            /**
             * - The text to wait for
             */
            text?: string
            timeout?: number
            multipleTags?: boolean
            /**
             * The regex to wait for
             */
            regex?: RegExp
          }
        | string
        | RegExp,
      msg?: string
    ): Promise<HTMLElement | Element | void>
    /**
     * Run a querySelector as an assert and also get the results
     *
     * @param {string} selector - A CSS selector string, or an instance of HTMLElement, or Element to select.
     * @param {string} [msg]
     * @returns {HTMLElement | Element}
     *
     * @example
     * ```js
     * const element = await t.querySelector('#dom-selector')
     * ```
     */
    querySelector(selector: string, msg?: string): HTMLElement | Element
    /**
         * Run a querySelectorAll as an assert and also get the results
         *
         * @param {string} selector - A CSS selector string, or an instance of HTMLElement, or Element to select.
         * @param {string} [msg]
         @returns {Array<HTMLElement | Element>}
         *
         * @example
         * ```js
         * const elements = await t.querySelectorAll('#dom-selector', '')
         * ```
         */
    querySelectorAll(
      selector: string,
      msg?: string
    ): Array<HTMLElement | Element>
    /**
     * Retrieves the computed styles for a given element.
     *
     * @param {string|Element} selector - The CSS selector or the Element object for which to get the computed styles.
     * @param {string} [msg] - An optional message to display when the operation is successful. Default message will be generated based on the type of selector.
     * @returns {CSSStyleDeclaration} - The computed styles of the element.
     * @throws {Error} - Throws an error if the element has no `ownerDocument` or if `ownerDocument.defaultView` is not available.
     *
     * @example
     * ```js
     * // Using CSS selector
     * const style = getComputedStyle('.my-element', 'Custom success message');
     * ```
     *
     * @example
     * ```js
     * // Using Element object
     * const el = document.querySelector('.my-element');
     * const style = getComputedStyle(el);
     * ```
     */
    getComputedStyle(
      selector: string | Element,
      msg?: string
    ): CSSStyleDeclaration
    /**
     * @param {boolean} pass
     * @param {unknown} actual
     * @param {unknown} expected
     * @param {string} description
     * @param {string} operator
     * @returns {void}
     * @ignore
     */
    _assert(
      pass: boolean,
      actual: unknown,
      expected: unknown,
      description: string,
      operator: string
    ): void
    /**
     * @returns {Promise<{
     *   pass: number,
     *   fail: number
     * }>}
     */
    run(): Promise<{
      pass: number
      fail: number
    }>
  }
  /**
   * @class
   */
  export class TestRunner {
    /**
     * @constructor
     * @param {(lines: string) => void} [report]
     */
    constructor(report?: (lines: string) => void)
    /**
     * @type {(lines: string) => void}
     * @ignore
     */
    report: (lines: string) => void
    /**
     * @type {Test[]}
     * @ignore
     */
    tests: Test[]
    /**
     * @type {Test[]}
     * @ignore
     */
    onlyTests: Test[]
    /**
     * @type {boolean}
     * @ignore
     */
    scheduled: boolean
    /**
     * @type {number}
     * @ignore
     */
    _id: number
    /**
     * @type {boolean}
     * @ignore
     */
    completed: boolean
    /**
     * @type {boolean}
     * @ignore
     */
    rethrowExceptions: boolean
    /**
     * @type {boolean}
     * @ignore
     */
    strict: boolean
    /**
     * @type {ReturnType<typeof createTestFilter> | null}
     * @ignore
     */
    filters: ReturnType<typeof createTestFilter> | null
    /**
     * @type {boolean}
     * @ignore
     */
    _filtersAnnounced: boolean
    /**
     * @type {number}
     * @ignore
     */
    _filteredCount: number
    /**
     * @type {function | void}
     * @ignore
     */
    _onFinishCallback: Function | void
    /**
     * @returns {string}
     */
    nextId(): string
    /**
     * @type {number}
     */
    get length(): number
    /**
     * @param {string} name
     * @param {TestFn} fn
     * @param {boolean} only
     * @returns {void}
     */
    add(name: string, fn: TestFn, only: boolean): void
    /**
     * @returns {Promise<void>}
     */
    run(): Promise<void>
    /**
     * @param {(result: { total: number, success: number, fail: number }) => void} callback
     * @returns {void}
     */
    onFinish(
      callback: (result: {
        total: number
        success: number
        fail: number
      }) => void
    ): void
  }
  /**
   * @ignore
   */
  export const GLOBAL_TEST_RUNNER: TestRunner
  export default test
  export type testWithProperties = {
    (name: string, fn?: TestFn): void
    only(name: string, fn?: TestFn): void
    skip(name: string, fn?: TestFn): void
  }
  export type TestProcessEnv = Record<string, string | undefined>
  export type TestFn = (t: Test) => void | Promise<void>
  /**
   * @param {TestProcessEnv} env
   * @returns {null | { description: string, shouldRun(name: string, meta: { isOnly: boolean }): boolean }}
   * @ignore
   */
  function createTestFilter(env: TestProcessEnv): null | {
    description: string
    shouldRun(
      name: string,
      meta: {
        isOnly: boolean
      }
    ): boolean
  }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->

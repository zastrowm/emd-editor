
module Hexpect {

  function f(format: string, ... rest: any[]) {
    return f2(format, rest);
  };

  function f2(format: string, rest: any[]) {
    var args = rest;
    return format.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
          ? args[number]
          : match
          ;
    });
  };

  function trimRight(str: string) {
    return  str.replace(/\s+$/g, '')
  }

  function sortIgnoreCase<T>(array: T[], selector: (v:T) => string) {
    function stringCompare(a, b) {
      if (a.toLowerCase() < b.toLowerCase())
        return -1;
      if (a.toLowerCase() > b.toLowerCase())
        return 1;

      return 0;
    }

    array.sort((a, b) => stringCompare(selector(a), selector(b)));
  }

  /**
   * An item which can be validated against an html element to check for correctness
   */
  class Element {

    /**
     * The name of the element
     */
    public name: string;

    /**
     * The children that are required of this element
     */
    public children: Element[] = [];

    /**
     * The attributes that are required on this element
     */
    public attributes: Attribute[] = [];

    /**
     * If the element is required (true) or optional (false0
     */
    public isRequired: boolean;

    /**
     * If the element should be allowed more than once
     */
    public allowDuplicates: boolean;

    /**
     * If any child elements should be allowed after the required child elements
     */
    public allowExtraElements: boolean;

    /**
     * The error message to display if the element is not present.  Can be null (to use default),
     */
    public errorText: string;

    /**
     * The owner of this element
     */
    public parent: Element;

    /**
     * Create a new element from a token
     * @param token the token containing all element information
     */
    constructor(token: Token) {
      this.name = token.name;
      this.isRequired = true;

      if (token.hasValue)
        token.throw("Elements cannot have values associated with them");

      switch (token.postFix) {
        case "*":
          this.isRequired = false;
        case "+":
          this.allowDuplicates = true;
          break;
        case "":
          break;
        default:
          throw token.throw("Invalid character following name of element");
      }
    }

    /**
     * Convert the element to a string representation
     * @returns {string}
     */
    public toString(): string {

      var atts = this.attributes.map(a => {
        return a.value != null ? a.name + "=" + a.value : a.name
      });

      var path = this.name;

      var parent = this.parent;
      while (parent != null) {
        path = parent.name + ">" + path;
        parent = parent.parent;
      }

      return "{ path=>" + path + ", attributes=>" + atts.join(", ") + "}";
    }

    /**
     * Append a token representing an element or an attribute
     * @returns {*} An element if the token representing an element, null otherwise
     */
    public append(token: Token) {
      if (token.isAttribute()) {
        var att = new Attribute(token);
        this.appendAttribute(att, token);
      } else {
        var ele = new Element(token);
        this.appendElement(ele, token);
        return ele;
      }

      return null;
    }

    /**
     * Add a required attribute to the element
     */
    private appendAttribute(att: Attribute, token: Token) {

      if (this.allowExtraElements)
        token.throw("All attributes must be before elements");
      if (this.children.length != 0)
        token.throw("Attributes cannot be after child element was declared");

      for (var i = 0; i < this.attributes.length; i++) {
        var otherAttr = <Attribute>this.attributes[i];
        if (otherAttr.name.toLowerCase() == att.name.toLowerCase())
          token.throw("Duplicate attribute name");
      }

      this.attributes.push(att);
    }

    /**
     * Add an element as a child of this element
     */
    private appendElement(element: Element, token: Token) {

      if (element.name == "**") {
        if (this.allowExtraElements)
          token.throw("Extra extra elements element");
        else
          this.allowExtraElements = true;
      } else {
        if (this.children == null) {
          this.children = [];
        }

        this.children.push(element);
        element.parent = this;
      }
    }

    /**
     * Validate an HTML element against a root element
     * @param htmlElement the root html element to validate
     */
    validate(htmlElement: HTMLElement) {

      // first validate name
      if (htmlElement.tagName.toLowerCase() != this.name.toLowerCase()) {
        this.throw("Expected element " + this + " but got " + htmlElement.tagName, htmlElement);
      }

      this.validateAttributes(htmlElement);

      if (!this.allowExtraElements) {
        this.validateElements(htmlElement);
      }
    }

    private validateAttributes(htmlElement: HTMLElement) {
      var attributes = Array.prototype.slice.call(htmlElement.attributes, 0);

      sortIgnoreCase<Node>(attributes, a => a.nodeName);
      sortIgnoreCase<Attribute>(<Array>this.attributes, a => a.name);

      var i = 0, j = 0;

      for (; i < this.attributes.length && j < attributes.length; i++, j++) {
        var expectedAttribute = <Attribute>this.attributes[i];
        var actualAttribute = <Node>attributes[j];

        if (expectedAttribute.name.toLowerCase() != actualAttribute.nodeName.toLowerCase())
          this.throw("Missing attribute " + expectedAttribute.name, htmlElement);

        if (expectedAttribute.value != null
            && expectedAttribute.value != actualAttribute.nodeValue) {

          if (expectedAttribute.errorText != null)
            this.throw(expectedAttribute.errorText, htmlElement);

          this.throwOn(htmlElement, "Expected attribute {0} to have value of '{1}' but was '{2}'",
              expectedAttribute.name, expectedAttribute.value, actualAttribute.nodeValue)
        }
      }

      // make sure we had all of the elements
      if (i < this.attributes.length)
        this.throw("Missing attribute " + this.attributes[i].name, htmlElement);

      // make sure we didn't have any extras
      if (j < attributes.length)
        this.throw("Unexpected attribute " + attributes[j].nodeName, htmlElement);
    }

    /**
     * Validate the child elements of this element conform to the requirements
     * @param htmlElement the element element to check
     */
    private validateElements(htmlElement: HTMLElement) {

      var htmlElementChildIndex = 0;
      var lastWasSatisfied = false;

      for (var elementChildIndex = 0; elementChildIndex < this.children.length;) {
        var childElement = <Element>this.children[elementChildIndex];

        if (htmlElementChildIndex >= htmlElement.children.length) {
          if (childElement.isRequired)
            this.throw("Missing child element " + childElement, htmlElement);

          // the next childElement might be required, go directly to the next one
          elementChildIndex++;
          continue;
        }

        var htmlChild = <HTMLElement>htmlElement.children[htmlElementChildIndex];

        if (!childElement.isValidFor(htmlChild)) {

          // no problem, we'll just ignore it!
          if (!childElement.isRequired || lastWasSatisfied) {
            elementChildIndex++;
            lastWasSatisfied = false;
            continue;
          }

          // validate below will catch other cases
        }

        // validate it, NOW!
        childElement.validate(htmlChild);

        if (!childElement.allowDuplicates) {
          elementChildIndex++;
          lastWasSatisfied = false;
        } else {
          lastWasSatisfied = true;
        }

        // the element was used up
        htmlElementChildIndex++;
      }

      // make sure we don't have extras
      if (htmlElementChildIndex < htmlElement.children.length) {
        var extra = <HTMLElement>htmlElement.children[htmlElementChildIndex];
        this.throw("Extra child element " +extra.nodeName + " " + extra.id, extra);
      }

    }

    /**
     * Check if the Element could be considered a match for the htmlElement
     * @param htmlElement the element to check for conformance
     * @returns {boolean} true if the element is a match, false if the element
     * can be ignored
     */
    private isValidFor(htmlElement: HTMLElement): boolean {

      if (htmlElement.nodeName.toLowerCase() != this.name.toLowerCase())
        return false;

      var attributes = Array.prototype.slice.call(htmlElement.attributes, 0);

      if (attributes.length != this.attributes.length)
        return false;

      function stringCompare(a, b) {
        if (a.toLowerCase() < b.toLowerCase())
          return -1;
        if (a.toLowerCase() > b.toLowerCase())
          return 1;
        return 0;
      }

      // sort both so that they're in the same order
      sortIgnoreCase<Node>(attributes, a => a.nodeName);
      sortIgnoreCase<Attribute>(<Array>this.attributes, a => a.name);

      for (var i = 0; i < attributes.length; i++) {
        if (this.attributes[i].name.toLowerCase() != attributes[i].nodeName.toLowerCase())
          return false;
      }

      return true;
    }

    private throw(errorText: string, element: HTMLElement) {
      throw {
        errorText: errorText,
        element: element,
        toString: () => {
          return "Element error. " + errorText + ". " + this.toString();
        }
      }
    }

    private throwOn(element: HTMLElement, errorFormatString: string, ...rest: any[]) {
      this.throw(f2(errorFormatString, rest), element);
    }
  }

  /**
   * A single attribute that is required
   */
  class Attribute {

    /**
     * The name of the attribute required
     */
    public name: string;

    /**
     * The expected value of the attribute (or null if no expected value)
     */
    public value: string;

    /**
     * The error message to display if either the attribute or value is not as expected.  Can be null (to use default),7
     */
    public errorText: string;

    /**
     * Create a new attribute from a token
     */
    constructor(token: Token) {
      this.name = token.name;
      this.errorText = token.errorText;

      if (token.hasValue) {
        this.value = token.valueText;
      }
    }
  }

  /**
   * Parse a string into an element tree
   * @param content the string content
   * @returns {Element} the root element of the tree
   */
  function parse(content: string): Element {
    var tokens = tokenize(content);
    validateTokens(tokens);
    return createTree(tokens);
  }

  /**
   * Convert a text document into an array of tokens
   * @param content the text content to convert
   * @returns {Token[]} the array of tokens representing the lines
   */
  function tokenize(content: string): Token[] {

    // split it into parsable lines
    var lines = content.split(/\r?\n/);

    var tokens = lines
        .map(l => trimRight(l))          // remove trailing whitespace
        .filter(l => l.length != 0)      // filter out empty lines
        .map(l => { return {
          line: l.trim(),
          match: parseLine(l)
        }});

    for (var i = 0; i < tokens.length; i++) {
      var token = <{line: string; match: Token}>tokens[i];

      if (token.match == null)
        throw new Error("Invalid line: " + token.line);

      if (token.match.hasValue && token.match.prefix != "@")
        throw new Error("Invalid line (only attributes can have values): " + token.line);
    }

    return <Token[]>tokens.map(t => t.match);
  }

  /**
   * Parse a single line into a token
   * @param line the line to convert (must be in correct format)
   * @returns the parsed line as a Token
   */
  function parseLine(line: string): Token {

    var lineRegex = /^(\t*)([@]?)([A-Za-z0-9_\-]+|\*\*)(\*?)(?:(=)(?:"(?:([^"]*?)")))?(?:,(.*))?$/;

    var match = lineRegex.exec(line);

    if (match == null)
      return null;

    var lineMatch = new Token();

    lineMatch.text = line;
    lineMatch.indent = match[1].length;
    lineMatch.prefix = match[2];
    lineMatch.name = match[3];
    lineMatch.postFix = match[4];
    lineMatch.hasValue = match[5] == '=';
    lineMatch.valueText = lineMatch.hasValue ? match[6] : null;
    lineMatch.errorText = match[7];

    return lineMatch;
  }

  /**
   * Create the actual tree of elements
   * @param tokens the tokens that were parsed
   * @returns {Element} the root element created from the tokens
   */
  function createTree(tokens: Token[]) : Element {

    var root = new Element(tokens[0]);
    if (root.name == "*")
      tokens[0].throw("Invalid root name");

    var stack: Element[] = [];

    stack.push(root);

    for (var i = 1; i < tokens.length; i++) {
      var token = <Token>tokens[i];

      // go down until we're one above the level of the token
      while (token.indent < stack.length) {
        stack.pop();
      }

      // last element on stack is the parent
      var parent = stack[token.indent - 1];

      // child element/attribute
      var element = parent.append(token);

      // if an element was added
      if (element != null) {
        stack.push(element);
      }
    }

    return root;
  }

  /**
   * Validates that:
   *  - only one root element (the first element with zero indent)
   *  - tokens always increase only by one indent level at a time
   *  - we don't have children of attributes
   *  - the first element is non-indented and that it is not an attribute
   *  - attributes always follow other attributes (and that the previous attribute at the same level)
   */
  function validateTokens(tokens: Token[]) {

    var lastToken = tokens[0];

    if (lastToken.indent != 0)
      throw new Error("First element must have indent of 0");
    if (lastToken.isAttribute())
      throw new Error("First element cannot be attribute");

    var lastIndent = 0;

    for (var i = 1; i < tokens.length; i++) {
      var token = tokens[i];

      if (token.indent == 0)
        throw new Error('Only first element can be root element: ' + token.text);

      // make sure we never increase by more than 1!
      if (token.indent > lastIndent + 1)
        throw new Error("Line has invalid indent: " + token.text)

      var isChild = token.indent == lastToken.indent + 1;
      var isSibling = token.indent == lastToken.indent;

      // make sure we're not a child of an attribute
      if (isChild && lastToken.isAttribute()) {
          throw new Error("Cannot have children of attributes: " + token.text);
      }

      if (token.isAttribute()) {

        if (!isChild && !isSibling)
          throw new Error("Attributes must be the first children of an element: " + token.text);

        if (isSibling && !lastToken.isAttribute())
          throw new Error("Attributes can only follow other attributes: " + token.text);
      }

      lastIndent = token.indent;
      lastToken = token;
    }
  }

  class Token {
    text: string;
    indent: number;
    prefix: string;
    name: string;
    postFix: string;
    hasValue: boolean;
    valueText: string;
    errorText: string;

    isAttribute(): boolean {
      return this.prefix == '@';
    }

    /**
     * Throw an Error with the error text and the line associated with the token
     * @param error the error message
     */
    public throw(error: string) {
      throw new Error(error + ": `" + this.text + "`");
    }
  }

  /**
   * Validate an HTML element against a root element
   * @param rootElement the root element to validate against
   * @param htmlElement the root html element to validate
   */
  function validate(rootElement: Element, htmlElement: HTMLElement) {
    rootElement.validate(htmlElement);
  }

  export function createValidator(content: string) {
    return <any>parse(content);
  }

}


interface HTMLElement {
  querySelectorAll: (selector: string) => NodeList;
}

/**
 * Embedded Markdown Document interface
 */
module EMD
{

  /**
   * Loads a document from an element
   */
  class Serializer {

    private doc: EMD.Document;
    private static version: string = '0.1';

    public load(element: HTMLElement) : EMD.Document{
      this.doc = new EMD.Document();

      var get = (selector) => (<HTMLElement>element.querySelector(selector));

      this.doc.version = element.getAttribute("data-emd-version");

      this.loadMetadata(get("#-emd-meta"));
      this.loadMarkdown(<HTMLElement>get("#-emd-content").children[0]);
      this.loadRendered(get("#-emd-rendered-body"));
      this.loadImages(get("#-emd-images"));

      return this.doc;
    }

    public save(doc: EMD.Document) : HTMLElement{
      this.doc = doc;

      var html = this.createCoreStructure();
      html.setAttribute('data-emd-version', Serializer.version);

      var get = (selector) => (<HTMLElement>html.querySelector(selector));

      this.saveMetadata(get("#-emd-meta"));
      this.saveMarkdown(<HTMLElement>get("#-emd-content").children[0]);
      this.saveRendered(get("#-emd-rendered-body"));
      this.saveImages(get("#-emd-images"));

      return html;
    }

    /**
     * Create the core part of the tree
     * @returns {HTMLElement} the html element containing all of the elements for the document
     */
    private createCoreStructure() : HTMLElement {
      var html = document.createElement('html');

      var head = document.createElement('head');
      head.innerHTML = '<head>'
          + '<meta charset="utf-8">'
          + '<title></title>'
          + '<script type="application/json" id="-emd-meta">{}</script>';

      var body = document.createElement("body");
      body.innerHTML = ''
          + '<div id="-emd-rendered">'
          + ' <div id="-emd-rendered-body"></div>'
          + '</div>'
          + '<div id="-emd-document" style="display: none">'
          + '  <div id="-emd-content">'
          + '    <script type="text/x-emd-markdown" data-emd-name="body"></script>'
          + '  </div>'
          + '  <div id="-emd-images"></div>'
          + '  <div id="-emd-extra"></div>'
          + '</div>';

      html.appendChild(head);
      html.appendChild(body);

      return html;
    }

    /**
     * Load the metadata for the document
     * @param doc the document into which the metaadata should be placed
     * @param metaDataElement the element that contains the key-value pairs
     */
    private loadMetadata(metaDataElement: HTMLElement) : void {
      var element = document.createElement("div");

      // transfer it over so that the xml is "parsed"
      element.innerHTML = metaDataElement.innerHTML;

      var dictionary = {};
      var children = element.children;

      // put all the meta key-value pairs into a dictionary
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        dictionary[child.getAttribute("name").toLowerCase()] = child.getAttribute("value");
      }

      this.doc.properties = dictionary;
    }

    private saveMetadata(metaDataElement: HTMLElement) : void {

      var properties = this.doc.properties;
      if (properties == null) {
        properties = {};
      }

      for (var key in properties) {
        if (!properties.hasOwnProperty(key))
          continue;

        var value = properties[key];
        var meta = document.createElement("meta");
        // set the key and value
        meta.setAttribute('name', key);
        meta.setAttribute('value', value);

        metaDataElement.appendChild(meta);
      }
    }

    /**
     * Load the rendered html
     * @param doc the document into which to load the rendered html
     * @param contentElement the element that contains the element
     */
    private loadRendered(contentElement: HTMLElement): void {
      this.doc.rendered = {
        body: contentElement.innerHTML
      };
    }

    private saveRendered(contentElement: HTMLElement): void {
      contentElement.innerHTML = this.doc.rendered.body;
    }

    /**
     * Read the markdown from the element
     * @param doc the document into which to load the markdown
     * @param contentElement the element that contains the markdown
     */
    private loadMarkdown(contentElement: HTMLElement) : void {
      var mdBody = Base64.decode(contentElement.textContent.trim());
      this.doc.markdown = {
        body: mdBody
      }
    }

    /**
     * Save the markdown into the element
     * @param contentElement the element into which to save the markdown
     */
    private saveMarkdown(contentElement: HTMLElement) : void {
      contentElement.textContent = Base64.encode(this.doc.markdown.body);
    }


    /**
     * Load all of the images
     * @param imagesElement the element that contains the image elements
     */
    private loadImages(imagesElement: HTMLElement) : void {
      this.doc.images = [];

      var elements = imagesElement.querySelectorAll("img");

      for (var i = 0; i < elements.length; i++) {
        var image = <HTMLElement>elements[i];
        this.doc.images.push({
          name: image.getAttribute("data-emd-name"),
          data: image.getAttribute("src")
        });
      }
    }

    /**
     * Save all of the images
     * @param imagesElement the element into which to save the images
     */
    private saveImages(imagesElement: HTMLElement) : void {
      var images = this.doc.images;

      if (images == null) {
        images = [];
      }

      for (var i = 0; i < images.length; i++) {
        var image = images[i];

        var imageElement = document.createElement('img');
        imageElement.setAttribute('src', image.data);
        imageElement.setAttribute('data-emd-name', image.name);
        imageElement.setAttribute('alt', '');

        imagesElement.appendChild(imageElement);
      }
    }
  }

  /**
   * Load a EMD document from an iframe
   * @param element the iframe that contains the doc-markdown
   * @returns {EMD.Document}
   */
  export function load(element: HTMLElement) : EMD.Document {
    var serializer = new Serializer();
    return serializer.load(element);
  }

  /**
   * Saves a EMD document to an element
   * @param document the document to save
   * @returns {HTMLElement} the element to which the EMD.Document elements was saved
   */
  export function save(document: EMD.Document) : HTMLElement {
    var serializer = new Serializer();
    return serializer.save(document);
  }

  /**
   * Image data for a single image
   */
  export class Image {

    /**
     * Create a new image
     * @param name the name of the image
     * @param imageData the data associated with the image
     */
    constructor(public name: string, public data: string) {

    }
  }





  /**
   * A doc-markdown document class containing all of the elements for the document
   */
  export class Document {

    /**
     * The version of the document
     */
    version: string;

    /**
     * The original markdown content
     */
    markdown : {
      body : string;
    };

    /**
     * The styles stored in the document
     */
    styles : {
      theme: string;
      isDefault: boolean;
      userStyle: string;
    };

    /**
     * The scripts used to enhance the rendered document
     */
    scripts : {

      /**
       * The script included by the editor
       */
          default: string;

      /**
       * All of the named scripts
       */
          named: {
        /**
         * The name of the script to include
         */
            name: string;
        /**
         * The content of the script to include
         */
            content: string;
      }[];

      /**
       * The script that the user has written
       */
          userScript: string;

    };

    /**
     * The rendered html for the document
     */
    rendered: {
      body: string;
    };


    /**
     * All of the images stored in the document
     */
    images : Image[];

    /**
     * Remove an image from the list
     * @param image the image to remove
     */
    removeImage(image: Image) {
      if (this.images == null)
        return;

      for (var i = 0; i < this.images.length; i++) {
        if (this.images[i] == image) {
          this.images.splice(i);
          return;
        }
      }
    }

    /**
     * Add an image to the list
     * @param image the image to add to the list
     */
    addImage(image: Image) {
      if (this.images == null)
        this.images = [];

      this.images.push(image);
    }

    /**
     * Check if the document contains an image with the specified name
     * @param name the name to check if it already exists on an image
     */
   containsImageWithName(name: string): boolean {
      if (this.images == null)
        return false

      for (var i = 0; i < this.images.length; i++) {
        var image = this.images[i];
        if (image.name == name)
          return true;
      }

      return false;
    }

    /**
     * Get the image associated withe the name
     * @param name the name of the image to retrieve
     */
   getImage(name: string): EMD.Image {
      for (var i = 0; i < this.images.length; i++) {
        var image = this.images[i];
        if (image.name == name) {
          return image;
        }
      }

      return null;
    }

    /**
     * Scripts used as a post-processor of the markup
     */
    processScripts : {
      /**
       * The name of the script
       */
          name: string;

      /**
       * The content of the script
       */
          content: string;
    }[];

    /**
     * All of the properties stored in the document, including meta-data
     */
    properties : any;
  }
}

/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 **/
var Base64 = {

// private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
  encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {

      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
          this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

    }

    return output;
  },

// public method for decoding
  decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }

    }

    output = Base64._utf8_decode(output);

    return output;

  },

// private method for UTF-8 encoding
  _utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }

    return utftext;
  },

// private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
    var string = "";
    var i = 0;
    var c = 0;
    var c1 = 0;
    var c2 = 0;
    var c3 = 0;

    while ( i < utftext.length ) {

      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }

    }

    return string;
  }

}
///<reference path="NamedList.ts" />

module EmbeddedMarkdown {

  /**
   * Allows interacting with a document format specified by the Embedded-Markdown document standard
   */
  export class EmdDocument {

    /**
     * All of the images stored in the document.  Case-insensitive
     */
    public images: NamedList<Image>;

    /**
     * ALl of the css components in the document. Case-insensitive
     */
    public styleComponents: NamedList<StyleComponent>;

    /**
     * ALl of the script components in the document. Case-insensitive
     */
    public scriptComponents: NamedList<ScriptComponent>;

    /**
     * Contains all of the named parts
     */
    public parts: NamedList<string>;

    /**
     * The version of the loaded document
     */
    public version: Version;

    /**
     * The rendered html for the document
     */
    public renderedHtml: string;

    /**
     * Metadata for the document
     */
    public meta: any;

    /**
     * Create a new empty document
     */
    constructor() {
      this.images = new NamedList<Image>(false);
      this.styleComponents = new NamedList<StyleComponent>(false);
      this.scriptComponents = new NamedList<ScriptComponent>(false);
      this.parts = new NamedList<string>(false);
      this.meta = {};
      this.version = new Version(0, 1);
    }

  }

  export class Version {

    private _major: number;

    private _minor: number;

    /**
     * Constructor
     * @param major the major part of the version
     * @param minor the minor part of the version
     */
    constructor(major: number, minor: number) {
      this._major = major | 0;
      this._minor = minor | 0;
    }

    /**
     * The major version
     */
    public get major(): number {
      return this._major;
    }

    /**
     * The minor version
     */
    public get minor(): number {
      return this._major;
    }

    /**
     * Convert the version to a string matching the format of {major}.{minor}
     * @returns {string} the version as a string
     */
    public toString(): string {
      return this._major + "." + this._minor;
    }

    /**
     * Compare to another version
     * @param rhs the other version to compare against
     * @returns {number}
     *    < 0 => this < rhs
     *    0   => this == rhs
     *    > 0 => this > rhs
     */
    public compareTo(rhs: Version): number {
      if (this._major == rhs._major) {
        return this._minor - rhs._major;
      } else {
        return this._major - rhs._major;
      }
    }

    /**
     * Check if this version is equal to another version
     * @param rhs the version to compare against
     * @returns {boolean} true if this.compareTo(rhs) == 0
     */
    public equals(rhs: Version): boolean {
      return this.compareTo(rhs) == 0;
    }

    /**
     * Convert a string into a typed Version object
     * @param version a string in the {0}.{1} format
     */
    public static fromString(version: string): Version {
      var regex = /^([0-9]+)\.([0-9])+$/;

      if (!version.match(regex))
        throw new Error("Version string must be in a format of {major}.{minor} (for example, '1.3')");

      var info = regex.exec(version);
      return new Version(parseInt(info[1]), parseInt(info[2]));
    }
  }

  /**
   * An item that contains both a name and data for the item
   */
  export class NamedItemWithData {
    _name: string;
    _data: string;

    /**
     * Create a new image
     * @param name the name of the item
     * @param data the data associated with the item
     */
    constructor(name: string, data: string) {
      this._name = name;
      this._data = data;
    }

    /**
     * The name of the item
     */
    public get name(): string {
      return this._name;
    }

    /**
     * The data associated with the item
     */
    public get data(): string {
      return this._data;
    }
  }

  /**
   * A group of css styles with a name.  The data associated with the item is the css style
   */
  export class StyleComponent extends NamedItemWithData {

    /**
     * Create a new image
     * @param name the name of the component
     * @param data the css style associated with the component
     */
    constructor(name: string, data: string) {
      super(name, data);
    }
  }

  /**
   * A script which operates in the context of the rendered document.The data associated with
   * the item is the script in question
   */
  export class ScriptComponent extends NamedItemWithData {

    /**
     * Create a new image
     * @param name the name of the script type
     * @param script the script code
     */
    constructor(name: string, script: string) {
      super(name, script);
    }
  }

  /**
   * An image with a given name. The data associated with the item is the base64 encoded src of the
   * image.
   */
  export class Image extends NamedItemWithData {

    /**
     * Create a new image
     * @param name the name of the image
     * @param data the src of the image, base64 encoded
     */
    constructor(name: string, data: string) {
      super(name, data);
    }
  }

}

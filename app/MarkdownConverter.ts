
module EMD.Editor {

  // imported from lib/scripts/MarkdownDeep.min.js
  declare var MarkdownDeep: any;

  /**
   * Converts from markdown into html
   */
  export class MarkdownConverter {

    /**
     * The MarkdownDeep converter object
     */
    private markdownDeep: any;

    /**
     * Default constructor
     */
    constructor() {
      this.markdownDeep = new MarkdownDeep.Markdown();
      this.markdownDeep.ExtraMode = true;
      this.markdownDeep.SafeMode = false;
    }

    /**
     * Convert markdown to html
     * @param string the markdown to convert
     * @returns {*}
     */
    public convert(markdown: string): string {
      return this.markdownDeep.Transform(markdown);
    }

  }

}
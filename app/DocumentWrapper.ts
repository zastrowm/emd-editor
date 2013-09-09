///<reference path="../emd/EmbeddedMarkdown.ts" />

module EmbeddedMarkdown.Editor {

  /**
   * Wraps an Embedded Markdown document and provides convenience methods for interacting
   * with it
   */
  export class DocumentWrapper {

    /**
     * @param document the document to wrap
     */
    constructor(public document: EmbeddedMarkdown.EmdDocument) {

    }

    /**
     * All of the images in the document
     * @returns {EmbeddedMarkdown.Image[]}
     */
    public get images(): EmbeddedMarkdown.Image[] {
      return <EmbeddedMarkdown.Image[]>this.document.images.items;
    }

    /**
     * Get the src string for an image so that it may be displayed to the user
     * @param image the image to display
     * @returns the src url so that a browser may display the image
     */
    public getSourceForImage(imageName: string): string {

      var image = this.document.images.get(imageName);

      if (image == null) {
        return imageName;
      } else {
        return image.data;
      }
    }
  }

}


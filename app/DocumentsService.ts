///<reference path="DocumentWrapper.ts" />
///<reference path="application/files/FileSystem.ts" />
///<reference path="../emd/Serializer.ts" />

module EmbeddedMarkdown.Editor {

  /**
   * Contains the service layer for interacting with documents
   */
  export class DocumentsService {

    /**
     * The current document loaded
     */
    public current: DocumentWrapper;

    /**
     * Loads a file to become the current document
     * @file the file to loadSession to become the current document
     */
    public load(file: Application.Files.ITextFile): void {
      var doc = EmbeddedMarkdown.fromString(file.load());
      this.current = new DocumentWrapper(doc);
    }
  }
}
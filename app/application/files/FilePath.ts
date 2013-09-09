module Application.Files {

  /**
   * The path of a file split into multiple parts
   */
  export class FilePath {

    /**
     * Constructor
     * @param directory the directory of the file, without a trailing slash
     * @param name the name of the file that is being pointed to
     * @param extension the extension of the file
     */
     constructor(
        public directory: string,
        public name: string,
        public extension: string
        ) {
    }

    public toString(): string {
      var all = "";

      if (this.directory != null) {
        all = this.directory + "/";
      }

      if (this.name != null) {
        all += this.name;
      }

      if (this.extension != null) {
        all += "." + this.extension;
      }

      return all;
    }
  }

}